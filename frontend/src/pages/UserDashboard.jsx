import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import { useAuth } from "../context/AuthContext";

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(parsedDate);
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { updateUser, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");
        setProfile(response.data.user);
        setProfileForm({
          name: response.data.user.name,
          email: response.data.user.email
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (event) => {
    setProfileForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSavingProfile(true);
      const response = await api.patch("/users/profile", profileForm);
      setProfile(response.data.user);
      setProfileForm({
        name: response.data.user.name,
        email: response.data.user.email
      });
      updateUser(response.data.user);
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update your profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (event) => {
    setPasswordForm((currentForm) => ({
      ...currentForm,
      [event.target.name]: event.target.value
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    try {
      setSavingPassword(true);
      const response = await api.patch("/users/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change your password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const changeSection = (section) => {
    setError("");
    setSuccess("");
    setActiveSection(section);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const sectionTitles = {
    dashboard: "User Dashboard",
    profile: "My Profile",
    password: "Change Password",
    settings: "Account Settings"
  };

  return (
    <DashboardLayout title={sectionTitles[activeSection]}>
      <div className="account-page">
        <div className="account-heading">
          <div>
            <p className="account-eyebrow">
              {activeSection === "dashboard" ? "YOUR WORKSPACE" : "YOUR ACCOUNT"}
            </p>
            <h2>
              {activeSection === "dashboard" && `Welcome back${profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}`}
              {activeSection === "profile" && "Your profile"}
              {activeSection === "password" && "Keep your account secure"}
              {activeSection === "settings" && "Account settings"}
            </h2>
            <p>
              {activeSection === "dashboard" && "Your account at a glance. Manage your profile and security from one place."}
              {activeSection === "profile" && "Update the personal information connected to your account."}
              {activeSection === "password" && "Change your password using your current credentials."}
              {activeSection === "settings" && "Review your role, account status, and session options."}
            </p>
          </div>
          <span className="account-avatar" aria-hidden="true">
            {(profile?.name || "U")
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0].toUpperCase())
              .join("")}
          </span>
        </div>

        <nav className="account-tabs" aria-label="User pages">
          <button
            type="button"
            aria-current={activeSection === "dashboard" ? "page" : undefined}
            className={activeSection === "dashboard" ? "active" : ""}
            onClick={() => changeSection("dashboard")}
          >
            <span aria-hidden="true">⌂</span> Dashboard
          </button>
          <button
            type="button"
            aria-current={activeSection === "profile" ? "page" : undefined}
            className={activeSection === "profile" ? "active" : ""}
            onClick={() => changeSection("profile")}
          >
            <span aria-hidden="true">♙</span> My profile
          </button>
          <button
            type="button"
            aria-current={activeSection === "password" ? "page" : undefined}
            className={activeSection === "password" ? "active" : ""}
            onClick={() => changeSection("password")}
          >
            <span aria-hidden="true">◇</span> Change password
          </button>
          <button
            type="button"
            aria-current={activeSection === "settings" ? "page" : undefined}
            className={activeSection === "settings" ? "active" : ""}
            onClick={() => changeSection("settings")}
          >
            <span aria-hidden="true">⚙</span> Account settings
          </button>
        </nav>

        {error && <div className="alert error" role="alert">{error}</div>}
        {success && <div className="alert success" role="status">{success}</div>}

        {loading ? (
          <section className="account-panel account-loading">Loading your account…</section>
        ) : profile ? (
          activeSection === "dashboard" ? (
            <div className="user-overview">
              <section className="user-overview-stats">
                <article className="user-overview-card">
                  <span className="user-overview-icon violet" aria-hidden="true">♙</span>
                  <div><small>Account role</small><strong className="capitalize">{profile.role}</strong></div>
                </article>
                <article className="user-overview-card">
                  <span className="user-overview-icon green" aria-hidden="true">✓</span>
                  <div><small>Account status</small><strong>Active</strong></div>
                </article>
                <article className="user-overview-card">
                  <span className="user-overview-icon blue" aria-hidden="true">◷</span>
                  <div><small>Member since</small><strong>{formatDate(profile.createdAt)}</strong></div>
                </article>
              </section>

              <section className="account-content-grid">
                <article className="account-panel user-profile-preview">
                  <div className="account-panel-heading">
                    <div><h3>Profile overview</h3><p>Your information and account access.</p></div>
                    <button className="user-text-link" type="button" onClick={() => changeSection("profile")}>Edit profile →</button>
                  </div>
                  <dl className="account-details">
                    <div><dt>Full name</dt><dd>{profile.name}</dd></div>
                    <div><dt>Email address</dt><dd>{profile.email}</dd></div>
                    <div><dt>Role</dt><dd><span className={`account-role ${profile.role}`}>{profile.role}</span></dd></div>
                  </dl>
                </article>
                <article className="account-panel user-security-card">
                  <span className="user-overview-icon violet" aria-hidden="true">◇</span>
                  <h3>Account security</h3>
                  <p>Keep your account protected by using a strong, unique password.</p>
                  <button className="account-primary-button" type="button" onClick={() => changeSection("password")}>
                    Change password
                  </button>
                </article>
              </section>
            </div>
          ) : activeSection === "profile" ? (
            <div className="account-content-grid">
              <section className="account-panel">
                <div className="account-panel-heading">
                  <div>
                    <h3>Personal information</h3>
                    <p>Update the name and email address associated with your account.</p>
                  </div>
                </div>

                <form className="account-form" onSubmit={handleProfileSubmit}>
                  <div className="account-form-grid">
                    <label className="account-field">
                      <span>Full name</span>
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        minLength={2}
                        maxLength={50}
                        autoComplete="name"
                        required
                      />
                    </label>
                    <label className="account-field">
                      <span>Email address</span>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        autoComplete="email"
                        required
                      />
                    </label>
                  </div>
                  <div className="account-form-actions">
                    <button className="account-primary-button" type="submit" disabled={savingProfile}>
                      {savingProfile ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="account-panel account-summary-panel">
                <div className="account-panel-heading">
                  <div>
                    <h3>Account overview</h3>
                    <p>Your current account details.</p>
                  </div>
                </div>
                <dl className="account-details">
                  <div>
                    <dt>Account role</dt>
                    <dd><span className={`account-role ${profile.role}`}>{profile.role}</span></dd>
                  </div>
                  <div>
                    <dt>Member since</dt>
                    <dd>{formatDate(profile.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Account status</dt>
                    <dd><span className="account-active"><i />Active</span></dd>
                  </div>
                </dl>
                <p className="account-role-note">
                  Your role controls which areas of the application you can access.
                  Contact an administrator if you believe it needs to change.
                </p>
              </section>
            </div>
          ) : activeSection === "password" ? (
            <section className="account-panel account-security-panel">
              <div className="account-panel-heading">
                <div>
                  <h3>Change password</h3>
                  <p>Verify your current password before choosing a new one.</p>
                </div>
                <span className="account-security-icon" aria-hidden="true">⌑</span>
              </div>
              <form className="account-form account-password-form" onSubmit={handlePasswordSubmit}>
                <label className="account-field">
                  <span>Current password</span>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    required
                  />
                </label>
                <div className="account-form-grid">
                  <label className="account-field">
                    <span>New password</span>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />
                    <small>Use at least 8 characters.</small>
                  </label>
                  <label className="account-field">
                    <span>Confirm new password</span>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />
                  </label>
                </div>
                <div className="account-form-actions">
                  <button className="account-primary-button" type="submit" disabled={savingPassword}>
                    {savingPassword ? "Updating…" : "Update password"}
                  </button>
                </div>
              </form>
            </section>
          ) : (
            <div className="account-content-grid user-settings-grid">
              <section className="account-panel">
                <div className="account-panel-heading">
                  <div><h3>Account information</h3><p>Details associated with your account.</p></div>
                </div>
                <dl className="account-details">
                  <div><dt>Full name</dt><dd>{profile.name}</dd></div>
                  <div><dt>Email address</dt><dd>{profile.email}</dd></div>
                  <div><dt>Account role</dt><dd><span className={`account-role ${profile.role}`}>{profile.role}</span></dd></div>
                  <div><dt>Account status</dt><dd><span className="account-active"><i />Active</span></dd></div>
                  <div><dt>Created</dt><dd>{formatDate(profile.createdAt)}</dd></div>
                  <div><dt>Last updated</dt><dd>{formatDate(profile.updatedAt)}</dd></div>
                </dl>
                <p className="account-role-note">
                  Role assignments are managed by an administrator. Contact your administrator if you need different access.
                </p>
              </section>

              <section className="account-panel user-settings-security">
                <span className="user-overview-icon violet" aria-hidden="true">◇</span>
                <h3>Password & security</h3>
                <p>Update your password regularly and never share it with anyone.</p>
                <button className="account-primary-button" type="button" onClick={() => changeSection("password")}>
                  Change password
                </button>
                <div className="user-session-box">
                  <strong>Current session</strong>
                  <span><i />Signed in and active</span>
                </div>
                <button className="user-logout-button" type="button" onClick={handleLogout}>
                  <span aria-hidden="true">↗</span> Log out of this session
                </button>
              </section>
            </div>
          )
        ) : null}

        {activeSection !== "settings" && <aside className="account-logout-hint">
          <span className="account-logout-symbol" aria-hidden="true">↗</span>
          <span>
            <strong>Finished for now?</strong>
            <small>Use the Logout button in the header to securely end this session.</small>
          </span>
        </aside>}
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
