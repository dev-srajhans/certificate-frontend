const API_URL = import.meta.env.VITE_API_URL;

// API Response interfaces
export interface LoginResponse {
    Access_control_ids: string;
    User_id: string;
    email: string;
    success: boolean;
    message?: string;
    jwtToken?: string;
    name?: string;
    error?: { details?: { message: string }[] };
}

export interface SignupResponse {
    success: boolean;
    message?: string;
    error?: { details?: { message: string }[] };
}

export interface UserData {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
}

// API Functions
export const authApi = {
    // Login user
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await fetch(`${API_URL}/auth/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });
        return response.json();
    },

    // Signup new user
    signup: async (userData: UserData): Promise<SignupResponse> => {
        const response = await fetch(`${API_URL}/auth/signup/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });
        return response.json();
    },

    // Admin create user (for future use)
    createUser: async (userData: UserData, token: string): Promise<SignupResponse> => {
        const response = await fetch(`${API_URL}/auth/admin/create-user/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });
        return response.json();
    },

    // Logout user
    logout: async (token: string): Promise<{ success: boolean; message?: string }> => {
        const response = await fetch(`${API_URL}/auth/logout/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        return response.json();
    },

    // Verify token
    verifyToken: async (token: string): Promise<{ valid: boolean; user?: { id: string; email: string; name: string; accessLevel: string } }> => {
        const response = await fetch(`${API_URL}/auth/verify/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        return response.json();
    },
};

export default authApi; 