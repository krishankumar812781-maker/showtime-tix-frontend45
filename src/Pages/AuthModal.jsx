import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser, registerUser } from "../api"; // Removed GOOGLE_AUTH_URL
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
        
        // Normalize roles to string array
        const cleanedUser = {
          ...userData,
          roles: rolesArray.map((r) =>
            typeof r === "string" ? r : r.authority
          ),
        };

        setUser(cleanedUser);

        // Redirect Logic
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
        // Registration Payload
        const registrationPayload = {
          username: credentials.usernameOrEmail, 
          email: credentials.usernameOrEmail,    
          password: credentials.password,
        };

        await registerUser(registrationPayload);
        
        // Switch to login mode after successful registration
        setIsLogin(true);
        setError(""); 
        setCredentials({ name: "", usernameOrEmail: "", password: "" });
        alert("Account created successfully! Please log in.");
      }
    } catch (err) {
      console.error("Auth Error:", err);
      const message = err.response?.data?.message || err.response?.data || "Authentication failed.";
      setError(typeof message === 'string' ? message : "Invalid input data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 md:p-6">
      <div className="bg-white w-full max-w-[450px] max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl relative flex flex-col no-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-2 right-4 text-gray-400 hover:text-gray-900 text-4xl font-light z-50 p-2 cursor-pointer"
        >
          &times;
        </button>

        <div className="p-6 md:p-8 pt-10 md:pt-12">
          <h2 className="text-center font-black text-gray-800 text-lg md:text-xl mb-8 md:mb-10 uppercase tracking-widest">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4 md:space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-[11px] md:text-xs p-3 rounded-lg text-center font-medium border border-red-100">
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="John Doe"
                  className="w-full p-3 md:p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:border-[#DC143C] outline-none transition-colors"
                  value={credentials.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">
                {isLogin ? "Credentials" : "Email Address"}
              </label>
              <input
                type="text"
                name="usernameOrEmail"
                autoComplete={isLogin ? "username" : "email"}
                placeholder={isLogin ? "Email or Username" : "email@example.com"}
                className="w-full p-3 md:p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:border-[#DC143C] outline-none transition-colors"
                value={credentials.usernameOrEmail}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Password</label>
              <input
                type="password"
                name="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="••••••••"
                className="w-full p-3 md:p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:border-[#DC143C] outline-none transition-colors"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className={`w-full bg-[#DC143C] text-white py-4 md:py-5 rounded-xl font-black text-[11px] md:text-xs tracking-[0.2em] mt-4 ${
                loading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-red-700 shadow-lg shadow-red-100 active:scale-[0.98]"
              } transition-all duration-300 uppercase`}
            >
              {loading ? "PROCESSING..." : isLogin ? "SECURE LOG IN" : "CREATE ACCOUNT"}
            </button>
          </form>

          <p className="mt-8 md:mt-10 text-center text-[11px] md:text-xs text-gray-500 font-medium">
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
              {isLogin ? "Register Now" : "Login Instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;