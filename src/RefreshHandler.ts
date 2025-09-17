import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getUserAccessLevel } from "./utils/decryptUtils";
import { getDefaultRouteForAccessLevel } from "./config/routeConfig";

interface RefreshHandlerProps {
  setIsAuthenticated: (auth: boolean) => void;
}

function RefreshHandler({ setIsAuthenticated }: RefreshHandlerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run authentication check once on mount and when location changes
    const checkAuth = () => {
      const token = sessionStorage.getItem("token");

      // Check if token exists and is not empty
      if (token && token.trim() !== "") {
        setIsAuthenticated(true);

        // Only redirect if we're on auth pages and this is not the initial load
        if (["/", "/login", "/signup"].includes(location.pathname) && isInitialized.current) {
          // Check access levels and redirect accordingly using centralized config
          try {
            const userAccessLevel = getUserAccessLevel();
            const defaultRoute = getDefaultRouteForAccessLevel(userAccessLevel);
            navigate(defaultRoute);
          } catch (error) {
            console.error("Error checking process role:", error);
            navigate("/unauthorized");
          }
        }
      } else {
        setIsAuthenticated(false);
        // Only redirect if we're on protected pages and this is not the initial load
        if (["/Certificates", "/Users"].includes(location.pathname) && isInitialized.current) {
          navigate("/login");
        }
      }

      // Mark as initialized after first check
      if (!isInitialized.current) {
        isInitialized.current = true;
      }
    };

    // Run immediately on mount, then with a small delay for subsequent checks
    if (!isInitialized.current) {
      checkAuth();
    } else {
      const timeoutId = setTimeout(checkAuth, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname, navigate, setIsAuthenticated]);

  return null;
}

export default RefreshHandler;