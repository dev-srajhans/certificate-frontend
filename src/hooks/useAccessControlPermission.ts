import { useMemo } from 'react';
import { hasAccessControlPermission, getCachedAccessControlIds } from '../utils/decryptUtils';

/**
 * Custom hook to check if user has specific access control permissions
 * Uses cached decrypted access control IDs to avoid repeated decryption
 * 
 * @param requiredIds - Array of access control IDs to check against
 * @returns boolean indicating if user has the required permissions
 */
export const useAccessControlPermission = (requiredIds: number[]): boolean => {
    return useMemo(() => {
        return hasAccessControlPermission(requiredIds);
    }, [requiredIds]);
};

/**
 * Custom hook to check if user has any of the specified access control permissions
 * 
 * @param requiredIds - Array of access control IDs to check against
 * @returns boolean indicating if user has any of the required permissions
 */
export const useHasAnyPermission = (requiredIds: number[]): boolean => {
    return useAccessControlPermission(requiredIds);
};

/**
 * Custom hook to check if user has all of the specified access control permissions
 * 
 * @param requiredIds - Array of access control IDs to check against
 * @returns boolean indicating if user has all of the required permissions
 */
export const useHasAllPermissions = (requiredIds: number[]): boolean => {
    return useMemo(() => {
        try {
            const cachedIds = getCachedAccessControlIds();
            if (!cachedIds) {
                return false;
            }

            // Extract Permission_ids array from cached data
            const permissionIds = cachedIds?.Permission_ids ? JSON.parse(cachedIds.Permission_ids as string) : [];

            // Check if user has ALL required permissions
            return requiredIds.every((id: number) => permissionIds.includes(id));
        } catch (error) {
            console.error('Error checking all access control permissions:', error);
            return false;
        }
    }, [requiredIds]);
}; 