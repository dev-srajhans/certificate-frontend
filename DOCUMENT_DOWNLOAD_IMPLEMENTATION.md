# Document Download Implementation

## Overview
This implementation provides a flexible document download system that supports both local file storage and cloud storage (like AWS S3) through environment variable configuration.

## Files Modified/Created

### 1. `src/utils/envUtils.ts`
- Added `getUploadPath()` function to retrieve the upload path from environment variables
- Supports both local paths (`./uploads`) and cloud URLs (`https://bucket.s3.amazonaws.com`)

### 2. `src/utils/downloadUtils.ts` (NEW FILE)
- `downloadDocument()`: Simple download for public files
- `downloadDocumentWithAuth()`: Secure download with authentication for protected files
- `getDocumentUrl()`: Constructs document URLs based on storage configuration

### 3. `src/Components/VerificationDialog.tsx`
- Updated `handleDownloadDocument()` to use the new download utilities
- Updated `handleViewDocument()` to open documents in new tabs
- Added proper error handling and user feedback

## Environment Configuration

Create a `.env` file in your project root with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Encryption Key (should be at least 32 characters)
VITE_ENCRYPTION_KEY=your_32_character_encryption_key_here

# Upload Path Configuration
# For local development:
VITE_UPLOAD_PATH=./uploads

# For AWS S3:
# VITE_UPLOAD_PATH=https://your-bucket.s3.amazonaws.com

# For other cloud storage:
# VITE_UPLOAD_PATH=https://your-storage-provider.com
```

## How It Works

### File Path Construction
The system constructs file paths based on the `VITE_UPLOAD_PATH` environment variable:

1. **Local Storage**: `{API_URL}/uploads/{applicationId}/{filename}`
2. **Cloud Storage**: `{UPLOAD_PATH}/{applicationId}/{filename}`

### Download Methods

#### 1. Direct Download (for public files)
```typescript
const fileUrl = getDocumentUrl(document, applicationId);
// Opens file directly in browser or downloads
```

#### 2. Authenticated Download (for protected files)
```typescript
const result = await downloadDocumentWithAuth(document, applicationId);
// Uses fetch with Bearer token authentication
```

### Backend Requirements

For the download functionality to work, your backend should:

1. **Serve static files** from the uploads directory
2. **Provide a download endpoint** at `/download-document/{applicationId}/{filename}` with authentication
3. **Handle CORS** for cross-origin requests if needed

Example backend route (Node.js/Express):
```javascript
app.get('/download-document/:applicationId/:filename', authenticateToken, (req, res) => {
    const { applicationId, filename } = req.params;
    const filePath = path.join(uploadsDir, applicationId, filename);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});
```

## Usage Examples

### Local Development
```env
VITE_UPLOAD_PATH=./uploads
```
Files will be served from: `http://localhost:5000/uploads/{applicationId}/{filename}`

### AWS S3 Production
```env
VITE_UPLOAD_PATH=https://my-bucket.s3.amazonaws.com
```
Files will be served from: `https://my-bucket.s3.amazonaws.com/{applicationId}/{filename}`

### Custom Cloud Storage
```env
VITE_UPLOAD_PATH=https://storage.example.com/files
```
Files will be served from: `https://storage.example.com/files/{applicationId}/{filename}`

## Error Handling

The implementation includes comprehensive error handling:

- **File not found**: Shows appropriate error message
- **Network errors**: Handles connection issues gracefully
- **Authentication errors**: Manages token expiration
- **Invalid file paths**: Validates document metadata

## Security Considerations

1. **Authentication**: All downloads use Bearer token authentication
2. **File validation**: Only allows access to files within the application's directory
3. **CORS**: Properly configured for cross-origin requests
4. **Error messages**: Don't expose sensitive file system information

## Testing

To test the implementation:

1. Set up your `.env` file with appropriate values
2. Ensure your backend serves files correctly
3. Test with different file types (PDF, images, documents)
4. Verify error handling with invalid files
5. Test both download and view functionality

## Migration from Current Setup

If you're currently using a different file storage system:

1. Update the `VITE_UPLOAD_PATH` environment variable
2. Ensure your backend can serve files from the new location
3. Test the download functionality
4. Update any hardcoded file paths in your backend

## Future Enhancements

Potential improvements:
- File preview functionality
- Batch download capabilities
- Download progress indicators
- File compression for large documents
- Virus scanning integration
