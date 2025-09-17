import { GridFilterModel, GridSortModel } from "@mui/x-data-grid";
import {
    FormState,
    Project,
    ApplyCertificateFormState,
    FileMetadata,
    ALLOWED_FILE_TYPES,
    BLOCKED_FILE_EXTENSIONS,
    ApplicationStatusUpdate,
    DocumentType,
    FILE_FIELD_NAMES
} from "../types";
import { getCachedAccessControlIds } from "../utils/decryptUtils";

// API URL from environment
const API_URL = import.meta.env.VITE_API_URL;

// Interfaces for API requests and responses
export interface DataGridQueryParams {
    page: number;
    pageSize: number;
    searchText?: string;
    filterModel?: GridFilterModel;
    sortModel?: GridSortModel;
    exportMode?: boolean;
    status?: number[];
}

export interface CertificateSuggestion {
    id: number;
    name: string;
}

// Certificate interface for the data grid - updated to match backend data structure
export interface Certificate {
    क्रमांक: number;
    अर्ज_क्रमांक: string;
    अर्जदाराचे_नाव: string;
    अर्जदाराचे_गाव: string;
    प्रकल्प_ग्रस्ताचे_नाव: string;
    प्रकल्पाचे_नाव: string;
    स्थिती_आयडी: number;
    स्थिती: string;
    तयार_दिनांक: string;
    प्रमाणपत्र_धारक: string;
    // Index signature for additional fields that might be returned by the API
    [key: string]: string | number | boolean | null | undefined;
}

export interface CertificateResponse {
    data: Certificate[];
    total: number;
    page?: number;
    pageSize?: number;
}

/**
 * Fetches paginated certificate data with filtering, sorting, and search
 * @param params Query parameters for the data grid
 * @returns Promise with paginated certificate data
 */
