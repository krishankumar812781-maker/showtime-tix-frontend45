import { useEffect, useRef } from 'react'; // Added useRef
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const GoogleCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshUser } = useAuth(); 
    const hasCalled = useRef(false); // ⚡ Prevents double execution in Strict Mode

    useEffect(() => {
        // Only run once
        if (hasCalled.current) return;
        
        const handleCallback = async () => {
            const params = new URLSearchParams(location.search);
            const status = params.get("status");

            if (status === "success") {
                hasCalled.current = true;
                try {
                    console.log("OAuth success detected, refreshing user...");
                    
                    // 1. Wait for the backend session to be verified
                    const user = await refreshUser(); 
                    
                    if (user) {
                        console.log("User verified:", user.email);
                        const savedPath = sessionStorage.getItem("postLoginRedirect") || "/";
                        sessionStorage.removeItem("postLoginRedirect");

                        // ⚡ Use replace to clean up the URL from ?status=success
                        navigate(savedPath, { replace: true });
                    } else {
                        throw new Error("No user returned from refresh");
                    }
                } catch (error) {
                    console.error("Verification failed:", error);
                    navigate("/login?error=verification_failed");
                }
            } else if (status === "error" || params.get("reason")) {
                hasCalled.current = true;
                const reason = params.get("reason") || "oauth_failed";
                navigate(`/login?error=${reason}`);
            }
        };

        handleCallback();
    }, [navigate, location.search, refreshUser]); // Only depend on search string

    return (
        <div className="h-screen flex items-center justify-center bg-white">
            <div className="text-center">
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