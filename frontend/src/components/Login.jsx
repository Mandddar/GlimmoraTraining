import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      
      // Store token and user details in localStorage
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      toast.success(`Welcome back, ${response.data.user.username}!`);
      
      // Redirect to dashboard
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.detail || "Invalid email or password.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🎓</span>
          <h2>Welcome Back</h2>
          <p>Login to manage your student records</p>
        </div>

        {error && (
          <div className="auth-error-alert">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-field">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="password">Password</label>
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  fontSize: "0.85rem", 
                  color: "var(--color-indigo-600)", 
                  cursor: "pointer",
                  userSelect: "none"
                }}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
            style={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center",
              height: "44px"
            }}
          >
            {loading ? (
              <>
                <span className="auth-btn-spinner"></span>
                Logging in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
