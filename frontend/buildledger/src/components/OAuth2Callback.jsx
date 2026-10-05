import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";

function OAuth2Callback() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      loginUser(token);
      navigate("/sites", { replace: true });
    } else {
      navigate("/login?error=oauth2_failed", { replace: true });
    }
  }, [loginUser, navigate]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      color: "white",
      gap: "16px",
      fontSize: "18px"
    }}>
      <div style={{
        width: "40px", height: "40px",
        border: "4px solid rgba(255,255,255,0.1)",
        borderLeftColor: "rgb(246, 206, 30)",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <p>Completing Google sign-in...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default OAuth2Callback;
