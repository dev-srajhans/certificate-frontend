import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    IconButton,
    Button,
    Typography,
    Box,
    CircularProgress,
    Chip,
    Tooltip,
    Paper
} from '@mui/material';
import {
    Close,
    Download,
    ZoomIn,
    ZoomOut,
    RotateRight,
    NavigateBefore,
    NavigateNext,
    ErrorOutline,
    OpenInNew,
    Remove,
    Fullscreen,
    FullscreenExit
} from '@mui/icons-material';
import { FileMetadata, DocumentType, DOCUMENT_CONFIG } from '../types';
import { getDocumentUrl } from '../utils/downloadUtils';
import { downloadDocumentWithAuth } from '../utils/downloadUtils';

interface DocumentViewerPopupProps {
    open: boolean;
    onClose: () => void;
    document: FileMetadata | null;
    documentType: DocumentType | null;
    applicationId: string;
    onDownload?: (documentType: DocumentType) => void;
    allDocuments?: { [key in DocumentType]?: FileMetadata | null };
    onNavigate?: (documentType: DocumentType) => void;
}

const DocumentViewerPopup: React.FC<DocumentViewerPopupProps> = ({
    open,
    onClose,
    document,
    documentType,
    applicationId,
    onDownload,
    allDocuments,
    onNavigate
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [documentBlob, setDocumentBlob] = useState<string | null>(null);

    // Draggable and resizable state
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [size, setSize] = useState({ width: 900, height: 650 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

    const popupRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<HTMLDivElement>(null);

    // Fetch document with authentication
    const fetchDocumentBlob = useCallback(async () => {
        if (!document || !applicationId) return;

        try {
            setLoading(true);
            setError(null);

            // Use the authenticated download function to get the file
            const result = await downloadDocumentWithAuth(document, applicationId);

            if (result.success) {
                // The downloadDocumentWithAuth function handles the download
                // For viewing, we need to fetch the file as blob
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const uploadPath = import.meta.env.VITE_UPLOAD_PATH || './uploads';

                let fileUrl: string;
                if (uploadPath.startsWith('http')) {
                    fileUrl = `${apiUrl}/certificate-applications/download-document/${applicationId}/${document.name}`;
                } else {
                    fileUrl = `${apiUrl}/certificate-applications/download-document/${applicationId}/${document.name}`;
                }

                const response = await fetch(fileUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                setDocumentBlob(blobUrl);
                setLoading(false);
            } else {
                throw new Error(result.error || 'Failed to fetch document');
            }
        } catch (error) {
            console.error('Error fetching document:', error);
            setError('डॉक्युमेंट लोड करण्यात त्रुटी आली आहे');
            setLoading(false);
        }
    }, [document, applicationId]);

    // Reset state when document changes
    useEffect(() => {
        if (document) {
            setLoading(true);
            setError(null);
            setZoom(100);
            setRotation(0);
            setDocumentBlob(null);
            setIsMinimized(false);
            setIsMaximized(false);
            fetchDocumentBlob();
        }
    }, [document, applicationId, fetchDocumentBlob]);

    // Drag functionality
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === dragRef.current || (dragRef.current && dragRef.current.contains(e.target as Node))) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;

            // Keep popup within viewport bounds
            const maxX = window.innerWidth - size.width;
            const maxY = window.innerHeight - size.height;

            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY))
            });
        }
    }, [isDragging, dragStart, size]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
    }, []);

    // Resize functionality
    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: size.width,
            height: size.height
        });
    };

    const handleResizeMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const deltaX = e.clientX - resizeStart.x;
            const deltaY = e.clientY - resizeStart.y;

            // Increased minimum width to ensure buttons are always visible
            const newWidth = Math.max(500, resizeStart.width + deltaX);
            const newHeight = Math.max(350, resizeStart.height + deltaY);

            setSize({ width: newWidth, height: newHeight });
        }
    }, [isResizing, resizeStart]);

    // Global mouse event listeners
    useEffect(() => {
        if (isDragging || isResizing) {
            window.document.addEventListener('mousemove', isDragging ? handleMouseMove : handleResizeMouseMove);
            window.document.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.document.removeEventListener('mousemove', isDragging ? handleMouseMove : handleResizeMouseMove);
                window.document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, handleMouseMove, handleResizeMouseMove, handleMouseUp]);

    // Cleanup blob URL when component unmounts or document changes
    useEffect(() => {
        return () => {
            if (documentBlob) {
                window.URL.revokeObjectURL(documentBlob);
            }
        };
    }, [documentBlob]);

    // Helper functions
    const getDocumentTypeName = (type: DocumentType): string => {
        const config = DOCUMENT_CONFIG.find(doc => doc.id === type);
        return config?.name || type;
    };

    const getAvailableDocuments = () => {
        if (!allDocuments) return [];
        return Object.entries(allDocuments)
            .filter(([, doc]) => doc !== null)
            .map(([type]) => type as DocumentType);
    };

    const getCurrentDocumentIndex = () => {
        const availableDocs = getAvailableDocuments();
        return documentType ? availableDocs.indexOf(documentType) : -1;
    };

    // Event handlers
    const handleDownload = useCallback(() => {
        if (document && documentType && onDownload) {
            onDownload(documentType);
        }
    }, [document, documentType, onDownload]);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + 25, 300));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - 25, 50));
    }, []);

    const handleRotate = useCallback(() => {
        setRotation(prev => (prev + 90) % 360);
    }, []);


    const handleMinimize = () => {
        setIsMinimized(prev => !prev);
    };

    const handleMaximize = () => {
        if (isMaximized) {
            // Restore to previous size and position
            setSize({ width: 900, height: 650 });
            setPosition({ x: 100, y: 100 });
        } else {
            // Maximize to full screen
            setSize({ width: window.innerWidth - 20, height: window.innerHeight - 20 });
            setPosition({ x: 10, y: 10 });
        }
        setIsMaximized(prev => !prev);
    };

    const handlePreviousDocument = useCallback(() => {
        if (!allDocuments) return;
        const availableDocs = Object.entries(allDocuments)
            .filter(([, doc]) => doc !== null)
            .map(([type]) => type as DocumentType);
        const currentIndex = documentType ? availableDocs.indexOf(documentType) : -1;
        if (currentIndex > 0 && onNavigate) {
            onNavigate(availableDocs[currentIndex - 1]);
        }
    }, [allDocuments, documentType, onNavigate]);

    const handleNextDocument = useCallback(() => {
        if (!allDocuments) return;
        const availableDocs = Object.entries(allDocuments)
            .filter(([, doc]) => doc !== null)
            .map(([type]) => type as DocumentType);
        const currentIndex = documentType ? availableDocs.indexOf(documentType) : -1;
        if (currentIndex < availableDocs.length - 1 && onNavigate) {
            onNavigate(availableDocs[currentIndex + 1]);
        }
    }, [allDocuments, documentType, onNavigate]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!open) return;

            switch (event.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowLeft':
                    handlePreviousDocument();
                    break;
                case 'ArrowRight':
                    handleNextDocument();
                    break;
                case '+':
                case '=':
                    if (document && ['jpg', 'jpeg', 'png', 'gif'].includes(document.name.split('.').pop()?.toLowerCase() || '')) {
                        handleZoomIn();
                    }
                    break;
                case '-':
                    if (document && ['jpg', 'jpeg', 'png', 'gif'].includes(document.name.split('.').pop()?.toLowerCase() || '')) {
                        handleZoomOut();
                    }
                    break;
                case 'r':
                case 'R':
                    if (document && ['jpg', 'jpeg', 'png', 'gif'].includes(document.name.split('.').pop()?.toLowerCase() || '')) {
                        handleRotate();
                    }
                    break;
                case 'd':
                case 'D':
                    handleDownload();
                    break;
            }
        };

        if (open) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [open, document, onClose, handlePreviousDocument, handleNextDocument, handleZoomIn, handleZoomOut, handleRotate, handleDownload]);

    const renderDocumentContent = () => {
        if (!document || !documentBlob) return null;

        const fileExtension = document.name.split('.').pop()?.toLowerCase();

        // Handle different file types
        switch (fileExtension) {
            case 'pdf':
                return (
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <iframe
                            src={documentBlob}
                            width="100%"
                            height="100%"
                            style={{
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }}
                            onLoad={() => setLoading(false)}
                            onError={() => {
                                setLoading(false);
                                setError('PDF लोड करण्यात त्रुटी आली आहे');
                            }}
                        />
                    </Box>
                );

            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return (
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'auto'
                        }}
                    >
                        <img
                            src={documentBlob}
                            alt={document.name}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                                transition: 'transform 0.3s ease',
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }}
                            onLoad={() => setLoading(false)}
                            onError={() => {
                                setLoading(false);
                                setError('इमेज लोड करण्यात त्रुटी आली आहे');
                            }}
                        />
                    </Box>
                );

            case 'doc':
            case 'docx':
                return (
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <iframe
                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentBlob)}`}
                            width="100%"
                            height="100%"
                            style={{
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }}
                            onLoad={() => setLoading(false)}
                            onError={() => {
                                setLoading(false);
                                setError('Word document लोड करण्यात त्रुटी आली आहे');
                            }}
                        />
                    </Box>
                );

            default:
                return (
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <ErrorOutline sx={{ fontSize: 64, color: 'text.secondary' }} />
                        <Typography variant="h6" color="text.secondary">
                            या प्रकारची फाइल पहाण्यासाठी समर्थन नाही
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            कृपया डाउनलोड करून पहा
                        </Typography>
                    </Box>
                );
        }
    };

    const availableDocs = getAvailableDocuments();
    const currentIndex = getCurrentDocumentIndex();
    const canNavigate = availableDocs.length > 1;

    if (!open) return null;

    return (
        <>
            {/* Minimized state - show as a small bar */}
            {isMinimized ? (
                <Paper
                    ref={popupRef}
                    sx={{
                        position: 'fixed',
                        top: position.y,
                        left: position.x,
                        width: 300,
                        height: 40,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        cursor: 'move',
                        boxShadow: 3,
                        borderRadius: 1
                    }}
                    onMouseDown={handleMouseDown}
                >
                    <Typography variant="body2" noWrap>
                        {document?.name || 'Document Viewer'}
                    </Typography>
                    <Box>
                        <IconButton size="small" onClick={handleMinimize}>
                            <Fullscreen />
                        </IconButton>
                        <IconButton size="small" onClick={onClose}>
                            <Close />
                        </IconButton>
                    </Box>
                </Paper>
            ) : (
                /* Full popup */
                <Paper
                    ref={popupRef}
                    sx={{
                        position: 'fixed',
                        top: position.y,
                        left: position.x,
                        width: size.width,
                        height: size.height,
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: 6,
                        borderRadius: 2,
                        overflow: 'hidden',
                        backgroundColor: 'background.paper'
                    }}
                >
                    {/* Header with drag handle */}
                    <Box
                        ref={dragRef}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            pb: 1,
                            cursor: 'move',
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            userSelect: 'none'
                        }}
                        onMouseDown={handleMouseDown}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {documentType && (
                                <Chip
                                    label={getDocumentTypeName(documentType)}
                                    color="secondary"
                                    size="small"
                                />
                            )}
                            <Typography variant="h6" noWrap>
                                {document?.name || 'Document Viewer'}
                            </Typography>
                            {canNavigate && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                        {currentIndex + 1} / {availableDocs.length}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {/* Window controls */}
                            <Tooltip title="Minimize">
                                <IconButton onClick={handleMinimize} size="small" sx={{ color: 'inherit' }}>
                                    <Remove />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={isMaximized ? "Restore" : "Maximize"}>
                                <IconButton onClick={handleMaximize} size="small" sx={{ color: 'inherit' }}>
                                    {isMaximized ? <FullscreenExit /> : <Fullscreen />}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Close">
                                <IconButton onClick={onClose} size="small" sx={{ color: 'inherit' }}>
                                    <Close />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* Toolbar */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 0.5,
                        p: 1,
                        borderBottom: 1,
                        borderColor: 'divider',
                        backgroundColor: 'background.default',
                        minHeight: 48,
                        overflow: 'auto',
                        '&::-webkit-scrollbar': {
                            height: 4
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: 'transparent'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            borderRadius: 2
                        }
                    }}>
                        {/* Navigation buttons */}
                        {canNavigate && (
                            <>
                                <Tooltip title="मागील डॉक्युमेंट (←)">
                                    <IconButton
                                        onClick={handlePreviousDocument}
                                        disabled={currentIndex <= 0}
                                        size="small"
                                        sx={{ minWidth: 32, minHeight: 32 }}
                                    >
                                        <NavigateBefore />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="पुढील डॉक्युमेंट (→)">
                                    <IconButton
                                        onClick={handleNextDocument}
                                        disabled={currentIndex >= availableDocs.length - 1}
                                        size="small"
                                        sx={{ minWidth: 32, minHeight: 32 }}
                                    >
                                        <NavigateNext />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}

                        {/* Control buttons */}
                        {document && ['jpg', 'jpeg', 'png', 'gif'].includes(document.name.split('.').pop()?.toLowerCase() || '') && (
                            <>
                                <Tooltip title="झूम इन (+)">
                                    <IconButton onClick={handleZoomIn} size="small" sx={{ minWidth: 32, minHeight: 32 }}>
                                        <ZoomIn />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="झूम आउट (-)">
                                    <IconButton onClick={handleZoomOut} size="small" sx={{ minWidth: 32, minHeight: 32 }}>
                                        <ZoomOut />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="फिरवा (R)">
                                    <IconButton onClick={handleRotate} size="small" sx={{ minWidth: 32, minHeight: 32 }}>
                                        <RotateRight />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}

                        <Tooltip title="डाउनलोड">
                            <IconButton onClick={handleDownload} size="small" sx={{ minWidth: 32, minHeight: 32 }}>
                                <Download />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="नवीन टॅबमध्ये उघडा">
                            <IconButton
                                onClick={() => {
                                    if (document) {
                                        const documentUrl = getDocumentUrl(document, applicationId);
                                        window.open(documentUrl, '_blank');
                                    }
                                }}
                                size="small"
                                sx={{ minWidth: 32, minHeight: 32 }}
                            >
                                <OpenInNew />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Content area */}
                    <Box sx={{
                        flex: 1,
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {loading && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 1
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        )}

                        {error && (
                            <Box sx={{ p: 2 }}>
                                <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                                    {error}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleDownload}
                                        startIcon={<Download />}
                                    >
                                        डाउनलोड करा
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => {
                                            if (document) {
                                                const documentUrl = getDocumentUrl(document, applicationId);
                                                window.open(documentUrl, '_blank');
                                            }
                                        }}
                                    >
                                        नवीन टॅबमध्ये उघडा
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {!loading && !error && documentBlob && renderDocumentContent()}

                        {!loading && !error && !documentBlob && (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                                    डॉक्युमेंट लोड होत आहे...
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        if (document) {
                                            const documentUrl = getDocumentUrl(document, applicationId);
                                            window.open(documentUrl, '_blank');
                                        }
                                    }}
                                    startIcon={<OpenInNew />}
                                >
                                    नवीन टॅबमध्ये उघडा
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Footer */}
                    <Box sx={{
                        p: 1.5,
                        borderTop: 1,
                        borderColor: 'divider',
                        backgroundColor: 'background.default',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: 56,
                        flexWrap: 'wrap',
                        gap: 1
                    }}>
                        <Box sx={{ minWidth: 120 }}>
                            {document && ['jpg', 'jpeg', 'png', 'gif'].includes(document.name.split('.').pop()?.toLowerCase() || '') && (
                                <Typography variant="body2" color="text.secondary" noWrap>
                                    झूम: {zoom}% | फिरवा: {rotation}°
                                </Typography>
                            )}
                        </Box>
                        <Box sx={{
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'nowrap',
                            minWidth: 'fit-content'
                        }}>
                            <Button
                                onClick={onClose}
                                variant="outlined"
                                size="small"
                                sx={{ minWidth: 80 }}
                            >
                                बंद करा
                            </Button>
                            <Button
                                onClick={handleDownload}
                                variant="contained"
                                startIcon={<Download />}
                                size="small"
                                sx={{ minWidth: 120 }}
                            >
                                डाउनलोड करा
                            </Button>
                        </Box>
                    </Box>

                    {/* Resize handle - more noticeable */}
                    <Tooltip title="Drag to resize window" placement="top">
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 24,
                                height: 24,
                                cursor: 'nw-resize',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-end',
                                '&:hover': {
                                    backgroundColor: 'rgba(0,0,0,0.1)',
                                    '&::after': {
                                        opacity: 1
                                    }
                                },
                                '&::after': {
                                    content: '""',
                                    width: 0,
                                    height: 0,
                                    borderLeft: '8px solid transparent',
                                    borderBottom: '8px solid #666',
                                    opacity: 0.6,
                                    transition: 'opacity 0.2s ease',
                                    marginBottom: 2,
                                    marginRight: 2
                                }
                            }}
                            onMouseDown={handleResizeMouseDown}
                        />
                    </Tooltip>

                    {/* Additional resize indicator */}
                    <Tooltip title="Resize" placement="top">
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 2,
                                right: 2,
                                width: 12,
                                height: 12,
                                background: 'linear-gradient(45deg, transparent 30%, #ccc 30%, #ccc 70%, transparent 70%)',
                                opacity: 0.7,
                                cursor: 'nw-resize',
                                '&:hover': {
                                    opacity: 1,
                                    background: 'linear-gradient(45deg, transparent 30%, #999 30%, #999 70%, transparent 70%)'
                                }
                            }}
                            onMouseDown={handleResizeMouseDown}
                        />
                    </Tooltip>
                </Paper>
            )}
        </>
    );

};

export default DocumentViewerPopup;