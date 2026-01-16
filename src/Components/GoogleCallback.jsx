import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ⚡ Hook into our Auth Logic

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshUser } = useAuth(); // ⚡ Get the refresh function to verify cookies

    useEffect(() => {
        const handleCallback = async () => {
            // 1. Get the status from the URL
            const params = new URLSearchParams(location.search);
            const status = params.get("status");

            if (status === "success") {
                // ⚡ 2. SECURE CHECK: Call the backend to verify the cookies
                // We no longer manually save tokens to localStorage.
                try {
                    await refreshUser(); 
                    
                    // 3. Redirect home
                    // refreshUser() will update the global state, so no reload is needed.
                    navigate("/");
                } catch (error) {
                    console.error("Session verification failed after Google login", error);
                    navigate("/login?error=verification_failed");
                }
            } else {
                console.error("OAuth2 status missing or failed in URL");
                navigate("/login?error=oauth_failed");
            }
        };

        handleCallback();
    }, [navigate, location, refreshUser]);

    return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                {/* Crimson spinner to match your theme */}
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#DC143C] mx-auto"></div>
                <h2 className="mt-6 text-xl font-bold text-gray-800 uppercase tracking-widest">
                    Securing your session...
                </h2>
                <p className="text-gray-500 mt-2">Finishing Google Authentication</p>
            </div>
        </div>
    );
};

export default GoogleCallback;