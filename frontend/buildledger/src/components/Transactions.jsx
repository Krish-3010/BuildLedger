import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../utils/Header";
import { useAuth } from "../utils/AuthContext.jsx";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  fetchSites,
} from "../utils/api.js";
import "./Transactions.css";

const EMPTY_TX = {
  siteId: "",
  description: "",
  amount: "",
  type: "SPENT",
};

const isSpent = (tx) => {
  if (tx?.type) {
    return tx.type.toUpperCase() === "SPENT";
  }
  return Number(tx?.amount) < 0;
};

// ── Transaction Form Modal ────────────────────────────────────────────────────

function TxFormModal({ tx, sites, onClose, onSaved }) {
  const isEdit = Boolean(tx?.id);
  const [form, setForm] = useState(
    tx
      ? {
          siteId: tx.siteId || "",
          description: tx.description || "",
          amount: tx.amount ? Math.abs(Number(tx.amount)) : "",
          type: tx.type || (Number(tx.amount) < 0 ? "SPENT" : "RECEIVED"),
        }
      : { ...EMPTY_TX }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = {
        siteId: form.siteId || null,
        description: form.description.trim(),
        amount: Number(form.amount),
        type: form.type,
      };
      let saved;
      if (isEdit) {
        saved = await updateTransaction(tx.id, payload);
      } else {
        saved = await createTransaction(payload);
      }
      onSaved(saved, isEdit);
    } catch (err) {
      setError(err.message || "Failed to save transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card tx-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? "Edit Transaction" : "Add Transaction"}</h3>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="form-modal-error">⚠️ {error}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="tf-type">Transaction Type *</label>
            <div className="type-toggle-group">
              <button
                type="button"
                className={`type-btn ${form.type === "SPENT" ? "active-spent" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, type: "SPENT" }))}
              >
                🔴 SPENT (Expense)
              </button>
              <button
                type="button"
                className={`type-btn ${form.type === "RECEIVED" ? "active-received" : ""}`}
                onClick={() => setForm((prev) => ({ ...prev, type: "RECEIVED" }))}
              >
                🟢 RECEIVED (Funding)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tf-site">Site / Project</label>
            <select
              id="tf-site"
              name="siteId"
              value={form.siteId}
              onChange={handleChange}
              className="modal-select"
            >
              <option value="">— General / No Site —</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tf-desc">Description *</label>
            <input
              id="tf-desc"
              name="description"
              type="text"
              placeholder="e.g. Cement 50 bags, Labour wages, Client Advance"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tf-amount">Amount (₹) *</label>
            <input
              id="tf-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 25000"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="modal-save-btn" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

function DeleteTxModal({ tx, onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Transaction</h3>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p className="delete-confirm-text">
            Delete transaction <strong>&ldquo;{tx?.description || "this transaction"}&rdquo;</strong>? This cannot be undone.
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

// ── Details Modal ─────────────────────────────────────────────────────────────

function TxDetailsModal({ tx, siteName, onClose, onEdit, onDelete }) {
  const spent = isSpent(tx);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Transaction Details</h3>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="modal-detail-row">
            <span>Site / Project</span>
            <strong>{siteName || "General"}</strong>
          </div>

          <div className="modal-detail-row">
            <span>Description</span>
            <p>{tx.description || "N/A"}</p>
          </div>

          <div className="modal-detail-row">
            <span>Amount</span>
            <strong className={`modal-amount ${spent ? "amount-expense" : "amount-income"}`}>
              {spent ? "− " : "+ "}₹{Math.abs(Number(tx.amount)).toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="modal-grid-details">
            <div className="modal-detail-item">
              <span>Transaction Type</span>
              <strong className={spent ? "text-spent" : "text-received"}>
                {spent ? "🔴 SPENT (Expense)" : "🟢 RECEIVED (Funding)"}
              </strong>
            </div>
            <div className="modal-detail-item">
              <span>ID</span>
              <strong className="tx-id">{tx.id?.substring(0, 8) || "N/A"}...</strong>
            </div>
          </div>
        </div>

        <div className="modal-footer modal-actions-row">
          <button className="modal-edit-action-btn" onClick={() => { onClose(); onEdit(); }}>
            ✏️ Edit
          </button>
          <button className="modal-delete-action-btn" onClick={() => { onClose(); onDelete(); }}>
            🗑️ Delete
          </button>
          <button className="modal-close-action-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Transactions Page ────────────────────────────────────────────────────

function Transactions() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [detailsTx, setDetailsTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Site lookup map: id → name
  const siteMap = Object.fromEntries(sites.map((s) => [s.id, s.name]));

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [txData, sitesData] = await Promise.all([fetchTransactions(), fetchSites()]);
      setTransactions(Array.isArray(txData) ? txData : []);
      setSites(Array.isArray(sitesData) ? sitesData : []);
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
    loadData();
  }, [isAuthenticated, navigate]);

  const handleSaved = async () => {
    await loadData();
    setShowAddModal(false);
    setEditTx(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTx) return;
    setDeleteLoading(true);
    try {
      await deleteTransaction(deleteTx.id);
      await loadData();
      setDeleteTx(null);
    } catch (err) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="transactions-page">
        <div className="transactions-header">
          <div>
            <h1>My <span>Transactions</span></h1>
          </div>
          <button className="create-tx-btn" onClick={() => setShowAddModal(true)}>
            + Add Transaction
          </button>
        </div>

        {loading ? (
          <div className="tx-status-card">
            <div className="spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="tx-status-card error-card">
            <p className="error-msg">⚠️ {error}</p>
            <p className="error-sub">
              Ensure your backend server is running on <code>{import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}</code> and you are logged in.
            </p>
            <Link to="/login" className="login-retry-btn">Go to Login</Link>
          </div>
        ) : transactions.length === 0 ? (
          <div className="tx-status-card empty-card">
            <h3>No Transactions Found</h3>
            <p>You haven&apos;t recorded any site transactions yet.</p>
            <button className="create-tx-btn" onClick={() => setShowAddModal(true)}>
              + Record First Transaction
            </button>
          </div>
        ) : (
          <div className="transactions-grid">
            {transactions.map((tx, index) => {
              const spent = isSpent(tx);
              return (
                <div className="transaction-card" key={tx.id || index}>
                  <div className="tx-card-header">
                    <span className="site-tag">
                      🏢 {siteMap[tx.siteId] || "General"}
                    </span>
                    <span className={`tx-type-badge ${spent ? "badge-spent" : "badge-received"}`}>
                      {spent ? "🔴 SPENT" : "🟢 RECEIVED"}
                    </span>
                  </div>

                  <div className="tx-card-body">
                    <p className="tx-description">
                      {tx.description || "No description provided"}
                    </p>

                    <div className="tx-amount-tag">
                      <span>Amount</span>
                      <strong className={`amount-value ${spent ? "amount-expense" : "amount-income"}`}>
                        {spent ? "− " : "+ "}₹{Math.abs(Number(tx.amount)).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>

                  <div className="tx-card-footer tx-actions">
                    <button
                      className="details-button"
                      onClick={() => setDetailsTx(tx)}
                    >
                      Details
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => setEditTx(tx)}
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => setDeleteTx(tx)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <TxFormModal
          tx={null}
          sites={sites}
          onClose={() => setShowAddModal(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Edit Transaction Modal */}
      {editTx && (
        <TxFormModal
          tx={editTx}
          sites={sites}
          onClose={() => setEditTx(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Transaction Details Modal */}
      {detailsTx && (
        <TxDetailsModal
          tx={detailsTx}
          siteName={siteMap[detailsTx.siteId]}
          onClose={() => setDetailsTx(null)}
          onEdit={() => setEditTx(detailsTx)}
          onDelete={() => setDeleteTx(detailsTx)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTx && (
        <DeleteTxModal
          tx={deleteTx}
          onClose={() => setDeleteTx(null)}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      )}
    </>
  );
}

export default Transactions;
