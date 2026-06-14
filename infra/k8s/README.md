# Mizline Kubernetes

Production-oriented Kubernetes layout for the Mizline monorepo using **Kustomize**.

## Architecture

```text
Ingress (nginx)
  ├── api.mizline.local  → API Deployment (HA, HPA, PDB)
  ├── order.mizline.local → Customer Deployment (HA, HPA, PDB)
  └── kitchen.mizline.local → Kitchen Deployment (HA, HPA, PDB)

API → Postgres (StatefulSet + PVC) + Redis (Deployment + PVC)
```

| Component | HA strategy |
|-----------|-------------|
| API, Customer, Kitchen | 2+ replicas, rolling updates, PDB, HPA |
| Postgres | Single StatefulSet + PVC (see DB HA note below) |
| Redis | Single replica + PVC (AOF persistence) |
| Ingress | nginx + sticky sessions for Socket.IO |

## Prerequisites

- Kubernetes 1.28+
- `kubectl`, `kustomize` (or `kubectl apply -k`)
- [ingress-nginx](https://kubernetes.github.io/ingress-nginx/deploy/)
- Optional: cert-manager for TLS in production overlay
- Optional: metrics-server for HPA

### Local cluster (minikube / k3s)

```bash
# minikube
minikube start --cpus=4 --memory=8192
minikube addons enable ingress

# k3s ships with Traefik; switch to nginx or patch ingressClassName
```

Add hosts (or use `/etc/hosts`):

```text
127.0.0.1 api.mizline.local order.mizline.local kitchen.mizline.local
```

For minikube ingress, point hosts to `minikube ip`.

## Build images

`NEXT_PUBLIC_*` variables are baked in at **build time** for Next.js apps.

```bash
chmod +x infra/k8s/scripts/build-images.sh
./infra/k8s/scripts/build-images.sh

# Production URLs
NEXT_PUBLIC_API_URL=https://api.mizline.ir \
NEXT_PUBLIC_CUSTOMER_URL=https://order.mizline.ir \
./infra/k8s/scripts/build-images.sh
```

Load into minikube:

```bash
minikube image load mizline/api:latest
minikube image load mizline/customer:latest
minikube image load mizline/kitchen:latest
```

## Deploy

```bash
# Local overlay (static PV/PVC, *.mizline.local hosts)
./infra/k8s/scripts/deploy.sh local

# Production overlay (dynamic gp3 volumes, mizline.ir hosts, TLS)
./infra/k8s/scripts/deploy.sh production
```

Before production:

1. Edit `infra/k8s/base/secrets/mizline-secrets.yaml` or replace with Sealed Secrets / External Secrets.
2. Patch `infra/k8s/overlays/production/patches/ingress.yaml` with real domains.
3. Patch `storageClassName` in `overlays/production/patches/storage.yaml` for your cloud (e.g. `gp3`, `standard`, `managed-csi`).

## Storage (PV / PVC)

**Local overlay** uses static provisioning:

- `StorageClass`: `mizline-local` (no provisioner, `WaitForFirstConsumer`)
- `PersistentVolume`: `mizline-postgres-pv` (10Gi hostPath)
- `PersistentVolume`: `mizline-redis-pv` (2Gi hostPath)
- Postgres: `volumeClaimTemplates` → `data-postgres-0`
- Redis: PVC `redis-data`

**Production overlay** removes static PVs and uses dynamic provisioning (`gp3` by default).

## Database migrations & seed

Migrations run automatically via an API **init container** (`prisma migrate deploy`) on each rollout.

Seed demo data once after first deploy:

```bash
kubectl -n mizline apply -f infra/k8s/base/jobs/db-seed.yaml
kubectl -n mizline wait --for=condition=complete job/db-seed --timeout=120s
kubectl -n mizline logs job/db-seed
```

Copy printed store/table IDs into kitchen env / customer build args for demos.

## Verify

```bash
kubectl -n mizline get pods,svc,ingress,pvc,pv
curl -s http://api.mizline.local/api/health
```

## High availability notes

### Application tier

- Stateless apps run **2–3+ replicas** with `maxUnavailable: 0` rolling updates.
- **PodDisruptionBudget** keeps at least one pod during node drains.
- **HPA** scales on CPU (70%) between min 2 / max 6 (production: min 3 / max 10).

### Socket.IO

Multiple API pods require either:

- Ingress **session affinity** (enabled in `ingress/ingress.yaml`), or
- A Redis Socket.IO adapter (future work).

### Postgres HA

The bundled Postgres StatefulSet is **single-instance** with durable storage. For true DB HA use:

- Managed Postgres (RDS, Cloud SQL, Azure Database)
- [CloudNativePG](https://cloudnative-pg.io/) operator
- Patroni / Zalando postgres operator

Point `DATABASE_URL` in secrets to the external database and remove the in-cluster Postgres resources.

### Redis HA

Single Redis with AOF is sufficient for MVP. For HA queues/realtime scaling, use Redis Sentinel or a managed Redis service.

## File layout

```text
infra/k8s/
├── base/                    # Shared manifests
│   ├── api/                 # Deployment, Service, HPA, PDB
│   ├── customer/
│   ├── kitchen/
│   ├── postgres/            # StatefulSet, headless Service
│   ├── redis/
│   ├── storage/             # StorageClass, PV
│   ├── ingress/
│   ├── secrets/
│   ├── configmaps/
│   ├── network-policies/
│   └── jobs/db-seed.yaml    # Apply manually
├── overlays/
│   ├── local/
│   └── production/
└── scripts/
    ├── build-images.sh
    └── deploy.sh
```

## Docker images

| Image | Dockerfile |
|-------|------------|
| `mizline/api` | `apps/api/Dockerfile` |
| `mizline/customer` | `apps/customer/Dockerfile` |
| `mizline/kitchen` | `apps/kitchen/Dockerfile` |

API reads `CORS_ORIGINS` from ConfigMap (comma-separated). Match your ingress host URLs.
