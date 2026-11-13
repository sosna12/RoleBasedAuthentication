import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../components/DashboardLayout";

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parsedDate);
};

const getInitials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const escapeCsv = (value) => {
  const text = String(value ?? "");
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;

  return `"${safeText.replaceAll('"', '""')}"`;
};

const ManagerDashboard = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data.users);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const counts = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === "admin").length,
      managers: users.filter((user) => user.role === "manager").length,
      members: users.filter((user) => user.role === "user").length,
      active: users.filter((user) => user.isActive !== false).length,
      inactive: users.filter((user) => user.isActive === false).length
    }),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active"
          ? user.isActive !== false
          : user.isActive === false);

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const downloadReport = () => {
    const reportRows = [
      ["Team report", new Date().toISOString()],
      ["Total registered users", counts.total],
      ["Administrators", counts.admins],
      ["Managers", counts.managers],
      ["Normal users", counts.members],
      ["Active accounts", counts.active],
      ["Inactive accounts", counts.inactive],
      [],
      ["Name", "Email", "Role", "Status", "Joined"],
      ...users.map((user) => [
        user.name,
        user.email,
        user.role,
        user.isActive === false ? "Inactive" : "Active",
        user.createdAt || ""
      ])
    ];
    const csv = reportRows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");

    link.href = url;
    link.download = `team-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <DashboardLayout title="Manager Workspace">
      <div className="manager-dashboard">
        <section className="manager-intro">
          <div>
            <p className="manager-eyebrow">TEAM OVERVIEW</p>
            <h2>Good to see you, manager</h2>
            <p>Review your team directory, monitor account activity, and export reports.</p>
          </div>
          <button
            className="manager-report-button"
            type="button"
            onClick={downloadReport}
            disabled={loading || users.length === 0}
          >
            <span aria-hidden="true">↓</span>
            Download report
          </button>
        </section>

        {error && <div className="alert error" role="alert">{error}</div>}

        <section className="manager-stats" aria-label="Team statistics">
          {[
            { label: "Registered users", value: counts.total, tone: "purple" },
            { label: "Managers", value: counts.managers, tone: "blue" },
            { label: "Normal users", value: counts.members, tone: "green" },
            { label: "Active accounts", value: counts.active, tone: "amber" }
          ].map((stat) => (
            <article className="manager-stat-card" key={stat.label}>
              <span className={`manager-stat-dot ${stat.tone}`} aria-hidden="true" />
              <div>
                <p>{stat.label}</p>
                <strong>{loading ? "—" : stat.value}</strong>
                <span className="manager-stat-caption">
                  {stat.label === "Active accounts"
                    ? `${counts.inactive} inactive`
                    : stat.label === "Registered users"
                      ? `${counts.admins} administrators`
                      : "Across all accounts"}
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="manager-directory">
          <div className="manager-directory-heading">
            <div>
              <h2>People</h2>
              <p>Browse registered accounts. Manager access is view-only.</p>
            </div>
            <span className="manager-count-chip">
              {loading ? "Loading…" : `${filteredUsers.length} shown`}
            </span>
          </div>

          <div className="manager-toolbar">
            <label className="manager-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name or email"
                aria-label="Search users by name or email"
              />
            </label>
            <label className="manager-filter">
              <span>Role</span>
              <select
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
                aria-label="Filter by role"
              >
                <option value="all">All roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </label>
            <label className="manager-filter">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="manager-empty">Loading team directory…</div>
          ) : filteredUsers.length === 0 ? (
            <div className="manager-empty">
              <strong>{users.length ? "No matching accounts" : "No users found"}</strong>
              <span>Try a different search or filter.</span>
            </div>
          ) : (
            <div className="manager-table-wrap">
              <table className="manager-table">
                <thead>
                  <tr>
                    <th scope="col">Person</th>
                    <th scope="col">Role</th>
                    <th scope="col">Status</th>
                    <th scope="col">Joined</th>
                    <th scope="col">Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="manager-person">
                          <span className="manager-avatar" aria-hidden="true">
                            {getInitials(user.name)}
                          </span>
                          <span>
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`manager-role ${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`manager-status ${user.isActive === false ? "inactive" : "active"}`}>
                          <i />
                          {user.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="manager-date">{formatDate(user.createdAt)}</td>
                      <td>
                        <button
                          className="manager-profile-button"
                          type="button"
                          onClick={() => setSelectedUser(user)}
                        >
                          View profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedUser && (
          <div className="manager-modal-backdrop" onClick={() => setSelectedUser(null)}>
            <section
              className="manager-profile-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="manager-profile-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="manager-modal-close"
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Close profile"
              >
                ×
              </button>
              <span className="manager-avatar large" aria-hidden="true">
                {getInitials(selectedUser.name)}
              </span>
              <p className="manager-eyebrow">TEAM PROFILE</p>
              <h2 id="manager-profile-title">{selectedUser.name}</h2>
              <dl className="manager-profile-details">
                <div><dt>Email</dt><dd>{selectedUser.email}</dd></div>
                <div><dt>Role</dt><dd className="capitalize">{selectedUser.role}</dd></div>
                <div>
                  <dt>Account status</dt>
                  <dd>{selectedUser.isActive === false ? "Inactive" : "Active"}</dd>
                </div>
                <div><dt>Member since</dt><dd>{formatDate(selectedUser.createdAt)}</dd></div>
                <div><dt>Last updated</dt><dd>{formatDate(selectedUser.updatedAt)}</dd></div>
              </dl>
              <p className="manager-readonly-note">
                Profile details are read-only. Contact an administrator for account changes.
              </p>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
