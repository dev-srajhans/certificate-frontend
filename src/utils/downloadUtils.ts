// Document download utilities

import { getApiUrl, getUploadPath } from './envUtils';
import { FileMetadata } from '../types';

/**
 * Downloads a document from the server
 * @param document The document metadata containing file information
 * @param applicationId The application ID for constructing the file path
 * @returns Promise with download result
 */
export const downloadDocument = async (
    document: FileMetadata,
    applicationId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const apiUrl = getApiUrl();
        const uploadPath = getUploadPath();

        // Construct the file path based on the upload path configuration
        let fileUrl: string;

        if (uploadPath.startsWith('http')) {
            // For cloud storage (AWS S3, etc.)
            fileUrl = `${uploadPath}/${applicationId}/${document.name}`;
        } else {
            // For local file storage
            fileUrl = `${apiUrl}/${uploadPath}/${applicationId}/${document.name}`;
        }

        // Create a temporary anchor element to trigger download
        const link = window.document.createElement('a');
        link.href = fileUrl;
        link.download = document.name;
        link.target = '_blank';

        // Add authorization header if needed (for protected files)
        // Note: This approach works for public files or files accessible via URL
        // For protected files, you might need to use a different approach

        // Append to body, click, and remove
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);

        return { success: true };
    } catch (error) {
        console.error('Error downloading document:', error);
        return {
            success: false,
            error: 'डॉक्युमेंट डाउनलोड करण्यात त्रुटी आली आहे'
        };
    }
};

/**
 * Downloads a document using fetch API (for protected files)
 * @param document The document metadata containing file information
 * @param applicationId The application ID for constructing the file path
 * @returns Promise with download result
 */
export const downloadDocumentWithAuth = async (
    document: FileMetadata,
    applicationId: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const apiUrl = getApiUrl();
        const uploadPath = getUploadPath();

        // Construct the file path
        let fileUrl: string;

        if (uploadPath.startsWith('http')) {
            // For cloud storage, we might need to use a proxy endpoint
            fileUrl = `${apiUrl}/certificate-applications/download-document/${applicationId}/${document.name}`;
        } else {
            // For local file storage
            fileUrl = `${apiUrl}/certificate-applications/download-document/${applicationId}/${document.name}`;
        }

        // Fetch the file with authentication
        const response = await fetch(fileUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Get the file blob
        const blob = await response.blob();

        // Create object URL and download
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = document.name;
        window.document.body.appendChild(link);
        link.click();

        // Cleanup
        window.document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Error downloading document with auth:', error);
        return {
            success: false,
            error: 'डॉक्युमेंट डाउनलोड करण्यात त्रुटी आली आहे'
        };
    }
};

/**
 * Gets the document URL for viewing/downloading
 * @param document The document metadata containing file information
 * @param applicationId The application ID for constructing the file path
 * @returns The constructed document URL
 */
export const getDocumentUrl = (document: FileMetadata, applicationId: string): string => {
    const apiUrl = getApiUrl();
    const uploadPath = getUploadPath();

    if (uploadPath.startsWith('http')) {
        // For cloud storage (AWS S3, etc.)
        return `${uploadPath}/${applicationId}/${document.name}`;
    } else {
        // For local file storage
        return `${apiUrl}/${uploadPath}/${applicationId}/${document.name}`;
    }
};
