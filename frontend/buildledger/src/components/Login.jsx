import { useState, useEffect } from "react";
import Header from "../utils/Header.jsx";
import './Login.css';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login } from "../utils/api.js";
import { useAuth } from "../utils/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already authenticated, redirect immediately away from login page
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/sites", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Read error parameter from URL query params (e.g. ?error=...)
  useEffect(() => {
    if (!isAuthenticated) {
      const params = new URLSearchParams(location.search);
      const urlError = params.get("error");
      if (urlError) {
        if (urlError === "oauth2_failed") {
          setError("Google sign-in failed or was cancelled. Please try again.");
        } else {
          setError(urlError);
        }
      }
    }
  }, [location.search, isAuthenticated]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = await login(formData.username, formData.password);
      loginUser(token);
      navigate("/sites");
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  };

  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="login-container glass-card">
          <div className="auth-header">
            <p className="auth-subtitle">WELCOME BACK</p>
            <h2>Login to BuildLedger</h2>
          </div>

          {error && (
            <div className="auth-error">
              ⚠️ {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username or Email</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter username or email"
                value={formData.username}
                onChange={handleChange}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button type="button" className="google-btn" onClick={handleGoogleLogin}>
            <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/register" className="auth-link">Register here</Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;