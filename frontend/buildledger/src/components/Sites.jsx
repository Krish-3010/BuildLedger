import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../utils/Header";
import { useAuth } from "../utils/AuthContext.jsx";
import { fetchSites, createSite, updateSite, deleteSite } from "../utils/api.js";
import "./Sites.css";

const EMPTY_FORM = {
  name: "",
  address: "",
  active: true,
  budget: "",
};

function SiteFormModal({ site, onClose, onSaved }) {
  const isEdit = Boolean(site?.id);
  const [form, setForm] = useState(
    site
      ? { name: site.name || "", address: site.address || "", active: site.active ?? true, budget: site.budget ?? "" }
      : { ...EMPTY_FORM }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Site name is required."); return; }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        active: form.active,
        budget: form.budget !== "" ? Number(form.budget) : null,
      };
      let saved;
      if (isEdit) {
        saved = await updateSite(site.id, payload);
      } else {
        saved = await createSite(payload);
      }
      onSaved(saved, isEdit);
    } catch (err) {
      setError(err.message || "Failed to save site.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card site-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? "Edit Site" : "Add New Site"}</h3>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="form-modal-error">⚠️ {error}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="sf-name">Site Name *</label>
            <input
              id="sf-name"
              name="name"
              type="text"
              placeholder="e.g. Sharma Residence"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sf-address">Address</label>
            <input
              id="sf-address"
              name="address"
              type="text"
              placeholder="e.g. 12 MG Road, Mumbai"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="sf-budget">Budget (₹)</label>
            <input
              id="sf-budget"
              name="budget"
              type="number"
              min="0"
              placeholder="e.g. 1500000"
              value={form.budget}
              onChange={handleChange}
            />
          </div>

          <div className="form-group form-group-inline">
            <input
              id="sf-active"
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={handleChange}
            />
            <label htmlFor="sf-active">Active site</label>
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-save-btn" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ siteName, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Site</h3>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p className="delete-confirm-text">
            Are you sure you want to delete <strong>&ldquo;{siteName}&rdquo;</strong>? This action cannot be undone.
          </p>
        </div>
        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-delete-btn" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Sites() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editSite, setEditSite] = useState(null);
  const [deletingSite, setDeletingSite] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadSites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSites();
      setSites(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadSites();
  }, [isAuthenticated, navigate]);

  const handleSaved = (savedSite, isEdit) => {
    if (isEdit) {
      setSites((prev) => prev.map((s) => (s.id === savedSite.id ? savedSite : s)));
      setEditSite(null);
    } else {
      setSites((prev) => [savedSite, ...prev]);
      setShowAddModal(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSite) return;
    setDeleteLoading(true);
    try {
      await deleteSite(deletingSite.id);
      setSites((prev) => prev.filter((s) => s.id !== deletingSite.id));
      setDeletingSite(null);
    } catch (err) {
      alert("Failed to delete site: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="sites-page">
        <div className="sites-header">
          <div>
            <h1>My <span>Sites</span></h1>
          </div>
          <button className="create-site-btn" onClick={() => setShowAddModal(true)}>
            + Add New Site
          </button>
        </div>

        {loading ? (
          <div className="sites-status-card">
            <div className="spinner"></div>
            <p>Loading construction sites...</p>
          </div>
        ) : error ? (
          <div className="sites-status-card error-card">
            <p className="error-msg">⚠️ {error}</p>
            <p className="error-sub">
              Ensure your backend server is running on <code>{import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}</code> and you are logged in.
            </p>
            <Link to="/login" className="login-retry-btn">Go to Login</Link>
          </div>
        ) : sites.length === 0 ? (
          <div className="sites-status-card empty-card">
            <h3>No Sites Found</h3>
            <p>You haven&apos;t created any construction sites yet.</p>
            <button className="create-site-btn" onClick={() => setShowAddModal(true)}>
              + Create First Site
            </button>
          </div>
        ) : (
          <div className="sites-grid">
            {sites.map((site, index) => (
              <div className="site-card" key={site.id || index}>
                <div className="site-card-header">
                  <span className={`site-badge ${site.active ? "badge-active" : "badge-inactive"}`}>
                    {site.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <h3 className="site-name">{site.name || "Unnamed Site"}</h3>
                <p className="site-address">📍 {site.address || "Address not specified"}</p>

                <div className="site-details-grid">
                  <div className="site-detail-item">
                    <span>Budget</span>
                    <strong>₹{Number(site.budget || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="site-detail-item">
                    <span>Received (Funding)</span>
                    <strong className="text-received">₹{Number(site.curReceived || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="site-detail-item">
                    <span>Spent (Expense)</span>
                    <strong className="text-spent">₹{Number(site.curSpent || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="site-detail-item">
                    <span>Net Balance</span>
                    <strong className={(Number(site.curReceived || 0) - Number(site.curSpent || 0)) >= 0 ? "text-received" : "text-spent"}>
                      ₹{(Number(site.curReceived || 0) - Number(site.curSpent || 0)).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                {site.budget != null && Number(site.budget) > 0 && (
                  <div className="site-progress-container">
                    <div className="progress-labels">
                      <span>Budget Spent</span>
                      <span>
                        {Math.min(Math.round((Number(site.curSpent || 0) / Number(site.budget)) * 100), 999)}%
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className={`progress-bar-fill ${
                          (Number(site.curSpent || 0) / Number(site.budget)) > 1
                            ? "fill-overbudget"
                            : (Number(site.curSpent || 0) / Number(site.budget)) > 0.75
                            ? "fill-warning"
                            : "fill-ok"
                        }`}
                        style={{
                          width: `${Math.min(
                            ((Number(site.curSpent || 0) / Number(site.budget)) * 100),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="site-footer site-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => setEditSite(site)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => setDeletingSite(site)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Site Modal */}
      {showAddModal && (
        <SiteFormModal
          site={null}
          onClose={() => setShowAddModal(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Edit Site Modal */}
      {editSite && (
        <SiteFormModal
          site={editSite}
          onClose={() => setEditSite(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingSite && (
        <DeleteConfirmModal
          siteName={deletingSite.name}
          onClose={() => setDeletingSite(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
    </>
  );
}

export default Sites;