import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser, registerUser, GOOGLE_AUTH_URL } from "../api";
import { useAuth } from "../context/AuthContext";

const AuthModal = ({ onClose }) => {
  const { setUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    name: "",
    usernameOrEmail: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await loginUser({
          usernameOrEmail: credentials.usernameOrEmail,
          password: credentials.password,
        });

        const userData = response.data;
        const rolesArray = userData?.roles || [];
        const cleanedUser = {
          ...userData,
          roles: rolesArray.map((r) =>
            typeof r === "string" ? r : r.authority
          ),
        };

        setUser(cleanedUser);

        const origin = location.state?.from?.pathname;
        if (cleanedUser.roles.includes("ROLE_ADMIN")) {
          navigate("/admin");
        } else if (origin) {
          navigate(origin, { replace: true });
        } else {
          navigate("/");
        }

        if (onClose) onClose();
      } else {
        // ⚡ FIX: Mapping credentials to match your RegisterDto.java
        // We use usernameOrEmail for both fields to ensure the backend gets what it needs
        const registrationPayload = {
          username: credentials.usernameOrEmail, 
          email: credentials.usernameOrEmail,    
          password: credentials.password,
          // name: credentials.name // Include this ONLY if you add 'name' to RegisterDto.java
        };

        await registerUser(registrationPayload);
        alert("Registration Successful! Please login to continue.");
        setIsLogin(true);
        setCredentials({ name: "", usernameOrEmail: "", password: "" });
      }
    } catch (err) {
      console.error("Auth Error:", err);
      // Enhanced error reporting to catch validation messages from the backend
      const message = err.response?.data?.message || err.response?.data || "Authentication failed.";
      setError(typeof message === 'string' ? message : "Invalid input data.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 md:p-6">
      <div className="bg-white w-full max-w-[450px] max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl relative flex flex-col no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-400 hover:text-gray-900 text-4xl font-light z-10 p-2"
        >
          &times;
        </button>

        <div className="p-6 md:p-8 pt-10 md:pt-12">
          <h2 className="text-center font-black text-gray-800 text-lg md:text-xl mb-6 md:mb-8 uppercase tracking-widest">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 md:gap-4 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-all font-bold text-gray-700 text-sm"
          >
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              className="w-5 h-5"
              alt="google"
            />
            Continue with Google
          </button>

          <div className="relative my-6 md:my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-white px-4 text-[10px] text-gray-400 font-black tracking-tighter">
              OR
            </span>
          </div>

          <form onSubmit={handleAuth} className="space-y-3 md:space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-[11px] md:text-xs p-3 rounded-lg text-center font-medium border border-red-100">
                {error}
              </div>
            )}

            {!isLogin && (
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Full Name"
                className="w-full p-3 md:p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:border-[#DC143C] outline-none transition-colors"
                value={credentials.name}
                onChange={handleChange}
                required
              />
            )}

            <input
              type="text"
              name="usernameOrEmail"
              autoComplete={isLogin ? "username" : "email"}
              placeholder={isLogin ? "Email or Username" : "Email Address"}
              className="w-full p-3 md:p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:border-[#DC143C] outline-none transition-colors"
              value={credentials.usernameOrEmail}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="Password"
              className="w-full p-3 md:p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:border-[#DC143C] outline-none transition-colors"
              value={credentials.password}
              onChange={handleChange}
              required
            />

            <button
              disabled={loading}
              type="submit"
              className={`w-full bg-[#DC143C] text-white py-3.5 md:py-4 rounded-xl font-black text-[11px] md:text-xs tracking-[0.2em] ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-red-700 shadow-lg shadow-red-100 active:scale-[0.98]"
              } transition-all duration-300 uppercase`}
            >
              {loading ? "PROCESSING..." : isLogin ? "LOG IN" : "SIGN UP"}
            </button>
          </form>

          <p className="mt-6 md:mt-8 text-center text-[11px] md:text-xs text-gray-500 font-medium">
            {isLogin ? "Don't have an account?" : "Already a member?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setCredentials({ name: "", usernameOrEmail: "", password: "" });
              }}
              className="ml-2 text-[#DC143C] font-bold hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;