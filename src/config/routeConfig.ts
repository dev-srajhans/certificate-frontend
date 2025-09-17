// Define access level groups for easy management
export const ACCESS_LEVELS = {
    CERTIFICATE_MANAGEMENT: [1, 2],
    USER_MANAGEMENT: [3],
    CLARK_DASHBOARD: [2],
    COLLECTOR_DASHBOARD: [1],
    ANALYTICS: [4],
    ADMIN: [1, 2, 3],
    ALL: [1, 2, 3, 4, 5] // For future use
} as const;

// Route configuration interface
export interface RouteConfig {
    path: string;
    accessLevels: number[];
    isPublic?: boolean;
    title?: string;
    description?: string;
}

// Centralized route configuration
export const ROUTE_CONFIG: Record<string, RouteConfig> = {
    // Public routes (no authentication required)
    login: {
        path: '/login',
        accessLevels: [],
        isPublic: true,
        title: 'Login',
        description: 'User authentication page'
    },
    signup: {
        path: '/signup',
        accessLevels: [],
        isPublic: true,
        title: 'Signup',
        description: 'User registration page'
    },
    unauthorized: {
        path: '/unauthorized',
        accessLevels: [],
        isPublic: true,
        title: 'Unauthorized',
        description: 'Access denied page'
    },

    // Protected routes (authentication required)
    certificates: {
        path: '/Certificates',
        accessLevels: [...ACCESS_LEVELS.CERTIFICATE_MANAGEMENT],
        title: 'Certificates',
        description: 'Certificate management for levels 1 and 2'
    },
    users: {
        path: '/Users',
        accessLevels: [...ACCESS_LEVELS.USER_MANAGEMENT],
        title: 'User Management',
        description: 'User account management for level 3'
    },
    clarkDashboard: {
        path: '/ClarkDashboard',
        accessLevels: [...ACCESS_LEVELS.CLARK_DASHBOARD],
        title: 'Clark Dashboard',
        description: 'Clark dashboard for level 2 users'
    },
    collectorDashboard: {
        path: '/AdminDashboard',
        accessLevels: [...ACCESS_LEVELS.COLLECTOR_DASHBOARD],
        title: 'Collector Dashboard',
        description: 'Collector dashboard for level 1 users'
    },

    // Example: Adding a new route is as simple as adding it here!
    // analytics: {
    //   path: '/Analytics',
    //   accessLevels: [...ACCESS_LEVELS.ANALYTICS],
    //   title: 'Analytics',
    //   description: 'Analytics dashboard for level 4'
    // }
};

// Helper functions for route management
export const getRouteByPath = (path: string): RouteConfig | undefined => {
    return Object.values(ROUTE_CONFIG).find(route => route.path === path);
};

export const getRoutesByAccessLevel = (accessLevel: number): RouteConfig[] => {
    return Object.values(ROUTE_CONFIG).filter(route =>
        route.accessLevels.includes(accessLevel) && !route.isPublic
    );
};

export const getPublicRoutes = (): RouteConfig[] => {
    return Object.values(ROUTE_CONFIG).filter(route => route.isPublic);
};

export const getProtectedRoutes = (): RouteConfig[] => {
    return Object.values(ROUTE_CONFIG).filter(route => !route.isPublic);
};

// Default redirect paths for different access levels
export const ACCESS_LEVEL_DEFAULTS: Record<number, string> = {
    1: '/AdminDashboard',
    2: '/ClarkDashboard',
    3: '/Users',
    4: '/Analytics', // Example: New access level default
    // Add more as needed
    // 5: '/Settings'
};

// Get default route for an access level
export const getDefaultRouteForAccessLevel = (accessLevel: number): string => {
    return ACCESS_LEVEL_DEFAULTS[accessLevel] || '/unauthorized';
};

// Check if user has access to a specific route
export const hasRouteAccess = (routePath: string, userAccessLevels: number[]): boolean => {
    const route = getRouteByPath(routePath);
    if (!route) return false;
    if (route.isPublic) return true;

    return route.accessLevels.some(level => userAccessLevels.includes(level));
};

// Get user's accessible routes
export const getUserAccessibleRoutes = (userAccessLevels: number[]): RouteConfig[] => {
    return Object.values(ROUTE_CONFIG).filter(route =>
        route.isPublic || route.accessLevels.some(level => userAccessLevels.includes(level))
    );
}; 