export const fetchCertificateData = async (params: DataGridQueryParams): Promise<CertificateResponse> => {
    try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', params.page.toString());
        queryParams.append('pageSize', params.pageSize.toString());
        if (params.searchText) {
            queryParams.append('search', params.searchText);
        }
        const statusId = params.status?.[0];

        const response = await fetch(
            `${API_URL}/admin/pramanpatra?${queryParams.toString()}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    filterModel: params.filterModel,
                    sortModel: params.sortModel,
                    exportMode: params.exportMode || false,
                    isStatus: statusId === 0 ? [1, 3, 4] : params.status
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch certificate data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching certificate data:', error);
        return { data: [], total: 0 };
    }
};

/**
 * Fetches a specific certificate for editing
 * @param rowId The ID of the certificate to edit
 * @returns Promise with certificate data for editing
 */
export const fetchCertificateForEditing = async (rowId: number): Promise<FormState | null> => {
    try {
        const response = await fetch(
            `${API_URL}/admin/get_pramanpatra_to_edit?rowId=${rowId}`,
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch certificate data for editing');
        }

        const data = await response.json();
        return data.data[0];
    } catch (error) {
        console.error('Error fetching certificate data for editing:', error);
        return null;
    }
};

/**
 * Fetches certificate data for export with all filters applied
 * @param params Query parameters including filters, sorting, and search
 * @returns Promise with all matching certificates for export
 */
export const fetchCertificatesForExport = async (
    filterModel: GridFilterModel,
    sortModel: GridSortModel,
    searchText: string
): Promise<CertificateResponse> => {
    try {
        const response = await fetch(
            `${API_URL}/admin/export_pramanpatra`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    filterModel,
                    sortModel,
                    searchText,
                    exportMode: true
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch data for export');
        }

        const data = await response.json();

        // Handle the success flag format from our updated server response
        if (data.success) {
            return {
                data: data.data || [],
                total: data.total || data.data?.length || 0
            };
        }

        return data;
    } catch (error) {
        console.error('Error exporting certificate data:', error);
        throw error;
    }
};

/**
 * Fetches certificate name suggestions for autocomplete
 * @param query The search query
 * @returns Promise with matching name suggestions
 */
export const fetchCertificateNameSuggestions = async (query: string): Promise<CertificateSuggestion[]> => {
    try {
        const response = await fetch(
            `${API_URL}/admin/getGrastNames?query=${encodeURIComponent(query)}`,
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch name suggestions');
        }

        const data = await response.json();
        return data.suggestions || [];
    } catch (error) {
        console.error('Error fetching name suggestions:', error);
        return [];
    }
};

/**
 * Fetches all projects for dropdown selection
 * @returns Promise with all available projects
 */
export const fetchProjects = async (): Promise<Project[]> => {
    try {
        const response = await fetch(
            `${API_URL}/admin/getProjects`,
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        return data.projects || [];
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
};

// ================ CERTIFICATE APPLICATION APIs ================

/**
 * Validates file before upload
 * @param file File to validate
 * @returns Validation result with success status and error message
 */
export const validateFile = (file: File, maxSizeMB: number = 5): { success: boolean; error?: string } => {
    // Check file size (5MB limit by default)
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
        return { success: false, error: `फाइल आकार ${maxSizeMB}MB पेक्षा कमी असावा` };
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (BLOCKED_FILE_EXTENSIONS.includes(fileExtension)) {
        return { success: false, error: 'या प्रकारची फाइल अपलोड करण्याची परवानगी नाही' };
    }

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return { success: false, error: 'केवळ PDF, JPG, PNG, DOC, DOCX फाइल अपलोड करा' };
    }

    return { success: true };
};

/**
 * Uploads a document file to the server
 * @param file File to upload
 * @param documentType Type of document being uploaded
 * @param applicationId Application ID (if updating existing application)
 * @returns Promise with upload result and file metadata
 */
export const uploadDocument = async (
    file: File,
    documentType: string,
    applicationId?: string
): Promise<{ success: boolean; data?: FileMetadata; error?: string }> => {
    try {
        // Validate file first
        const validation = validateFile(file);
        if (!validation.success) {
            return { success: false, error: validation.error };
        }

        const formData = new FormData();
        formData.append('file', file);

        // Construct the correct URL based on whether applicationId is provided
        const uploadUrl = applicationId
            ? `${API_URL}/certificate-applications/${applicationId}/upload-document?documentType=${documentType}`
            : `${API_URL}/upload-document`;

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('फाइल अपलोड करण्यात अयशस्वी');
        }

        const result = await response.json();

        if (result.success) {
            const fileMetadata: FileMetadata = {
                id: result.data.documentId || result.data.fileId, // Handle both response formats
                name: file.name,
                size: file.size,
                type: file.type,
                uploadedAt: new Date(),
                documentType: documentType
            };

            return { success: true, data: fileMetadata };
        } else {
            return { success: false, error: result.message || 'फाइल अपलोड करण्यात अयशस्वी' };
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return { success: false, error: 'फाइल अपलोड करण्यात अयशस्वी' };
    }
};

/**
 * Deletes an uploaded document
 * @param fileId ID of the file to delete
 * @param applicationId Application ID (optional, for proper routing)
 * @returns Promise with deletion result
 */
export const deleteDocument = async (fileId: string, applicationId?: string): Promise<{ success: boolean; error?: string }> => {
    try {
        // Use the correct route based on API documentation
        const deleteUrl = applicationId
            ? `${API_URL}/certificate-applications/${applicationId}/documents/${fileId}`
            : `${API_URL}/user/delete-document/${fileId}`;

        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('फाइल डिलीट करण्यात अयशस्वी');
        }

        const result = await response.json();
        return { success: result.success, error: result.message };
    } catch (error) {
        console.error('Error deleting file:', error);
        return { success: false, error: 'फाइल डिलीट करण्यात अयशस्वी' };
    }
};

/**
 * Submits a certificate application with documents (new all-or-nothing approach)
 * @param applicationData Complete application form data
 * @param selectedFiles Object containing selected files for each document type
 * @returns Promise with submission result
 */
export const submitCertificateApplicationWithDocuments = async (
    applicationData: ApplyCertificateFormState,
    selectedFiles: { [key in DocumentType]?: File | null }
): Promise<{ success: boolean; applicationId?: string; documentsCount?: number; error?: string }> => {
    try {
        // Create FormData for multipart form submission
        const formData = new FormData();

        // Add all form fields as JSON string or individual fields
        // First, convert the application data to a format suitable for FormData
        const formFields = {
            ...applicationData,
            submittedBy: sessionStorage.getItem('User_id'),
            submittedAt: new Date(),
            status: 1
        };

        // Add form data as JSON
        formData.append('applicationData', JSON.stringify(formFields));

        // Validate and add files
        let filesAdded = 0;
        const validationErrors: string[] = [];

        Object.entries(selectedFiles).forEach(([documentType, file]) => {
            if (file) {
                // Validate file
                const validation = validateFile(file, 5); // 5MB limit
                if (!validation.success) {
                    validationErrors.push(`${documentType}: ${validation.error}`);
                    return;
                }

                // Get the correct field name for this document type
                const fieldName = FILE_FIELD_NAMES[documentType as DocumentType];
                if (fieldName) {
                    formData.append(fieldName, file);
                    filesAdded++;
                }
            }
        });

        // Check for validation errors
        if (validationErrors.length > 0) {
            return {
                success: false,
                error: `फाइल त्रुटी: ${validationErrors.join(', ')}`
            };
        }

        const response = await fetch(`${API_URL}/certificate-applications/submit-with-documents`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`
                // Don't set Content-Type - let browser set it with boundary for multipart/form-data
            },
            body: formData
        });

        const responseText = await response.text();

        if (!response.ok) {
            // If the new endpoint doesn't exist (404), fall back to the old method
            if (response.status === 404) {
                return await fallbackToOldSubmissionMethod(applicationData, selectedFiles);
            }

            throw new Error(`अर्ज सबमिट करण्यात अयशस्वी (${response.status}): ${responseText}`);
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Invalid response format from server:', parseError);
            throw new Error('Invalid response format from server');
        }

        if (result.success) {
            return {
                success: true,
                applicationId: result.data.applicationId,
                documentsCount: result.data.documentsCount || filesAdded
            };
        } else {
            return {
                success: false,
                error: result.message || 'अर्ज सबमिट करण्यात अयशस्वी'
            };
        }
    } catch (error) {
        console.error('Error submitting application with documents:', error);
        return { success: false, error: 'अर्ज सबमिट करण्यात अयशस्वी' };
    }
};

