import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshUser } = useAuth(); 

    useEffect(() => {
        const handleCallback = async () => {
            // 1. Get the status from the URL (sent by our Auth2SucessHandler)
            const params = new URLSearchParams(location.search);
            const status = params.get("status");

            if (status === "success") {
                try {
                    // ⚡ 2. SECURE CHECK: Verify cookies and populate global Auth state
                    await refreshUser(); 
                    
                    // ⚡ 3. REDIRECT PERSISTENCE: 
                    // Retrieve the intended destination we saved in AuthModal
                    const savedPath = sessionStorage.getItem("postLoginRedirect");
                    
                    if (savedPath) {
                        sessionStorage.removeItem("postLoginRedirect"); // Clean up
                        navigate(savedPath, { replace: true });
                    } else {
                        // Fallback if no specific path was saved
                        navigate("/", { replace: true });
                    }
                } catch (error) {
                    console.error("Session verification failed after Google login", error);
                    navigate("/login?error=verification_failed");
                }
            } else {
                // If the backend sent status=error
                const reason = params.get("reason") || "oauth_failed";
                console.error("OAuth2 failed:", reason);
                navigate(`/login?error=${reason}`);
            }
        };

        handleCallback();
    }, [navigate, location, refreshUser]);

    return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="text-center">
                {/* Crimson spinner matching your theme */}
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