import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Modal,
    Chip,
    IconButton,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    CircularProgress,
    Tabs,
    Tab,
    Stepper,
    Step,
    StepLabel,
    useTheme,
    useMediaQuery,
    // Stepper,
    // Step,
    // StepLabel
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Close,
    Person,
    Business,
    LocationOn,
    FilePresent,
    CheckCircle,
    Warning,
    Download,
    Visibility,
    Send,
    ThumbUp,
    ThumbDown,
    CheckCircleOutline,
    RadioButtonUnchecked,
    Error
} from '@mui/icons-material';
import {
    ApplyCertificateFormState,
    DocumentType,
    DOCUMENT_CONFIG
} from '../types';
import { fetchCertificateApplicationDetails, updateCertificateApplicationStatus } from '../api/certificateApi';
import { getUserAccessLevel } from '../utils/decryptUtils';
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from '../utils';
import { transformDocumentsToFileMetadata } from '../utils/documentUtils';
import { downloadDocumentWithAuth } from '../utils/downloadUtils';
import DocumentViewerPopup from './DocumentViewerPopup';

interface VerificationDialogProps {
    open: boolean;
    onClose: () => void;
    applicationId: number;
    onVerificationComplete?: () => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`verification-tabpanel-${index}`}
            aria-labelledby={`verification-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const VerificationDialog: React.FC<VerificationDialogProps> = ({
    open,
    onClose,
    applicationId,
    onVerificationComplete
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const [applicationData, setApplicationData] = useState<ApplyCertificateFormState | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [verificationStep, setVerificationStep] = useState(1);

    // Rejection dialog states
    const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejecting, setRejecting] = useState(false);

    // Send back dialog states
    const [sendBackDialogOpen, setSendBackDialogOpen] = useState(false);
    const [sendBackReason, setSendBackReason] = useState("");
    const [sendingBack, setSendingBack] = useState(false);

    // Document viewer popup states
    const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
    const [currentViewingDocument, setCurrentViewingDocument] = useState<DocumentType | null>(null);

    // Document verification tracking
    const [verifiedDocuments, setVerifiedDocuments] = useState<Set<DocumentType>>(new Set());

    // Get user role from session storage
    const userAccessLevel = getUserAccessLevel(); // Default to clark
    const isCollector = userAccessLevel === 1; // Level 1 is collector
    const isClark = userAccessLevel === 2; // Level 2 is clark

    // Reset state and load application data when dialog opens
    useEffect(() => {
        if (open && applicationId) {
            // Reset all state
            setApplicationData(null);
            setLoading(false);
            setError(null);
            setActiveTab(0);
            setVerificationStep(1);
            setRejectionDialogOpen(false);
            setRejectionReason("");
            setRejecting(false);
            setSendBackDialogOpen(false);
            setSendBackReason("");
            setSendingBack(false);

            // Load fresh data
            loadApplicationData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, applicationId]);

    const loadApplicationData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchCertificateApplicationDetails(applicationId);

            if (result.success && result.data) {
                // Transform document data structure to FileMetadata format
                const transformedData = {
                    ...result.data,
                    documents: transformDocumentsToFileMetadata(result.data.documents)
                };
                setApplicationData(transformedData);
                setVerifiedDocuments(new Set());
            } else {
                setError(result.error || 'अर्ज डेटा लोड करण्यात त्रुटी आली आहे');
            }
        } catch (error) {
            console.error('Error loading application data:', error);
            setError('अर्ज डेटा लोड करण्यात त्रुटी आली आहे');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        // Mark this step as completed when user clicks on a tab
        if (newValue > verificationStep) {
            setVerificationStep(newValue + 1);
        }
    };

    const handleDownloadDocument = async (documentType: DocumentType) => {
        const document = applicationData?.documents[documentType];
        if (document && applicationData?.applicationId) {
            try {
                // Mark document as verified when user downloads it
                markDocumentAsVerified(documentType);

                // Show loading message
                // handleSuccess(`${document.name} डाउनलोड सुरू झाले...`);

                // Download the document
                const result = await downloadDocumentWithAuth(document, applicationData.applicationId);

                if (result.success) {
                    // handleSuccess(`${document.name} यशस्वीरित्या डाउनलोड झाले आणि पडताळले`);
                } else {
                    handleError(result.error || 'डॉक्युमेंट डाउनलोड करण्यात त्रुटी आली आहे');
                }
            } catch (error) {
                console.error('Download error:', error);
                handleError('डॉक्युमेंट डाउनलोड करण्यात त्रुटी आली आहे');
            }
        } else {
            handleError('डॉक्युमेंट माहिती उपलब्ध नाही');
        }
    };

    const handleViewDocument = (documentType: DocumentType) => {
        const document = applicationData?.documents[documentType];
        if (document && applicationData?.applicationId) {
            try {
                // Mark document as verified when user views it
                markDocumentAsVerified(documentType);

                // Set the current viewing document and open popup
                setCurrentViewingDocument(documentType);
                setDocumentViewerOpen(true);
                // handleSuccess(`${document.name} पॉपअपमध्ये उघडले आणि पडताळले`);
            } catch (error) {
                console.error('View document error:', error);
                handleError('डॉक्युमेंट पहाण्यात त्रुटी आली आहे');
            }
        } else {
            handleError('डॉक्युमेंट माहिती उपलब्ध नाही');
        }
    };

    // Document viewer popup handlers
    const handleCloseDocumentViewer = () => {
        setDocumentViewerOpen(false);
        setCurrentViewingDocument(null);
    };

    const handleNavigateToDocument = (documentType: DocumentType) => {
        setCurrentViewingDocument(documentType);
    };

    const handleDownloadFromViewer = async (documentType: DocumentType) => {
        await handleDownloadDocument(documentType);
    };

    // Mark document as verified when user views it
    const markDocumentAsVerified = (documentType: DocumentType) => {
        setVerifiedDocuments(prev => new Set([...prev, documentType]));
    };

    // Document validation function
    const validateDocuments = (): { isValid: boolean; missingDocs: string[]; verifiedCount: number; totalCount: number } => {
        const missingDocs: string[] = [];

        // Check required documents
        const requiredDocs = DOCUMENT_CONFIG.filter(doc => doc.required);
        for (const doc of requiredDocs) {
            if (!applicationData?.documents[doc.id]) {
                missingDocs.push(doc.name);
            }
        }

        // Count verified documents
        const availableDocuments = Object.keys(applicationData?.documents || {}).filter(
            docType => applicationData?.documents[docType as DocumentType]
        ) as DocumentType[];

        const verifiedCount = availableDocuments.filter(docType => verifiedDocuments.has(docType)).length;
        const totalCount = availableDocuments.length;

        return {
            isValid: missingDocs.length === 0 && verifiedCount === totalCount && totalCount > 0,
            missingDocs,
            verifiedCount,
            totalCount
        };
    };

    // Check if all verification steps are complete
    const isVerificationComplete = () => {
        const documentValidation = validateDocuments();
        return documentValidation.isValid && verificationStep >= 4; // All tabs reviewed
    };

    // Check if application is under review (status 2)
    const isApplicationUnderReview = () => {
        const status = applicationData?.status;
        return status === 'under_review' || (typeof status === 'number' && status === 2);
    };

    // Check if application has status 1 (sent back to clark)
    const isApplicationStatusOne = () => {
        const status = applicationData?.status;
        return typeof status === 'number' && status === 1;
    };

    // Check if application is approved (no buttons should be shown)
    const isApplicationApproved = () => {
        const status = applicationData?.status;
        return status === 'approved' || (typeof status === 'number' && status === 4);
    };

    // Check if application is rejected (no buttons should be shown)
    const isApplicationRejected = () => {
        const status = applicationData?.status;
        return status === 'rejected' || (typeof status === 'number' && status === 5);
    };

    // Check if clark should be disabled (under review status)
    const shouldDisableClarkButtons = () => {
        return isClark && isApplicationUnderReview();
    };

    const handleReject = () => {
        setRejectionDialogOpen(true);
    };
    const handleSendBackToUser = () => {
        setSendBackDialogOpen(true);
    };
    const handleRejectionConfirm = async () => {
        if (!rejectionReason.trim()) {
            handleError("कृपया नाकारण्याचे कारण दर्शवा");
            return;
        }

        setRejecting(true);
        try {
            const result = await updateCertificateApplicationStatus(applicationId, 5, rejectionReason); // Status 5 for rejected

            if (result.success) {
                handleSuccess("अर्ज यशस्वीरित्या नाकारण्यात आला");
                setRejectionDialogOpen(false);
                setRejectionReason("");

                if (onVerificationComplete) {
                    onVerificationComplete();
                }
            } else {
                handleError(result.error || "अर्ज नाकारण्यात त्रुटी आली आहे");
            }
        } catch (error) {
            console.error('Error rejecting application:', error);
            handleError("अर्ज नाकारण्यात त्रुटी आली आहे");
        } finally {
            setRejecting(false);
        }
    };

    const handleRejectionCancel = () => {
        setRejectionDialogOpen(false);
        setRejectionReason("");
    };

    const handleSendBackConfirm = async () => {
        if (!sendBackReason.trim()) {
            handleError("कृपया सुधारणेचे कारण दर्शवा");
            return;
        }

        setSendingBack(true);
        try {
            const result = await updateCertificateApplicationStatus(applicationId, 3, sendBackReason); // Status 3 for sent back to user

            if (result.success) {
                handleSuccess("अर्ज अर्जदारकडे परत पाठवण्यात आला");
                setSendBackDialogOpen(false);
                setSendBackReason("");

                if (onVerificationComplete) {
                    onVerificationComplete();
                }
            } else {
                handleError(result.error || "अर्ज पाठवण्यात त्रुटी आली आहे");
            }
        } catch (error) {
            console.error('Error sending back application:', error);
            handleError("अर्ज पाठवण्यात त्रुटी आली आहे");
        } finally {
            setSendingBack(false);
        }
    };

    const handleSendBackCancel = () => {
        setSendBackDialogOpen(false);
        setSendBackReason("");
    };

    const handleSendToCollector = async () => {
        try {
            const result = await updateCertificateApplicationStatus(applicationId, 3, "पुढे पाठवले"); // Status 3 for sent to collector
            if (result.success) {
                handleSuccess("अर्ज पुढे पाठवण्यात आला");

                if (onVerificationComplete) {
                    onVerificationComplete();
                }
            } else {
                handleError(result.error || "अर्ज पाठवण्यात त्रुटी आली आहे");
            }
        } catch {
            handleError("अर्ज पाठवण्यात त्रुटी आली आहे");
        }
    };

    const handleApprove = async () => {
        try {
            const result = await updateCertificateApplicationStatus(applicationId, 4, "अंतिम मंजुरी दिली"); // Status 4 for approved
            if (result.success) {
                handleSuccess("अर्ज अंतिम मंजुरी दिली");
                if (onVerificationComplete) {
                    onVerificationComplete();
                }
            } else {
                handleError(result.error || "अर्ज मंजुरी देण्यात त्रुटी आली आहे");
            }
        } catch {
            handleError("अर्ज मंजुरी देण्यात त्रुटी आली आहे");
        }
    };

    // Steps configuration for stepper
    const documentValidation = validateDocuments();
    const steps = [
        { label: 'अर्जदाराची माहिती', icon: <Person />, completed: verificationStep >= 1 },
        { label: 'प्रकल्पग्रस्ताची माहिती', icon: <Business />, completed: verificationStep >= 2 },
        { label: 'प्रमाणपत्र धारक', icon: <Person />, completed: verificationStep >= 3 },
        { label: 'बाधित जमीन', icon: <LocationOn />, completed: verificationStep >= 4 },
        {
            label: `कागदपत्रे पडताळणी (${documentValidation.verifiedCount}/${documentValidation.totalCount})`,
            icon: <FilePresent />,
            completed: documentValidation.isValid
        }
    ];

    if (loading) {
        return (
            <Modal open={open} onClose={onClose}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh'
                }}>
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <CircularProgress size={60} />
                        <Typography variant="h6" sx={{ mt: 2 }}>
                            अर्ज डेटा लोड करत आहे...
                        </Typography>
                    </Paper>
                </Box>
            </Modal>
        );
    }

    if (error) {
        return (
            <Modal open={open} onClose={onClose}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh'
                }}>
                    <Paper sx={{ p: 4, maxWidth: 400 }}>
                        <Typography color="error" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                        <Button variant="contained" onClick={onClose} fullWidth>
                            बंद करा
                        </Button>
                    </Paper>
                </Box>
            </Modal>
        );
    }

    return (
        <>
            {/* Rejection Dialog */}
            <Dialog
                open={rejectionDialogOpen}
                onClose={handleRejectionCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: '#f44336', color: 'white' }}>
                    अर्ज नाकारा
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body1" gutterBottom sx={{ fontSize: '1.1rem', pt: 2 }}>
                        कृपया अर्ज नाकारण्याचे कारण दर्शवा:
                    </Typography>
                    <TextField
                        autoFocus
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        label="नाकारण्याचे कारण"
                        value={rejectionReason}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRejectionReason(e.target.value)}
                        placeholder="येथे नाकारण्याचे कारण लिहा..."
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleRejectionCancel}
                        disabled={rejecting}
                        variant="outlined"
                    >
                        रद्द करा
                    </Button>
                    <Button
                        onClick={handleRejectionConfirm}
                        disabled={rejecting || !rejectionReason.trim()}
                        variant="contained"
                        color="error"
                        startIcon={rejecting ? <CircularProgress size={20} /> : <ThumbDown />}
                    >
                        {rejecting ? 'नाकारत आहे...' : 'नाकारा'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Send Back Dialog */}
            <Dialog
                open={sendBackDialogOpen}
                onClose={handleSendBackCancel}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
                    सुधारणा मागा
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="body1" gutterBottom sx={{ fontSize: '1.1rem', pt: 2 }}>
                        कृपया सुधारणेचे कारण दर्शवा:
                    </Typography>
                    <TextField
                        autoFocus
                        multiline
                        rows={4}
                        fullWidth
                        variant="outlined"
                        label="सुधारणेचे कारण"
                        value={sendBackReason}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSendBackReason(e.target.value)}
                        placeholder="येथे सुधारणेचे कारण लिहा..."
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleSendBackCancel}
                        disabled={sendingBack}
                        variant="outlined"
                    >
                        रद्द करा
                    </Button>
                    <Button
                        onClick={handleSendBackConfirm}
                        disabled={sendingBack || !sendBackReason.trim()}
                        variant="contained"
                        sx={{
                            bgcolor: '#ff9800',
                            "&:hover": {
                                bgcolor: '#f57c00'
                            }
                        }}
                        startIcon={sendingBack ? <CircularProgress size={20} /> : <Send sx={{ transform: 'rotate(180deg)' }} />}
                    >
                        {sendingBack ? 'पाठवत आहे...' : 'सुधारणा मागा'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="verification-dialog-title"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: { xs: 1, sm: 2 },
                }}
            >
                <Paper
                    elevation={8}
                    sx={{
                        width: { xs: "100%", sm: "98%", md: "95%" },
                        maxWidth: "2200px",
                        maxHeight: { xs: "98vh", sm: "98vh", md: "98vh" },
                        overflowY: "auto",
                        borderRadius: "12px",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: "#1a5276",
                            p: { xs: 1.5, sm: 2, md: 2.5 },
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            borderTopLeftRadius: "12px",
                            borderTopRightRadius: "12px",
                        }}
                    >
                        <Typography
                            id="verification-dialog-title"
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 600,
                                flex: 1,
                                textAlign: "center",
                                color: "white",
                                letterSpacing: "0.5px",
                                textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                            }}
                        >
                            अर्ज पडताळणी - {applicationId}
                        </Typography>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: "white",
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                },
                                transition: "background-color 0.2s",
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Box>

                    {/* Content */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        height: { xs: 'auto', md: 'calc(100vh - 200px)' }
                    }}>
                        {/* Status 1 Notes Alert */}
                        {isApplicationStatusOne() && (
                            <Box sx={{
                                position: 'sticky',
                                top: 0,
                                zIndex: 1,
                                p: 2,
                                bgcolor: '#fff3cd',
                                border: '1px solid #ffeaa7',
                                borderRadius: 1,
                                mb: 2,
                                mx: 2,
                                mt: 2
                            }}>
                                <Typography variant="h6" sx={{ color: '#856404', fontWeight: 600, mb: 1 }}>
                                    ⚠️ सुधारणेचे निर्देश
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#856404' }}>
                                    या अर्जाला क्लर्ककडून सुधारणेचे निर्देश दिले आहेत. कृपया त्यांचे पालन करून पुन्हा सबमिट करा.
                                </Typography>
                            </Box>
                        )}
                        {/* Left Panel - Form Details */}
                        <Box sx={{
                            flex: 1,
                            borderRight: { xs: 'none', md: '1px solid #e0e0e0' },
                            borderBottom: { xs: '1px solid #e0e0e0', md: 'none' },
                            bgcolor: '#f8f9fa',
                            minHeight: { xs: '400px', md: 'auto' }
                        }}>
                            {/* Desktop Tabs */}
                            {!isMobile && !isTablet && (
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs
                                        value={activeTab}
                                        onChange={handleTabChange}
                                        aria-label="verification tabs"
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        sx={{
                                            '& .MuiTab-root': {
                                                minWidth: 'auto',
                                                fontSize: { xs: '0.8rem', sm: '0.9rem' }
                                            }
                                        }}
                                    >
                                        <Tab
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={() => setVerificationStep(1)}>
                                                    <Person />
                                                    <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>
                                                        अर्जदाराची माहिती
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <Tab
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={() => setVerificationStep(2)}>
                                                    <Business />
                                                    <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>
                                                        प्रकल्पग्रस्ताची माहिती
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <Tab
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={() => setVerificationStep(3)}>
                                                    <Person />
                                                    <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>
                                                        प्रमाणपत्र धारक
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <Tab
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={() => setVerificationStep(4)}>
                                                    <LocationOn />
                                                    <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>
                                                        बाधित जमीन
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </Tabs>
                                </Box>
                            )}

                            {/* Mobile/Tablet Step Navigation */}
                            {(isMobile || isTablet) && (
                                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#000' }}>
                                        माहिती पडताळणी
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {[
                                            { label: 'अर्जदार', icon: <Person />, index: 0 },
                                            { label: 'प्रकल्पग्रस्त', icon: <Business />, index: 1 },
                                            { label: 'प्रमाणपत्र धारक', icon: <Person />, index: 2 },
                                            { label: 'बाधित जमीन', icon: <LocationOn />, index: 3 }
                                        ].map((step, index) => (
                                            <Grid item xs={6} sm={3} key={index}>
                                                <Button
                                                    variant={activeTab === step.index ? "contained" : "outlined"}
                                                    size="small"
                                                    onClick={() => {
                                                        setActiveTab(step.index);
                                                        setVerificationStep(Math.max(verificationStep, step.index));
                                                    }}
                                                    startIcon={step.icon}
                                                    sx={{
                                                        width: '100%',
                                                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                                        py: 1
                                                    }}
                                                >
                                                    {step.label}
                                                </Button>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            {/* Tab Panels */}
                            <TabPanel value={activeTab} index={0}>
                                <Box sx={{
                                    p: { xs: 1, sm: 2 },
                                    borderRadius: 2,
                                    mb: 2,
                                    maxHeight: { xs: '300px', sm: '400px', md: 'calc(100vh - 400px)' },
                                    overflowY: 'auto'
                                }}>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#000', mb: 3, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                                        अर्जदाराची माहिती
                                    </Typography>
                                    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>पूर्ण नाव:</span> {applicationData?.applicant.firstName} {applicationData?.applicant.middleName} {applicationData?.applicant.lastName}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>मोबाईल क्रमांक:</span> {applicationData?.applicant.mobileNumber}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>गाव:</span> {applicationData?.applicant.village}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>तालुका:</span> {applicationData?.applicant.taluka}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>जिल्हा:</span> {applicationData?.applicant.district}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            </TabPanel>

                            <TabPanel value={activeTab} index={1}>
                                <Box sx={{
                                    p: { xs: 1, sm: 2 },
                                    borderRadius: 2,
                                    mb: 2,
                                    maxHeight: { xs: '300px', sm: '400px', md: 'calc(100vh - 400px)' },
                                    overflowY: 'auto'
                                }}>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#000', mb: 3, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                                        प्रकल्पग्रस्ताची माहिती
                                    </Typography>
                                    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>प्रकल्पग्रस्ताचे नाव:</span> {applicationData?.projectAffectedPerson.name}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>प्रकल्पाचे नाव:</span> {applicationData?.projectAffectedPerson.projectName}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>प्रकल्प कामाचे प्रयोजन:</span> {applicationData?.projectAffectedPerson.projectPurpose}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            {applicationData?.projectAffectedPerson.aadhaarId && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                            <span style={{ fontWeight: 600 }}>आधार कार्ड क्रमांक:</span> {applicationData?.projectAffectedPerson.aadhaarId}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            )}
                                            {applicationData?.projectAffectedPerson.farmerId && (
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                            <span style={{ fontWeight: 600 }}>शेतकरी आयडी:</span> {applicationData?.projectAffectedPerson.farmerId}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                </Box>
                            </TabPanel>

                            <TabPanel value={activeTab} index={2}>
                                <Box sx={{
                                    p: { xs: 1, sm: 2 },
                                    borderRadius: 2,
                                    mb: 2,
                                    maxHeight: { xs: '300px', sm: '400px', md: 'calc(100vh - 400px)' },
                                    overflowY: 'auto'
                                }}>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#000', mb: 3, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                                        प्रमाणपत्र धारकांची माहिती
                                    </Typography>
                                    {applicationData?.certificateHolders.map((holder, index) => (
                                        <Box key={holder.id} sx={{ mb: 4, p: { xs: 2, sm: 3 }, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                                <Typography variant="h6" sx={{ flex: 1, fontWeight: 600, color: '#000', fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                                                    सदस्य {index + 1}
                                                </Typography>
                                                {holder.isCertificateHolder && (
                                                    <Chip
                                                        icon={<CheckCircle />}
                                                        label="प्रमाणपत्र धारक"
                                                        color="success"
                                                        size="small"
                                                    />
                                                )}
                                            </Box>
                                            <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                            <span style={{ fontWeight: 600 }}>पूर्ण नाव:</span> {holder.fullName.firstName} {holder.fullName.middleName} {holder.fullName.lastName}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                            <span style={{ fontWeight: 600 }}>प्रमाणपत्राचे प्रयोजन:</span> {holder.certificatePurpose}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                            <span style={{ fontWeight: 600 }}>प्रकल्पग्रस्ताशी नाते:</span> {holder.relationToPAP}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={4}>
                                                    <Box sx={{ mb: 2 }}>
                                                        <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                            <span style={{ fontWeight: 600 }}>अर्जदाराशी नाते:</span> {holder.relationToApplicant}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    ))}
                                </Box>
                            </TabPanel>

                            <TabPanel value={activeTab} index={3}>
                                <Box sx={{
                                    p: { xs: 1, sm: 2 },
                                    borderRadius: 2,
                                    mb: 2,
                                    maxHeight: { xs: '300px', sm: '400px', md: 'calc(100vh - 400px)' },
                                    overflowY: 'auto'
                                }}>
                                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#000', mb: 3, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                                        बाधित जमिनीची माहिती
                                    </Typography>
                                    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>गाव:</span> {applicationData?.affectedLand.village}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>तालुका:</span> {applicationData?.affectedLand.taluka}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>जिल्हा:</span> {applicationData?.affectedLand.district}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>सर्व्हे/गट नंबर:</span> {applicationData?.affectedLand.surveyGroupNumber}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>घर क्रमांक:</span> {applicationData?.affectedLand.houseNumber}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>क्षेत्र (हे.आर):</span> {applicationData?.affectedLand.areaInHectares}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="body1" sx={{ color: '#333', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                                                        <span style={{ fontWeight: 600 }}>क्षेत्र (चौ.मी):</span> {applicationData?.affectedLand.areaInSquareMeters}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            </TabPanel>
                        </Box>

                        {/* Right Panel - Documents */}
                        <Box sx={{
                            width: { xs: '100%', md: '500px' },
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: { xs: '300px', md: 'auto' }
                        }}>
                            <Box sx={{ p: { xs: 1, sm: 2 }, borderBottom: '1px solid #e0e0e0' }}>
                                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                                    <FilePresent sx={{ mr: 1, verticalAlign: 'middle' }} />
                                    आवश्यक कागदपत्रे
                                </Typography>

                                {/* Document Validation Alert */}
                                {!documentValidation.isValid && (
                                    <Box sx={{
                                        p: 2,
                                        mb: 2,
                                        bgcolor: documentValidation.verifiedCount > 0 ? '#e3f2fd' : '#fff3cd',
                                        border: `1px solid ${documentValidation.verifiedCount > 0 ? '#90caf9' : '#ffeaa7'}`,
                                        borderRadius: 1,
                                        color: documentValidation.verifiedCount > 0 ? '#1565c0' : '#856404'
                                    }}>
                                        <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                                            {documentValidation.verifiedCount > 0
                                                ? `${documentValidation.verifiedCount}/${documentValidation.totalCount} कागदपत्रे पडताळले. सर्व कागदपत्रे पडताळा.`
                                                : `${documentValidation.missingDocs.length} आवश्यक कागदपत्रे गहाळ आहेत`
                                            }
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1, sm: 2 } }}>
                                <List sx={{ width: '100%' }}>
                                    {DOCUMENT_CONFIG.map((docConfig) => {
                                        const document = applicationData?.documents[docConfig.id];
                                        const isUploaded = !!document;
                                        const isVerified = verifiedDocuments.has(docConfig.id);

                                        return (
                                            <ListItem
                                                key={docConfig.id}
                                                sx={{
                                                    border: isVerified ? '2px solid #4caf50' : '1px solid #e0e0e0',
                                                    borderRadius: 1,
                                                    mb: 1,
                                                    backgroundColor: isVerified ? '#e8f5e8' : (isUploaded ? '#f8f9fa' : '#fff3e0'),
                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                    alignItems: { xs: 'flex-start', sm: 'center' }
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 'auto', mr: { xs: 0, sm: 1 } }}>
                                                    {isVerified ? (
                                                        <CheckCircle color="success" />
                                                    ) : isUploaded ? (
                                                        <FilePresent color="primary" />
                                                    ) : (
                                                        <Warning color="warning" />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            <span style={{ fontSize: '0.8rem' }}>
                                                                {docConfig.name}
                                                                {isVerified && (
                                                                    <Chip
                                                                        label="पडताळले"
                                                                        size="small"
                                                                        color="success"
                                                                        sx={{ ml: 1, fontSize: '0.7rem', height: '20px' }}
                                                                    />
                                                                )}
                                                            </span>
                                                            {docConfig.required && (
                                                                <Chip label="आवश्यक" size="small" color="error" />
                                                            )}
                                                        </span>
                                                    }
                                                    secondary={
                                                        isUploaded ? (
                                                            <span>
                                                                <span style={{ fontSize: '0.7rem', color: 'rgba(0, 0, 0, 0.6)', display: 'block' }}>
                                                                    {document?.name}
                                                                </span>
                                                                <span style={{ fontSize: '0.6rem', color: 'rgba(0, 0, 0, 0.6)', display: 'block' }}>
                                                                    {(document?.size || 0) / 1024} KB
                                                                </span>
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontSize: '0.7rem', color: '#d32f2f' }}>
                                                                अपलोड केले नाही
                                                            </span>
                                                        )
                                                    }
                                                />
                                                {isUploaded && (
                                                    <Box sx={{ display: 'flex', gap: 1, mt: { xs: 1, sm: 0 } }}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleViewDocument(docConfig.id)}
                                                            title="पहा"
                                                        >
                                                            <Visibility />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDownloadDocument(docConfig.id)}
                                                            title="डाउनलोड करा"
                                                        >
                                                            <Download />
                                                        </IconButton>
                                                    </Box>
                                                )}
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            </Box>
                        </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: { xs: 1, sm: 2 },
                            borderTop: "1px solid #e0e0e0",
                            backgroundColor: "#fafafa",
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 1, sm: 2 }
                        }}
                    >
                        {/* Progress Indicator */}
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: { xs: 1, sm: 0 },
                            width: { xs: '100%', sm: 'auto' }
                        }}>

                            {/* Progress Stepper - Mobile/Tablet View */}
                            {/* {(isMobile || isTablet) && ( */}
                            <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                                <Stepper orientation="horizontal" activeStep={verificationStep} sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {steps.map((step, index) => (
                                        <Step key={index} completed={step.completed}>
                                            <Box
                                                onClick={() => {
                                                    // Map step index to tab index (first 4 steps are tabs, last step is documents)
                                                    if (index < 4) {
                                                        setActiveTab(index);
                                                        setVerificationStep(Math.max(verificationStep, index + 1));
                                                    }
                                                }}
                                                sx={{ cursor: 'pointer' }}
                                            >
                                                <StepLabel
                                                    icon={step.completed ? <CheckCircleOutline color="success" /> : <RadioButtonUnchecked />}
                                                    sx={{
                                                        '& .MuiStepLabel-label': {
                                                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                                            '&:hover': {
                                                                color: '#1976d2',
                                                                textDecoration: 'underline'
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {step.label}
                                                </StepLabel>
                                            </Box>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            gap: { xs: 0.5, sm: 1, md: 1.5 },
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            {isApplicationApproved() ? (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 3,
                                    bgcolor: '#e8f5e8',
                                    border: '2px solid #4caf50',
                                    borderRadius: 2,
                                    color: '#2e7d32'
                                }}>
                                    <CheckCircle sx={{ fontSize: 40, color: '#4caf50' }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            प्रमाणपत्र मंजूर झाले आहे
                                        </Typography>
                                        <Typography variant="body2">
                                            या प्रमाणपत्राला अंतिम मंजुरी दिली आहे. कोणतीही कृती करता येत नाही.
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : isApplicationRejected() ? (
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 3,
                                    bgcolor: '#ffebee',
                                    border: '2px solid #f44336',
                                    borderRadius: 2,
                                    color: '#c62828'
                                }}>
                                    <Error sx={{ fontSize: 40, color: '#f44336' }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            प्रमाणपत्र नाकारण्यात आले आहे
                                        </Typography>
                                        <Typography variant="body2">
                                            या प्रमाणपत्राला नाकारण्यात आले आहे. कोणतीही कृती करता येत नाही.
                                        </Typography>
                                    </Box>
                                </Box>
                            ) : (
                                <>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<ThumbDown />}
                                        onClick={handleReject}
                                        disabled={shouldDisableClarkButtons()}
                                        size="small"
                                        sx={{
                                            px: { xs: 1.5, sm: 2, md: 2.5 },
                                            py: { xs: 0.75, sm: 1 },
                                            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                                            minWidth: { xs: 'auto', sm: 'auto' },
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        नाकारा
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<Send sx={{ transform: 'rotate(180deg)' }} />}
                                        onClick={handleSendBackToUser}
                                        disabled={!isVerificationComplete() || shouldDisableClarkButtons()}
                                        size="small"
                                        sx={{
                                            px: { xs: 1.5, sm: 2, md: 2.5 },
                                            py: { xs: 0.75, sm: 1 },
                                            bgcolor: isVerificationComplete() ? "#ff9800" : "#ccc", // MUI warning color
                                            "&:hover": {
                                                bgcolor: isVerificationComplete() ? "#f57c00" : "#ccc" // Darker warning color
                                            },
                                            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                                            minWidth: { xs: 'auto', sm: 'auto' },
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        सुधारणा मागा
                                    </Button>
                                    {/*पुढे पाठवा */}
                                    {isClark && (
                                        <Button
                                            variant="contained"
                                            endIcon={<Send />}
                                            onClick={handleSendToCollector}
                                            disabled={!isVerificationComplete() || shouldDisableClarkButtons()}
                                            size="small"
                                            sx={{
                                                px: { xs: 1.5, sm: 2, md: 2.5 },
                                                py: { xs: 0.75, sm: 1 },
                                                bgcolor: isVerificationComplete() ? "#1976d2" : "#ccc",
                                                "&:hover": {
                                                    bgcolor: isVerificationComplete() ? "#1565c0" : "#ccc"
                                                },
                                                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                                                minWidth: { xs: 'auto', sm: 'auto' },
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            पुढे पाठवा
                                        </Button>
                                    )}

                                    {isCollector && (
                                        <>
                                            <Button
                                                variant="contained"
                                                startIcon={<ThumbUp />}
                                                onClick={handleApprove}
                                                disabled={!isVerificationComplete()}
                                                size="small"
                                                sx={{
                                                    px: { xs: 1.5, sm: 2, md: 2.5 },
                                                    py: { xs: 0.75, sm: 1 },
                                                    bgcolor: isVerificationComplete() ? "#2e7d32" : "#ccc",
                                                    "&:hover": {
                                                        bgcolor: isVerificationComplete() ? "#1b5e20" : "#ccc"
                                                    },
                                                    fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                                                    minWidth: { xs: 'auto', sm: 'auto' },
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                मंजूर करा
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Modal>

            {/* Document Viewer Popup */}
            <DocumentViewerPopup
                open={documentViewerOpen}
                onClose={handleCloseDocumentViewer}
                document={currentViewingDocument ? applicationData?.documents[currentViewingDocument] || null : null}
                documentType={currentViewingDocument}
                applicationId={applicationData?.applicationId || ''}
                onDownload={handleDownloadFromViewer}
                allDocuments={applicationData?.documents}
                onNavigate={handleNavigateToDocument}
            />

            <ToastContainer />
        </>
    );
};

export default VerificationDialog; 