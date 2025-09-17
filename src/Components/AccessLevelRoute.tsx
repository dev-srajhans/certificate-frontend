import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasProcessRole } from '../utils/decryptUtils';

interface AccessLevelRouteProps {
    children: React.ReactNode;
    isAuthenticated: boolean;
    requiredAccessLevels: number[];
    fallbackPath?: string;
}

/**
 * Component that restricts access based on user's process role (Access_Level)
 * Only users with matching Access_Level can access the protected content
 */
const AccessLevelRoute: React.FC<AccessLevelRouteProps> = ({
    children,
    isAuthenticated,
    requiredAccessLevels,
    fallbackPath = "/unauthorized"
}) => {
    // First check if user is authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    // Only check access levels if user is authenticated
    const hasAccess = hasProcessRole(requiredAccessLevels);

    if (!hasAccess) {
        return <Navigate to={fallbackPath} replace />;
    }

    return <>{children}</>;
};

export default AccessLevelRoute; 