/**
 * Fallback method when the new endpoint is not available
 * Creates application first, then uploads files individually
 */
const fallbackToOldSubmissionMethod = async (
    applicationData: ApplyCertificateFormState,
    selectedFiles: { [key in DocumentType]?: File | null }
): Promise<{ success: boolean; applicationId?: string; documentsCount?: number; error?: string }> => {
    try {
        // First, submit the application without files
        const applicationResult = await submitCertificateApplication(applicationData);

        if (!applicationResult.success || !applicationResult.applicationId) {
            return {
                success: false,
                error: applicationResult.error || 'Application creation failed'
            };
        }

        // Then upload files individually
        let uploadedCount = 0;
        const uploadErrors: string[] = [];

        for (const [documentType, file] of Object.entries(selectedFiles)) {
            if (file) {
                try {
                    const uploadResult = await uploadDocument(file, documentType, applicationResult.applicationId);
                    if (uploadResult.success) {
                        uploadedCount++;
                    } else {
                        uploadErrors.push(`${documentType}: ${uploadResult.error}`);
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    uploadErrors.push(`${documentType}: Upload error`);
                }
            }
        }

        return {
            success: true,
            applicationId: applicationResult.applicationId,
            documentsCount: uploadedCount,
            error: uploadErrors.length > 0 ? `Some files failed to upload: ${uploadErrors.join(', ')}` : undefined
        };

    } catch (error) {
        console.error('Fallback method failed:', error);
        return {
            success: false,
            error: 'Fallback submission failed'
        };
    }
};

/**
 * Submits a certificate application (legacy method for backward compatibility)
 * @param applicationData Complete application form data
 * @returns Promise with submission result
 */
export const submitCertificateApplication = async (
    applicationData: ApplyCertificateFormState
): Promise<{ success: boolean; applicationId?: string; error?: string }> => {
    try {
        const response = await fetch(`${API_URL}/certificate-applications/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ...applicationData,
                submittedBy: sessionStorage.getItem('User_id'),
                submittedAt: new Date(),
                status: 1
            })
        });

        if (!response.ok) {
            throw new Error('अर्ज सबमिट करण्यात अयशस्वी');

        }

        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                applicationId: result.data.applicationId
            };
        } else {
            return {
                success: false,
                error: result.message || 'अर्ज सबमिट करण्यात अयशस्वी'
            };
        }
    } catch (error) {
        console.error('Error submitting application:', error);
        return { success: false, error: 'अर्ज सबमिट करण्यात अयशस्वी' };
    }
};

/**
 * Saves a certificate application as draft
 * @param applicationData Complete application form data
 * @returns Promise with save result
 */
export const saveCertificateApplicationDraft = async (
    applicationData: ApplyCertificateFormState
): Promise<{ success: boolean; applicationId?: string; error?: string }> => {
    try {
        const response = await fetch(`${API_URL}/certificate-applications/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ...applicationData,
                submittedBy: sessionStorage.getItem('User_id'),
                status: 2
            })
        });

        if (!response.ok) {
            throw new Error('अर्ज जतन करण्यात अयशस्वी');
        }

        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                applicationId: result.data.applicationId
            };
        } else {
            return {
                success: false,
                error: result.message || 'अर्ज जतन करण्यात अयशस्वी'
            };
        }
    } catch (error) {
        console.error('Error saving draft:', error);
        return { success: false, error: 'अर्ज जतन करण्यात अयशस्वी' };
    }
};

