// Environment validation utility for frontend

export const validateEnvironment = (): boolean => {
    const missingVars: string[] = [];

    if (!import.meta.env.VITE_ENCRYPTION_KEY) {
        missingVars.push('VITE_ENCRYPTION_KEY');
    }

    if (!import.meta.env.VITE_API_URL) {
        missingVars.push('VITE_API_URL');
    }

    if (missingVars.length > 0) {
        console.error('CRITICAL: Missing environment variables:', missingVars);
        console.error('Please set these variables in your .env file:');
        missingVars.forEach(varName => {
            console.error(`${varName}=your_value_here`);
        });
        return false;
    }

    // Validate encryption key strength
    const encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;
    if (encryptionKey && encryptionKey.length < 32) {
        console.warn('SECURITY WARNING: VITE_ENCRYPTION_KEY should be at least 32 characters long');
    }

    return true;
};

// Get encryption key with fallback
export const getEncryptionKey = (): string | null => {
    const key = import.meta.env.VITE_ENCRYPTION_KEY;
    if (!key) {
        console.error('VITE_ENCRYPTION_KEY is not set');
        return null;
    }
    return key;
};

// Get API URL with fallback
export const getApiUrl = (): string => {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

// Get Upload Path with fallback
export const getUploadPath = (): string => {
    return import.meta.env.VITE_UPLOAD_PATH || './uploads';
}; 