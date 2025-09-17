import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
    ROUTE_CONFIG,
    getDefaultRouteForAccessLevel
} from '../config/routeConfig';
import { getUserAccessLevel, hasProcessRole } from '../utils/decryptUtils';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Certificates from '../pages/Certificates';
import Users from '../pages/Users';
import ClarkDashboard from '../pages/ClarkDashboard';
import CollectorDashboard from '../pages/CollectorDashboard';
import Unauthorized from '../pages/Unauthorized';

// Component mapping for routes
const COMPONENT_MAP: Record<string, React.ComponentType<{ setIsAuthenticated: (auth: boolean) => void }>> = {
    '/Certificates': Certificates,
    '/Users': Users,
    '/ClarkDashboard': ClarkDashboard,
    '/AdminDashboard': CollectorDashboard
};

interface CentralizedRouterProps {
    isAuthenticated: boolean;
    setIsAuthenticated: (auth: boolean) => void;
}

// Direct redirect component
export const DirectRedirect: React.FC = () => {
    try {
        // Get user's access level and redirect directly
        const userAccessLevel = getUserAccessLevel();
        const defaultRoute = getDefaultRouteForAccessLevel(userAccessLevel);
        return <Navigate to={defaultRoute} replace />;
    } catch (error) {
        console.error("Error checking access level for redirect:", error);
        return <Navigate to="/unauthorized" replace />;
    }
};

// Protected route wrapper
const ProtectedRoute: React.FC<{
    isAuthenticated: boolean;
    children: React.ReactNode;
    requiredAccessLevels: number[];
}> = ({ isAuthenticated, children, requiredAccessLevels }) => {
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    try {
        const hasAccess = hasProcessRole(requiredAccessLevels);
        if (!hasAccess) {
            return <Navigate to="/unauthorized" replace />;
        }
    } catch (error) {
        console.error("Error checking access level:", error);
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

const CentralizedRouter: React.FC<CentralizedRouterProps> = ({
    isAuthenticated,
    setIsAuthenticated
}) => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                {/* Root redirect - directly to appropriate page or login */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? <DirectRedirect /> : <Navigate to="/login" />
                    }
                />

                {/* Public routes */}
                <Route
                    path="/login"
                    element={isAuthenticated ? <DirectRedirect /> : <Login />}
                />
                <Route
                    path="/signup"
                    element={isAuthenticated ? <DirectRedirect /> : <Signup />}
                />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected routes - automatically generated from config */}
                {Object.entries(ROUTE_CONFIG).map(([, route]) => {
                    // Skip public routes
                    if (route.isPublic) return null;
                    const Component = COMPONENT_MAP[route.path];
                    if (!Component) return null;

                    return (
                        <Route
                            key={route.path}
                            path={route.path}
                            element={
                                <ProtectedRoute
                                    isAuthenticated={isAuthenticated}
                                    requiredAccessLevels={route.accessLevels}
                                >
                                    <Component setIsAuthenticated={setIsAuthenticated} />
                                </ProtectedRoute>
                            }
                        />
                    );
                })}
            </Routes>
        </Suspense>
    );
};

export default CentralizedRouter; 