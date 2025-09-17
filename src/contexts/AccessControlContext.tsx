import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { decryptAccessControlId } from '../utils/decryptUtils';

interface AccessControlContextType {
    decryptedAccessControlIds: number[] | null;
    isLoading: boolean;
    refreshAccessControlIds: () => void;
}

const AccessControlContext = createContext<AccessControlContextType | undefined>(undefined);

interface AccessControlProviderProps {
    children: ReactNode;
}

export const AccessControlProvider: React.FC<AccessControlProviderProps> = ({ children }) => {
    const [decryptedAccessControlIds, setDecryptedAccessControlIds] = useState<number[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const decryptAndCacheAccessControlIds = () => {
        try {
            setIsLoading(true);
            const encryptedData = sessionStorage.getItem('User_Access_control_ids');

            if (!encryptedData) {
                setDecryptedAccessControlIds(null);
                return;
            }

            const decrypted = decryptAccessControlId(encryptedData);
            if (!decrypted) {
                setDecryptedAccessControlIds(null);
                return;
            }

            // Parse decrypted data from JSON string to array
            const decryptedIdArray = JSON.parse(decrypted);
            setDecryptedAccessControlIds(decryptedIdArray);
        } catch (error) {
            console.error('Error decrypting access control IDs:', error);
            setDecryptedAccessControlIds(null);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshAccessControlIds = () => {
        setDecryptedAccessControlIds(null);
        decryptAndCacheAccessControlIds();
    };

    useEffect(() => {
        // Decrypt and cache access control IDs on mount
        decryptAndCacheAccessControlIds();
    }, []);

    const value: AccessControlContextType = {
        decryptedAccessControlIds,
        isLoading,
        refreshAccessControlIds,
    };

    return (
        <AccessControlContext.Provider value={value}>
            {children}
        </AccessControlContext.Provider>
    );
};

export const useAccessControl = (): AccessControlContextType => {
    const context = useContext(AccessControlContext);
    if (context === undefined) {
        throw new Error('useAccessControl must be used within an AccessControlProvider');
    }
    return context;
}; 