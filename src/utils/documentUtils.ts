import { FileMetadata, DOCUMENT_CONFIG } from '../types';

// Interface for database document structure
export interface DatabaseDocument {
    document_id?: number;
    file_name?: string;
    file_path?: string;
    file_size?: number;
    file_type?: string;
    document_type?: string;
    uploaded_dt?: string;
    id?: string | number;
    name?: string;
    size?: number;
    type?: string;
    uploadedAt?: string | Date;
    documentType?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    documentId?: string;
}

/**
 * Transform database document structure to FileMetadata format
 * This function handles different possible document structures from API responses
 * and converts them to a consistent FileMetadata format for use in components
 * 
 * @param documents - Object containing document data from API
 * @returns Transformed documents in FileMetadata format
 */
export const transformDocumentsToFileMetadata = (
    documents: { [key: string]: DatabaseDocument | null } | undefined
): { [key: string]: FileMetadata | null } => {
    if (!documents) return {};

    const transformedDocuments: { [key: string]: FileMetadata | null } = {};

    // Initialize all document types from DOCUMENT_CONFIG to ensure consistent structure
    DOCUMENT_CONFIG.forEach(docConfig => {
        transformedDocuments[docConfig.id] = null;
    });

    // Handle different possible document structures from API
    Object.keys(documents).forEach(key => {
        const doc = documents[key];
        if (doc) {
            // Determine the correct key to use - prioritize DOCUMENT_CONFIG enum values
            const documentKey = doc.document_type || doc.documentType || key;

            // Find matching DOCUMENT_CONFIG entry to ensure we use correct enum value
            const configEntry = DOCUMENT_CONFIG.find(config =>
                config.id === documentKey ||
                config.id === key ||
                config.id === doc.document_type ||
                config.id === doc.documentType
            );
            const finalKey = configEntry ? configEntry.id : documentKey;

            // If it's already in FileMetadata format, keep it as is
            if (doc.id && doc.name && doc.size !== undefined && doc.type && doc.uploadedAt) {
                transformedDocuments[finalKey] = doc as FileMetadata;
            }
            // If it's in database format, transform it
            else if (doc.document_id || doc.file_name) {
                transformedDocuments[finalKey] = {
                    id: doc.document_id?.toString() || doc.id?.toString() || '',
                    name: doc.file_name || doc.name || '',
                    size: doc.file_size || doc.size || 0,
                    type: doc.file_type || doc.type || '',
                    uploadedAt: doc.uploaded_dt ? new Date(doc.uploaded_dt) : new Date(),
                    documentType: finalKey
                };
            }
            // If it's a simple object with just file info
            else if (doc.name || doc.fileName) {
                transformedDocuments[finalKey] = {
                    id: doc.id?.toString() || doc.documentId || '',
                    name: doc.name || doc.fileName || '',
                    size: doc.size || doc.fileSize || 0,
                    type: doc.type || doc.fileType || '',
                    uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
                    documentType: finalKey
                };
            }
        }
    });

    return transformedDocuments;
};
