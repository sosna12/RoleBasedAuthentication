import { Link } from "react-router-dom";

const AuthLayout = ({ children, eyebrow, title, description }) => (
  <main className="auth-page">
    <div className="auth-shell">
      <section className="auth-form-panel">
        <Link className="auth-brand" to="/" aria-label="AuthSystem home">
          <span className="auth-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M16 3.5 27 9.75v12.5L16 28.5 5 22.25V9.75L16 3.5Z" />
              <path d="m10.5 16 3.6 3.6 7.6-8" />
            </svg>
          </span>
          <span>Auth<span>System</span></span>
        </Link>

        <div className="auth-form-content">
          <div className="auth-heading">
            <p className="auth-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
        </div>

        <footer className="auth-legal">
          <span>© AuthSystem</span>
          <span>Secure access for every role</span>
        </footer>
      </section>

      <aside className="auth-showcase">
        <div className="auth-showcase-orb orb-one" />
        <div className="auth-showcase-orb orb-two" />
        <div className="auth-showcase-grid" />
        <div className="auth-showcase-content">
          <span className="auth-showcase-label">
            <span className="auth-live-dot" />
            ROLE-BASED ACCESS
          </span>
          <h2>One secure space.<br />The right access.</h2>
          <p>
            A clearer way to manage your work, your team, and every account in
            your organization.
          </p>

          <div className="auth-preview" aria-label="Role-based access overview">
            <div className="auth-preview-top">
              <span className="auth-preview-logo">Workspace</span>
              <span className="auth-preview-menu">•••</span>
            </div>
            <div className="auth-preview-body">
              <div className="auth-preview-copy">
                <span>YOUR WORKSPACE</span>
                <strong>Everything in<br />its right place.</strong>
              </div>
              <div className="auth-preview-art" aria-hidden="true">
                <span className="preview-ring ring-one" />
                <span className="preview-ring ring-two" />
                <span className="preview-shield">
                  <svg viewBox="0 0 32 32" fill="none">
                    <path d="M16 3.5 26 7v8.2c0 6.1-4.1 10.8-10 13.3-5.9-2.5-10-7.2-10-13.3V7l10-3.5Z" />
                    <path d="m11.5 15.8 3 3 6-6.2" />
                  </svg>
                </span>
              </div>
            </div>
            <div className="auth-preview-footer">
              <span><i className="preview-dot violet" /> Admin</span>
              <span><i className="preview-dot cyan" /> Manager</span>
              <span><i className="preview-dot green" /> Member</span>
            </div>
          </div>

          <div className="auth-showcase-note">
            <span className="auth-note-icon" aria-hidden="true">✓</span>
            <span>
              <strong>Built around your role</strong>
              <small>Your access stays focused and protected.</small>
            </span>
          </div>
        </div>
        <span className="auth-showcase-footer">AUTHENTICATED. AUTHORIZED. READY.</span>
      </aside>
    </div>
  </main>
);

export default AuthLayout;
