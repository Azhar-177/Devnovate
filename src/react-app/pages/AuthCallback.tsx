import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate("/");
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/?error=auth_failed");
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <Loader2 className="w-8 h-8 text-indigo-600 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Completing sign in...</h2>
        <p className="text-slate-600">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}
