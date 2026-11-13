import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";

const roleOptions = ["admin", "manager", "user"];
const adminSections = [
  { id: "dashboard", label: "Dashboard", icon: "⌂" },
  { id: "users", label: "User management", icon: "♙" },
  { id: "roles", label: "Role management", icon: "◇" },
  { id: "accounts", label: "Account management", icon: "▣" },
  { id: "audit", label: "Audit logs", icon: "≋" }
];

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium"
  }).format(new Date(date));
};

const getInitials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [workingId, setWorkingId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data.users);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load users."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeSection !== "audit") return;

    const fetchAuditLogs = async () => {
      try {
        setAuditLoading(true);
        setAuditError("");
        const response = await api.get("/users/audit-logs?limit=100");
        setAuditLogs(response.data.logs);
      } catch (err) {
        setAuditError(err.response?.data?.message || "Unable to load audit logs.");
      } finally {
        setAuditLoading(false);
      }
    };

    fetchAuditLogs();
  }, [activeSection]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const isActive = user.isActive !== false;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? isActive : !isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const counts = useMemo(
    () => ({
      total: users.length,
      admin: users.filter((user) => user.role === "admin").length,
      manager: users.filter((user) => user.role === "manager").length,
      user: users.filter((user) => user.role === "user").length
    }),
    [users]
  );
  const accountCounts = useMemo(
    () => ({
      active: users.filter((user) => user.isActive !== false).length,
      inactive: users.filter((user) => user.isActive === false).length
    }),
    [users]
  );

  const handleRoleChange = async (userId, role) => {
    try {
      setError("");
      setMessage("");
      setWorkingId(userId);

      const response = await api.patch(`/users/${userId}/role`, { role });
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? { ...user, role: response.data.user.role }
            : user
        )
      );
      setSelectedUser((currentUser) =>
        currentUser?._id === userId
          ? { ...currentUser, role: response.data.user.role }
          : currentUser
      );
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user role.");
    } finally {
      setWorkingId(null);
    }
  };

  const handleStatusChange = async (user) => {
    const isActive = user.isActive === false;

    try {
      setError("");
      setMessage("");
      setWorkingId(user._id);

      const response = await api.patch(`/users/${user._id}/status`, {
        isActive
      });
      const updatedStatus = response.data.user.isActive;

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item._id === user._id ? { ...item, isActive: updatedStatus } : item
        )
      );
      setSelectedUser((currentUser) =>
        currentUser?._id === user._id
          ? { ...currentUser, isActive: updatedStatus }
          : currentUser
      );
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update account status.");
    } finally {
      setWorkingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setError("");
      setMessage("");
      setWorkingId(userToDelete._id);

      const response = await api.delete(`/users/${userToDelete._id}`);
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user._id !== userToDelete._id)
      );
      setSelectedUser((currentUser) =>
        currentUser?._id === userToDelete._id ? null : currentUser
      );
      setMessage(response.data.message);
      setUserToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete user.");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="admin-dashboard">
        <section className="admin-intro">
          <div>
            <p className="admin-eyebrow">
              {adminSections.find((section) => section.id === activeSection)?.label.toUpperCase()}
            </p>
            <h2>
              {activeSection === "dashboard" && "Manage your workspace"}
              {activeSection === "users" && "User management"}
              {activeSection === "roles" && "Role management"}
              {activeSection === "accounts" && "Account management"}
              {activeSection === "audit" && "Audit activity"}
            </h2>
            <p className="admin-description">
              {activeSection === "dashboard" && "Review users, permissions, account health, and recent administrative activity."}
              {activeSection === "users" && "Find user profiles and review each account’s access and status."}
              {activeSection === "roles" && "Assign role-based permissions to members of your organization."}
              {activeSection === "accounts" && "Activate, deactivate, or remove accounts with safeguards."}
              {activeSection === "audit" && "Review a chronological record of important account and access changes."}
            </p>
          </div>
          <div className="admin-intro-mark" aria-hidden="true">RB</div>
        </section>

        {error && <div className="alert error" role="alert">{error}</div>}
        {message && <div className="alert success" role="status">{message}</div>}

        <nav className="admin-section-nav" aria-label="Admin sections">
          {adminSections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={activeSection === section.id ? "active" : ""}
              aria-current={activeSection === section.id ? "page" : undefined}
              onClick={() => {
                setError("");
                setMessage("");
                setActiveSection(section.id);
              }}
            >
              <span aria-hidden="true">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>

        {activeSection === "dashboard" && (
        <section className="admin-stat-grid" aria-label="User totals">
          {[
            { label: "Total users", value: counts.total, icon: "U", tone: "violet" },
            { label: "Administrators", value: counts.admin, icon: "A", tone: "blue" },
            { label: "Managers", value: counts.manager, icon: "M", tone: "amber" },
            { label: "Normal users", value: counts.user, icon: "P", tone: "green" }
          ].map((stat) => (
            <article className="admin-stat-card" key={stat.label}>
              <span className={`admin-stat-icon ${stat.tone}`} aria-hidden="true">
                {stat.icon}
              </span>
              <div>
                <p>{stat.label}</p>
                <strong>{loading ? "—" : stat.value}</strong>
              </div>
            </article>
          ))}
        </section>
        )}

        {activeSection === "dashboard" && (
          <section className="admin-overview-grid">
            <article className="admin-overview-card">
              <span className="admin-overview-icon violet" aria-hidden="true">♙</span>
              <div>
                <h3>User management</h3>
                <p>Search profiles and review access across the team.</p>
                <button type="button" onClick={() => setActiveSection("users")}>
                  Open users <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
            <article className="admin-overview-card">
              <span className="admin-overview-icon blue" aria-hidden="true">◇</span>
              <div>
                <h3>Role management</h3>
                <p>Assign access levels and review role permissions.</p>
                <button type="button" onClick={() => setActiveSection("roles")}>
                  Manage roles <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
            <article className="admin-overview-card">
              <span className="admin-overview-icon amber" aria-hidden="true">▣</span>
              <div>
                <h3>Account health</h3>
                <p>{accountCounts.active} active · {accountCounts.inactive} inactive accounts</p>
                <button type="button" onClick={() => setActiveSection("accounts")}>
                  Review accounts <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
            <article className="admin-overview-card">
              <span className="admin-overview-icon green" aria-hidden="true">≋</span>
              <div>
                <h3>Audit logs</h3>
                <p>Track sign-ins and administrative account changes.</p>
                <button type="button" onClick={() => setActiveSection("audit")}>
                  View activity <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          </section>
        )}

        {["users", "roles", "accounts"].includes(activeSection) && (
        <section className="admin-users-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>
                {activeSection === "roles" ? "Assign roles" : activeSection === "accounts" ? "Account directory" : "User directory"}
              </h2>
              <p>
                {activeSection === "roles" && "Roles control which features each member can access."}
                {activeSection === "accounts" && "Review account status and manage account lifecycle."}
                {activeSection === "users" && "Search and review the people registered in your workspace."}
              </p>
            </div>
            <span className="admin-result-count">
              {loading ? "Loading…" : `${filteredUsers.length} ${filteredUsers.length === 1 ? "user" : "users"}`}
            </span>
          </div>

          <div className="admin-toolbar">
            <label className="admin-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search by name or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search users by name or email"
              />
            </label>

            <label className="admin-filter">
              <span>Role</span>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                aria-label="Filter users by role"
              >
                <option value="all">All roles</option>
                {roleOptions.map((role) => (
                  <option value={role} key={role}>
                    {role[0].toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-filter">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter users by status"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="admin-empty-state">Loading user directory…</div>
          ) : filteredUsers.length === 0 ? (
            <div className="admin-empty-state">
              <strong>{users.length ? "No matching users" : "No users yet"}</strong>
              <span>
                {users.length
                  ? "Try changing the search or filters."
                  : "Registered accounts will appear here."}
              </span>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">User</th>
                    {activeSection !== "accounts" && <th scope="col">Role</th>}
                    {activeSection !== "roles" && <th scope="col">Status</th>}
                    {activeSection !== "roles" && <th scope="col">Joined</th>}
                    <th scope="col">{activeSection === "accounts" ? "Account actions" : "Profile"}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isCurrentAdmin = String(user._id) === String(currentUser?.id);
                    const isActive = user.isActive !== false;
                    const isWorking = workingId === user._id;

                    return (
                      <tr key={user._id}>
                        <td>
                          <div className="admin-user-cell">
                            <span className="admin-avatar" aria-hidden="true">
                              {getInitials(user.name)}
                            </span>
                            <span className="admin-user-copy">
                              <strong>{user.name}</strong>
                              <span>{user.email}</span>
                            </span>
                          </div>
                        </td>
                        {activeSection !== "accounts" && <td>
                          {activeSection === "roles" ? (
                          <select
                            className="admin-role-select"
                            value={user.role}
                            disabled={isWorking || isCurrentAdmin}
                            onChange={(event) =>
                              handleRoleChange(user._id, event.target.value)
                            }
                            aria-label={`Change role for ${user.name}`}
                          >
                            {roleOptions.map((role) => (
                              <option value={role} key={role}>
                                {role[0].toUpperCase() + role.slice(1)}
                              </option>
                            ))}
                          </select>
                          ) : (
                            <span className={`role-badge ${user.role}`}>{user.role}</span>
                          )}
                        </td>}
                        {activeSection !== "roles" && <td>
                          <span className={`admin-status ${isActive ? "active" : "inactive"}`}>
                            <span />
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>}
                        {activeSection !== "roles" && <td className="admin-date">{formatDate(user.createdAt)}</td>}
                        <td>
                          <div className="admin-row-actions">
                            {activeSection !== "accounts" && (
                              <button
                                className="admin-action-button"
                                type="button"
                                onClick={() => setSelectedUser(user)}
                              >
                                Details
                              </button>
                            )}
                            {activeSection === "accounts" && <>
                            <button
                              className="admin-action-button"
                              type="button"
                              disabled={isWorking || isCurrentAdmin}
                              onClick={() => handleStatusChange(user)}
                            >
                              {isActive ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              className="admin-action-button danger"
                              type="button"
                              disabled={isWorking || isCurrentAdmin}
                              onClick={() => setUserToDelete(user)}
                            >
                              Delete
                            </button>
                            </>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        )}

        {activeSection === "roles" && (
          <section className="admin-role-guide">
            <div className="admin-panel-heading">
              <div>
                <h2>Role permissions</h2>
                <p>Use least-privilege access: assign only the permissions each person needs.</p>
              </div>
            </div>
            <div className="admin-role-cards">
              <article><span className="role-badge admin">Admin</span><p>Manage users, roles, accounts, and audit activity.</p></article>
              <article><span className="role-badge manager">Manager</span><p>View team members, team statistics, and reports.</p></article>
              <article><span className="role-badge user">User</span><p>Manage personal profile and password settings.</p></article>
            </div>
          </section>
        )}

        {activeSection === "audit" && (
          <section className="admin-users-panel admin-audit-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Recent activity</h2>
                <p>Latest 100 recorded authentication and account events.</p>
              </div>
              <span className="admin-result-count">{auditLogs.length} events</span>
            </div>
            {auditError && <div className="alert error admin-audit-error" role="alert">{auditError}</div>}
            {auditLoading ? (
              <div className="admin-empty-state">Loading audit activity…</div>
            ) : auditLogs.length === 0 && !auditError ? (
              <div className="admin-empty-state">
                <strong>No audit events yet</strong>
                <span>Account and access activity will be recorded here.</span>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table admin-audit-table">
                  <thead><tr><th scope="col">Event</th><th scope="col">Performed by</th><th scope="col">Target</th><th scope="col">Details</th><th scope="col">Date</th></tr></thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log._id}>
                        <td><span className="admin-audit-action">{log.action.replaceAll(".", " ")}</span></td>
                        <td><strong>{log.actorName}</strong><small>{log.actorEmail}</small></td>
                        <td>{log.targetName || "—"}{log.targetEmail && <small>{log.targetEmail}</small>}</td>
                        <td>{log.details || "—"}</td>
                        <td className="admin-date">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(log.createdAt))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>

      {selectedUser && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <section
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="admin-modal-close"
              type="button"
              onClick={() => setSelectedUser(null)}
              aria-label="Close user details"
            >
              ×
            </button>
            <span className="admin-avatar large" aria-hidden="true">
              {getInitials(selectedUser.name)}
            </span>
            <p className="admin-eyebrow">ACCOUNT DETAILS</p>
            <h2 id="user-details-title">{selectedUser.name}</h2>
            <dl className="admin-details-list">
              <div><dt>Email</dt><dd>{selectedUser.email}</dd></div>
              <div><dt>Role</dt><dd>{selectedUser.role}</dd></div>
              <div>
                <dt>Status</dt>
                <dd>{selectedUser.isActive === false ? "Inactive" : "Active"}</dd>
              </div>
              <div><dt>Joined</dt><dd>{formatDate(selectedUser.createdAt)}</dd></div>
              <div><dt>Last updated</dt><dd>{formatDate(selectedUser.updatedAt)}</dd></div>
              <div><dt>Account ID</dt><dd className="admin-id-value">{selectedUser._id}</dd></div>
            </dl>
          </section>
        </div>
      )}

      {userToDelete && (
        <div className="admin-modal-backdrop" onClick={() => setUserToDelete(null)}>
          <section
            className="admin-modal admin-confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="admin-delete-mark" aria-hidden="true">!</span>
            <h2 id="delete-user-title">Delete this account?</h2>
            <p>
              <strong>{userToDelete.name}</strong> will be permanently removed.
              This action cannot be undone.
            </p>
            <div className="admin-confirm-actions">
              <button
                className="admin-action-button"
                type="button"
                disabled={workingId === userToDelete._id}
                onClick={() => setUserToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="admin-delete-button"
                type="button"
                disabled={workingId === userToDelete._id}
                onClick={handleDeleteUser}
              >
                {workingId === userToDelete._id ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
