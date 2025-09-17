/**
 * Utility functions for status conversions and management
 * 
 * This module provides centralized functions for converting English status names
 * to Marathi equivalents, ensuring consistency across the application.
 * 
 * @example
 * ```typescript
 * import { getMarathiStatus, getMarathiPriority } from './utils/statusUtils';
 * 
 * // Convert status
 * const marathiStatus = getMarathiStatus('approved'); // Returns 'मंजूर'
 * 
 * // Convert priority
 * const marathiPriority = getMarathiPriority('high'); // Returns 'उच्च'
 * 
 * // Get status configuration
 * const config = getStatusConfig('under_review');
 * // Returns { label: 'प्रक्रियेत', color: '#ff9800', description: '...' }
 * ```
 */

/**
 * Converts English status names to Marathi equivalents
 * @param status - English status name
 * @returns Marathi status name
 * 
 * @example
 * getMarathiStatus('approved') // Returns 'मंजूर'
 * getMarathiStatus('under_review') // Returns 'प्रक्रियेत'
 * getMarathiStatus('rejected') // Returns 'नाकारले'
 * getMarathiStatus('submitted') // Returns 'सबमिट'
 * getMarathiStatus('draft') // Returns 'मसुदा'
 */
export const getMarathiStatus = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'approved':
            return 'मंजूर';
        case 'under_review':
            return 'प्रक्रियेत';
        case 'rejected':
            return 'नाकारले';
        case 'submitted':
            return 'प्रतीक्षित अर्ज';
        case 'draft':
            return 'मसुदा';
        case 'partially_verified':
            return 'आंशिक पडताळणी';
        case 'processing':
            return 'प्रक्रिया करत आहे';
        default:
            return status; // Return original if no match found
    }
};


/**
 * Gets status configuration including label, color, and description
 * @param status - English status name
 * @returns Status configuration object with label, color, and description
 * 
 * @example
 * getStatusConfig('approved') 
 * // Returns { 
 * //   label: 'मंजूर', 
 * //   color: '#4caf50', 
 * //   description: 'आपला अर्ज मंजूर झाला आहे' 
 * // }
 */
export const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
        case 'submitted':
            return {
                label: 'प्रतीक्षित अर्ज',
                color: '#2196f3',
                description: 'आपला अर्ज सबमिट झाला आहे'
            };
        case 'draft':
            return {
                label: 'मसुदा',
                color: '#666',
                description: 'अर्ज मसुदा स्थितीत आहे'
            };
        case 'under_review':
            return {
                label: 'प्रक्रियेत',
                color: '#ff9800',
                description: 'आपला अर्ज प्रक्रियेत आहे'
            };
        case 'partially_verified':
            return {
                label: 'आंशिक पडताळणी',
                color: '#9c27b0',
                description: 'काही सुधारणा आवश्यक आहेत'
            };
        case 'approved':
            return {
                label: 'मंजूर',
                color: '#4caf50',
                description: 'आपला अर्ज मंजूर झाला आहे'
            };
        case 'rejected':
            return {
                label: 'नाकारले',
                color: '#f44336',
                description: 'आपला अर्ज नाकारण्यात आला आहे'
            };
        default:
            return {
                label: 'अज्ञात स्थिती',
                color: '#666',
                description: 'स्थिती अज्ञात आहे'
            };
    }
}; 