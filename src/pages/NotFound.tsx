import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, AlertTriangle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 animate-pulse-slow"></div>
      <div className="fixed inset-0 bg-gradient-to-tr from-transparent via-emerald-200/20 to-transparent animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      
      {/* Floating Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-xl animate-float"></div>
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-green-400/15 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 left-1/4 w-24 h-24 bg-emerald-500/10 rounded-full blur-lg animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 text-center animate-fade-in">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-emerald-200/50 max-w-md mx-4">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertTriangle className="w-12 h-12 text-emerald-600" />
          </div>
          
          <h1 className="text-8xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-bold text-emerald-900 mb-4">
            Oops! Page not found
          </h2>
          
          <p className="text-emerald-700/80 text-lg mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Link to="/">
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-4 text-lg rounded-xl font-semibold transition-all duration-300 animate-glow">
              <Home className="w-5 h-5 mr-2" />
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
