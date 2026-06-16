"use client";

import type { StaffMember } from "@mizline/shared";
import { Loader2, Plus, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  createStaffMember,
  fetchStaffMembers,
  updateStaffMember,
} from "@/lib/api/staff";
import { cn } from "@/lib/utils";

export function StaffPanel() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    role: "barista" as StaffMember["role"],
    password: "",
  });

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStaff(await fetchStaffMembers());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load staff",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await createStaffMember(form);
      setDialogOpen(false);
      setForm({ email: "", name: "", role: "barista", password: "" });
      await loadStaff();
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : "Failed to create staff",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(member: StaffMember) {
    try {
      await updateStaffMember(member.id, { active: !member.active });
      await loadStaff();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error ? toggleError.message : "Failed to update staff",
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Staff</h2>
          <p className="text-sm text-muted-foreground">
            Manage baristas and managers for this store.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
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
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member.id} className="border-t border-border">
                  <td className="px-4 py-3">{member.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{member.email}</td>
                  <td className="px-4 py-3 capitalize">{member.role.replace("_", " ")}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void toggleActive(member)}
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        member.active
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {member.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-8 text-sm text-muted-foreground">
              <UsersRound className="size-4" />
              No staff members yet.
            </div>
          ) : null}
        </div>
      )}

      {dialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={(event) => void handleCreate(event)}
            className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6"
          >
            <h3 className="text-lg font-semibold">Add staff member</h3>
            <label className="block space-y-1 text-sm">
              <span>Name</span>
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>Role</span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    role: event.target.value as StaffMember["role"],
                  }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="barista">Barista</option>
                <option value="manager">Manager</option>
              </select>
            </label>
            <label className="block space-y-1 text-sm">
              <span>Initial password</span>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground disabled:opacity-60"
              >
                {saving ? "Saving…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
