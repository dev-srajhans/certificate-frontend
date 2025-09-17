import CryptoJS from 'crypto-js';
import { getEncryptionKey } from './envUtils';

// Global cache for decrypted access control IDs
let cachedAccessControlIds: Record<string, unknown> | null = null;
let isCacheInitialized = false;

// Function to decrypt Access_control_id
export const decryptAccessControlId = (encryptedData: string): string | null => {
    try {
        if (!encryptedData) {
            console.log('No encrypted data provided');
            return null;
        }

        // Validate encryption key
        const encryptionKey = getEncryptionKey();
        if (!encryptionKey) {
            console.error('VITE_ENCRYPTION_KEY environment variable is not set');
            return null;
        }

        // Check if data is already plain text (no colon)
        if (!encryptedData.includes(':')) {
            return encryptedData;
        }

        // Split the encrypted data to get IV and encrypted text
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
            console.error('Invalid encrypted data format, expected iv:encrypted_data, got:', parts.length, 'parts');
            return null;
        }

        const ivHex = parts[0];
        const encrypted = parts[1];

        // Validate hex format
        if (ivHex.length !== 32) { // 16 bytes = 32 hex characters
            console.error('Invalid IV length, expected 32 hex characters, got:', ivHex.length);
            return null;
        }
        // Parse IV from hex
        const iv = CryptoJS.enc.Hex.parse(ivHex);

        // Use PBKDF2 with EXACT same parameters as backend
        const key = CryptoJS.PBKDF2(encryptionKey, 'salt', {
            keySize: 256 / 32, // 256 bits ÷ 32 bits per word = 8 words (CryptoJS uses 32-bit words)
            iterations: 1000,
            hasher: CryptoJS.algo.SHA256
        });

        // Create cipher params for decryption
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: CryptoJS.enc.Hex.parse(encrypted)
        });

        // Decrypt the data
        const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const result = decrypted.toString(CryptoJS.enc.Utf8);

        if (!result || result.length === 0) {
            console.error('Decryption resulted in empty string - possible key mismatch');
            return null;
        }

        return result;
    } catch (error) {
        console.error('Error decrypting Access_control_id:', error);
        return null;
    }
};

// Function to get decrypted Access_control_id from sessionStorage
export const getDecryptedAccessControlId = (): string | null => {
    try {
        const encryptedData = sessionStorage.getItem('User_Access_control_ids');
        if (!encryptedData) {
            return null;
        }
        const decrypted = decryptAccessControlId(encryptedData);
        return decrypted;
    } catch (error) {
        console.error('Error getting Access roles from storage:', error);
        return null;
    }
};

// Function to initialize cache with decrypted access control IDs
export const initializeAccessControlCache = (): Record<string, unknown> | null => {
    if (isCacheInitialized) {
        return cachedAccessControlIds;
    }

    try {
        const decryptedId = getDecryptedAccessControlId();
        if (!decryptedId) {
            cachedAccessControlIds = null;
            isCacheInitialized = true;
            return null;
        }

        // Parse decryptedId from json string to object
        const decryptedIdObject = JSON.parse(decryptedId);
        cachedAccessControlIds = decryptedIdObject;
        isCacheInitialized = true;
        return decryptedIdObject;
    } catch (error) {
        console.error('Error initializing access control cache:', error);
        cachedAccessControlIds = null;
        isCacheInitialized = true;
        return null;
    }
};

// Function to get cached access control IDs
export const getCachedAccessControlIds = (): Record<string, unknown> | null => {
    if (!isCacheInitialized) {
        return initializeAccessControlCache();
    }
    return cachedAccessControlIds;
};

// Function to clear the cache (useful for logout or when data changes)
export const clearAccessControlCache = (): void => {
    cachedAccessControlIds = null;
    isCacheInitialized = false;
};

// Function to refresh the cache (useful when access control data is updated)
export const refreshAccessControlCache = (): Record<string, unknown> | null => {
    clearAccessControlCache();
    return initializeAccessControlCache();
};

// Function to check if user has specific access control permissions
export const hasAccessControlPermission = (requiredId: number[]): boolean => {
    try {
        const cachedIds = getCachedAccessControlIds();

        const permissionIds = cachedIds?.Permission_ids ? JSON.parse(cachedIds.Permission_ids as string) : [];

        // Check if the cached IDs contain the required permission
        const hasPermission = permissionIds.some((id: number) => requiredId.includes(id));

        return hasPermission;
    } catch (error) {
        console.error('Error checking access control permission:', error);
        return false;
    }
};

// Function to check if user has specific process role
export const hasProcessRole = (requiredId: number[]): boolean => {
    try {
        const cachedIds = getCachedAccessControlIds();
        if (!cachedIds) {
            return false;
        }
        const accessLevel = cachedIds.Access_Level as number;

        // Check if the cached Access_Level matches any of the required IDs
        const hasPermission = requiredId.includes(accessLevel);

        return hasPermission;
    } catch (error) {
        console.error('Error checking process role:', error);
        return false;
    }
};

// Function to get users access level
export const getUserAccessLevel = (): number => {
    try {
        const cachedIds = getCachedAccessControlIds();
        if (!cachedIds) {
            return 0;
        }
        const accessLevel = cachedIds.Access_Level as number;

        return accessLevel;
    } catch (error) {
        console.error('Error getting user access level:', error);
        return 0;
    }
};
