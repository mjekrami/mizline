"use client";

import type { StaffMember } from "@mizline/shared";
import { Loader2, Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  createStaffMember,
  deleteStaffMember,
  fetchStaffMembers,
  updateStaffMember,
} from "@/lib/api/staff";
import { loadAuthSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

type StaffFormState = {
  name: string;
  email: string;
  role: StaffMember["role"];
  password: string;
};

type StaffEditFormState = Pick<StaffFormState, "name" | "role" | "password">;

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2";

const emptyCreateForm: StaffFormState = {
  email: "",
  name: "",
  role: "waiter",
  password: "",
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function StaffRoleSelect({
  value,
  onChange,
}: {
  value: StaffMember["role"];
  onChange: (role: StaffMember["role"]) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value as StaffMember["role"])
      }
      className={inputClass}
    >
      <option value="waiter">Waiter</option>
      <option value="manager">Manager</option>
    </select>
  );
}

function StaffModal({
  title,
  onClose,
  onSubmit,
  saving,
  submitLabel,
  children,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  saving: boolean;
  submitLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {children}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            {saving ? "Saving…" : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

export function StaffPanel() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editForm, setEditForm] = useState<StaffEditFormState>({
    name: "",
    role: "waiter",
    password: "",
  });

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStaff(await fetchStaffMembers());
    } catch (loadError) {
      setError(errorMessage(loadError, "Failed to load staff"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
    void loadAuthSession().then((user) => setCurrentUserId(user?.id ?? null));
  }, [loadStaff]);

  function openEdit(member: StaffMember) {
    setEditingMember(member);
    setEditForm({
      name: member.name,
      role: member.role,
      password: "",
    });
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createStaffMember(createForm);
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      await loadStaff();
    } catch (createError) {
      setError(errorMessage(createError, "Failed to create staff"));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(event: React.FormEvent) {
    event.preventDefault();
    if (!editingMember) return;

    setSaving(true);
    setError(null);

    try {
      await updateStaffMember(editingMember.id, {
        name: editForm.name.trim(),
        role: editForm.role,
        ...(editForm.password.trim()
          ? { password: editForm.password.trim() }
          : {}),
      });
      setEditingMember(null);
      await loadStaff();
    } catch (updateError) {
      setError(errorMessage(updateError, "Failed to update staff"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(member: StaffMember) {
    try {
      await updateStaffMember(member.id, { active: !member.active });
      await loadStaff();
    } catch (toggleError) {
      setError(errorMessage(toggleError, "Failed to update staff"));
    }
  }

  async function handleDelete(member: StaffMember) {
    if (member.id === currentUserId) {
      setError("You cannot remove your own account.");
      return;
    }

    if (
      !window.confirm(
        `Remove "${member.name}" from this store? They will lose access here.`,
      )
    ) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await deleteStaffMember(member.id);
      await loadStaff();
    } catch (deleteError) {
      setError(errorMessage(deleteError, "Failed to remove staff"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Staff</h2>
          <p className="text-sm text-muted-foreground">
            Manage waiters and managers for this store.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground"
        >
          <Plus className="size-4" />
          Add staff
        </button>
      </div>

      {error ? (
        <p className="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading staff…
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    <span className="inline-flex items-center gap-2">
                      <UsersRound className="size-4" />
                      No staff members yet.
                    </span>
                  </td>
                </tr>
              ) : (
                staff.map((member) => (
                  <tr key={member.id} className="border-b border-border/70">
                    <td className="px-4 py-3 font-medium">{member.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {member.email}
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {member.role.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void toggleActive(member)}
                        disabled={saving || member.id === currentUserId}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-60",
                          member.active
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {member.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(member)}
                          disabled={saving}
                          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-60"
                          aria-label={`Edit ${member.name}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(member)}
                          disabled={saving || member.id === currentUserId}
                          className="rounded-md p-1 text-muted-foreground hover:bg-error/10 hover:text-error disabled:opacity-60"
                          aria-label={`Remove ${member.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {createOpen ? (
        <StaffModal
          title="Add staff member"
          onClose={() => setCreateOpen(false)}
          onSubmit={(event) => void handleCreate(event)}
          saving={saving}
          submitLabel="Create"
        >
          <label className="block space-y-1 text-sm">
            <span>Name</span>
            <input
              required
              value={createForm.name}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className={inputClass}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Email</span>
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className={inputClass}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Role</span>
            <StaffRoleSelect
              value={createForm.role}
              onChange={(role) =>
                setCreateForm((current) => ({ ...current, role }))
              }
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Initial password</span>
            <input
              type="password"
              required
              minLength={6}
              value={createForm.password}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className={inputClass}
            />
          </label>
        </StaffModal>
      ) : null}

      {editingMember ? (
        <StaffModal
          title={`Edit ${editingMember.name}`}
          onClose={() => setEditingMember(null)}
          onSubmit={(event) => void handleUpdate(event)}
          saving={saving}
          submitLabel="Save changes"
        >
          <p className="text-sm text-muted-foreground">{editingMember.email}</p>
          <label className="block space-y-1 text-sm">
            <span>Name</span>
            <input
              required
              value={editForm.name}
              onChange={(event) =>
                setEditForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className={inputClass}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>Role</span>
            <StaffRoleSelect
              value={editForm.role}
              onChange={(role) =>
                setEditForm((current) => ({ ...current, role }))
              }
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span>New password</span>
            <input
              type="password"
              minLength={6}
              value={editForm.password}
              onChange={(event) =>
                setEditForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              placeholder="Leave blank to keep current"
              className={inputClass}
            />
          </label>
        </StaffModal>
      ) : null}
    </div>
  );
}
