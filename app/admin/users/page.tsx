"use client";
import { useEffect, useState, useMemo } from "react";
import { Save, X } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  isAdmin: boolean;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<Record<string, Partial<User>>>(
    {}
  );
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => setUsers(data || []))
      .catch(() => {
        // handle fetch error if needed
      });
  }, []);

  // debounce the search input
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  const handleChange = (id: string, field: keyof User, value: string | boolean) => {
    setEditingUser((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const hasChanges = (id: string) => {
    const original = users.find((u) => u.id === id);
    const edited = editingUser[id];
    if (!edited || !original) return false;
    return Object.entries(edited).some(([k, v]) => {
      return original[k as keyof User] !== v;
    });
  };

  const handleSave = async (id: string) => {
    if (!hasChanges(id)) return;
    const updatedPartial = editingUser[id];
    if (!updatedPartial) return;

    const original = users.find((u) => u.id === id);
    if (!original) return;

    const payload = { ...original, ...updatedPartial };

    setSavingIds((s) => new Set(s).add(id));
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? (payload as User) : u))
        );
        setEditingUser((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      } else {
        console.error("Failed to update user");
      }
    } catch (e) {
      console.error("Update error", e);
    } finally {
      setSavingIds((s) => {
        const copy = new Set(s);
        copy.delete(id);
        return copy;
      });
    }
  };

  // merge edits on top of original
  const mergedUsers = useMemo(() => {
    return users.map((u) => ({
      ...u,
      ...editingUser[u.id],
    }));
  }, [users, editingUser]);

  // filtered by search query
  const filteredUsers = useMemo(() => {
    if (!debouncedQuery) return mergedUsers;
    return mergedUsers.filter((u) => {
      return (
        u.name.toLowerCase().includes(debouncedQuery) ||
        u.email.toLowerCase().includes(debouncedQuery) ||
        u.mobile.toLowerCase().includes(debouncedQuery)
      );
    });
  }, [mergedUsers, debouncedQuery]);

  const clearSearch = () => setQuery("");

  return (
    <div className="p-6 min-h-screen bg-gray-50 mt-20">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-3xl font-bold">Manage Users</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <input
                aria-label="Search users"
                placeholder="Search by name, email, mobile"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border rounded px-3 py-2 pr-10 text-sm focus:ring-1 focus:ring-blue-500"
              />
              {query && (
                <button
                  aria-label="Clear search"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Mobile
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.map((user) => {
                const edited: User = user as User;
                const dirty = hasChanges(user.id);
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors even:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <input
                        className="w-full border rounded px-2 py-1 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500"
                        value={edited.name}
                        onChange={(e) =>
                          handleChange(user.id, "name", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className="w-full border rounded px-2 py-1 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500"
                        value={edited.email}
                        onChange={(e) =>
                          handleChange(user.id, "email", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className="w-full border rounded px-2 py-1 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500"
                        value={edited.mobile}
                        onChange={(e) =>
                          handleChange(user.id, "mobile", e.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <label className="flex items-center space-x-2 text-sm text-gray-900">
                        <input
                          type="checkbox"
                          checked={edited.isAdmin}
                          onChange={(e) =>
                            handleChange(user.id, "isAdmin", e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span>{edited.isAdmin ? "Admin" : "Customer"}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSave(user.id)}
                        disabled={!dirty || savingIds.has(user.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded ${
                          dirty
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        } transition`}
                      >
                        <Save size={14} />
                        {savingIds.has(user.id) ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden flex flex-col gap-4">
          {filteredUsers.map((user) => {
            const edited: User = user as User;
            const dirty = hasChanges(user.id);
            return (
              <div
                key={user.id}
                className="bg-white shadow rounded-lg p-4 flex flex-col gap-4 border border-gray-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 grid grid-cols-1 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">
                        Name
                      </label>
                      <input
                        className="w-full border rounded px-2 py-1 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500"
                        value={edited.name}
                        onChange={(e) =>
                          handleChange(user.id, "name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">
                        Email
                      </label>
                      <input
                        className="w-full border rounded px-2 py-1 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500"
                        value={edited.email}
                        onChange={(e) =>
                          handleChange(user.id, "email", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">
                        Mobile
                      </label>
                      <input
                        className="w-full border rounded px-2 py-1 text-sm text-gray-900 focus:ring-1 focus:ring-blue-500"
                        value={edited.mobile}
                        onChange={(e) =>
                          handleChange(user.id, "mobile", e.target.value)
                        }
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">
                        Role
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={edited.isAdmin}
                          onChange={(e) =>
                            handleChange(user.id, "isAdmin", e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <span>{edited.isAdmin ? "Admin" : "Customer"}</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600">
                        Joined
                      </label>
                      <div className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave(user.id)}
                    disabled={!dirty || savingIds.has(user.id)}
                    className={`inline-flex items-center gap-1 px-4 py-2 text-sm rounded ${
                      dirty
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    } transition`}
                  >
                    <Save size={14} />
                    {savingIds.has(user.id) ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            );
          })}
          {filteredUsers.length === 0 && (
            <div className="text-center text-sm text-gray-500">
              No users match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