/**
 * Fetches user's certificate applications
 * @param status Optional status filter
 * @param userId Optional user ID (0 for all users, undefined for current user)
 * @returns Promise with applications list
 */
export const fetchUserCertificateApplications = async (
    status?: string,
    userId?: number
): Promise<{ success: boolean; data?: Certificate[]; error?: string }> => {
    try {
        const url = `${API_URL}/certificate-applications/user/applications`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                userId: userId === 0 ? 0 : sessionStorage.getItem('User_id'),
                status: status || undefined
            })
        });

        const result = await response.json();

        if (response.ok) {
            return {
                success: true,
                data: result.data
            };
        } else {
            return {
                success: false,
                error: result.message || 'Applications लोड करण्यात अयशस्वी'
            };
        }
    } catch (error) {
        console.error('Error fetching user applications:', error);
        return {
            success: false,
            error: 'नेटवर्क त्रुटी'
        };
    }
};

/**
 * Updates an existing certificate application
 * @param applicationId ID of the application to update
 * @param applicationData Updated application data
 * @returns Promise with update result
 */
export const updateCertificateApplication = async (
    applicationId: string,
    applicationData: ApplyCertificateFormState
): Promise<{ success: boolean; error?: string }> => {
    try {
        const response = await fetch(`${API_URL}/certificate-applications/${applicationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem('token')}`
            },
            body: JSON.stringify(applicationData)
        });

        if (!response.ok) {
            throw new Error('अर्ज अपडेट करण्यात अयशस्वी');
        }

        const result = await response.json();
        return {
            success: result.success,
            error: result.message
        };
    } catch (error) {
        console.error('Error updating application:', error);
        return { success: false, error: 'अर्ज अपडेट करण्यात अयशस्वी' };
    }
};

/**
 * Fetches certificate application details for verification
 * @param applicationId The ID of the application to fetch
 * @returns Promise with application data for verification
 */
export const fetchCertificateApplicationDetails = async (applicationId: string | number): Promise<{ success: boolean; data?: ApplyCertificateFormState; error?: string }> => {
    try {
        const response = await fetch(
            `${API_URL}/certificate-applications/${applicationId}`,
            {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch application details');
        }

        const result = await response.json();

        if (result.success) {
            return {
                success: true,
                data: result.data
            };
        } else {
            return {
                success: false,
                error: result.message || 'Failed to fetch application details'
            };
        }
    } catch (error) {
        console.error('Error fetching application details:', error);
        return {
            success: false,
            error: 'Application details लोड करण्यात त्रुटी आली आहे'
        };
    }
};

/**
 * Updates the status of a certificate application
 * @param applicationId The ID of the application to update
 * @param newStatus The new status number to set
 * @param reason Optional reason for the status change
 * @returns Promise with status update result
 */
export const updateCertificateApplicationStatus = async (
    applicationId: string | number,
    newStatus: number,
    reason?: string
): Promise<{ success: boolean; error?: string }> => {
    try {
        const response = await fetch(
            `${API_URL}/certificate-applications/update-status`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    applicationId: applicationId,
                    newStatus: newStatus,
                    reason: reason,
                    updatedBy: sessionStorage.getItem('User_id'),
                    updatedAt: new Date()
                })
            }
        );

        if (!response.ok) {
            throw new Error('Failed to update application status');
        }

        const result = await response.json();

        if (result.success) {
            return {
                success: true
            };
        } else {
            return {
                success: false,
                error: result.message || 'Failed to update application status'
            };
        }
    } catch (error) {
        console.error('Error updating application status:', error);
        return {
            success: false,
            error: 'अर्ज स्थिती अपडेट करण्यात त्रुटी आली आहे'
        };
    }
};

// Fetch application status updates for user dashboard
export const fetchApplicationStatusUpdates = async (): Promise<{
    success: boolean;
    data?: ApplicationStatusUpdate[];
    error?: string;
}> => {
    try {
        // For admin view (userId = 0), we need to get all status updates
        // Since there's no specific admin endpoint for status updates, we'll use the user endpoint
        // but pass userId = 0 to indicate we want all updates
        const url = `${API_URL}/certificate-applications/user/status-updates`;
        const userAccessLevelId = getCachedAccessControlIds();
        const response = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                userId: sessionStorage.getItem('User_id'),
                userAccessLevelId: userAccessLevelId?.Access_Level
            })
        });

        const result = await response.json();
        if (response.ok) {
            return {
                success: true,
                data: result.data
            };
        } else {
            return {
                success: false,
                error: result.message || 'Status updates लोड करण्यात अयशस्वी'
            };
        }
    } catch (error) {
        console.error('Error fetching status updates:', error);
        return {
            success: false,
            error: 'नेटवर्क त्रुटी'
        };
    }
};

