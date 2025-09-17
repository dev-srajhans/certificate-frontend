import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Modal,
    IconButton,
    Stepper,
    Step,
    StepLabel,
    Slide,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
} from '@mui/material';
import { Close, NavigateNext, NavigateBefore } from '@mui/icons-material';

import {
    ApplyCertificateFormState,
    CertificateHolder,
    Project,
    DocumentType,
    DOCUMENT_CONFIG
} from '../../types';
import { initialCertificateApplicationState } from '../../Helpers/initialFormState';
import {
    fetchProjects,
    submitCertificateApplicationWithDocuments,
    // saveCertificateApplicationDraft,
    uploadDocument,
    deleteDocument,
    validateFile,
    updateCertificateApplication,
    fetchCertificateApplicationDetails
} from '../../api/certificateApi';
import ConfirmationDialog from '../ConfirmationDialog';
import { handleError, handleSuccess } from '../../utils';
import { transformDocumentsToFileMetadata } from '../../utils/documentUtils';
import { Packer } from 'docx';
import { saveAs } from 'file-saver';
import { NavHastantaran } from '../../Helpers/NavHastantaran';
import { DuyamNavHastantaran } from '../../Helpers/DuyamNavHastantaran';
import {
    ApplicantStep,
    ProjectStep,
    FamilyMembersStep,
    CertificateHolderSelectionStep,
    AffectedLandStep,
    DocumentsStep,
    ReviewStep
} from './WizardSteps';
import { getUserAccessLevel } from '../../utils/decryptUtils';

interface ApplyCertificateDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit?: () => void;
    editMode?: boolean;
    certificateData?: ApplyCertificateFormState;
    applicationId?: string;
    applicationStatus?: string; // Add status prop
    whichForm?: number | null; // Add whichForm prop (1: Edit, 2: Nav Hastantaran, 3: Duyam Nav Hastantaran)
}

// Global cache for projects to avoid refetching
let projectsCache: Project[] = [];
let projectsCacheLoaded = false;

export const clearProjectsCache = () => {
    projectsCache = [];
    projectsCacheLoaded = false;
};

// Step configuration
const STEPS = [
    { id: 'applicant', label: 'अर्जदाराची माहिती', description: 'अर्जदाराची वैयक्तिक माहिती' },
    { id: 'project', label: 'प्रकल्पग्रस्ताची माहिती', description: 'प्रकल्प आणि प्रकल्पग्रस्ताची माहिती' },
    { id: 'familyMembers', label: 'कुटुंबातील सदस्य', description: 'प्रकल्पग्रस्ताच्या कुटुंबातील सदस्यांची माहिती' },
    { id: 'certificateHolder', label: 'प्रमाणपत्र धारक निवडा', description: 'कुटुंबातील सदस्यांमधून प्रमाणपत्र धारक निवडा' },
    { id: 'affectedLand', label: 'बाधित जमिनीची माहिती', description: 'बाधित जमिनीची तपशीलवार माहिती' },
    { id: 'documents', label: 'कागदपत्रे', description: 'आवश्यक कागदपत्रांची अपलोड' },
    { id: 'review', label: 'पुनरावलोकन', description: 'सर्व माहितीचे पुनरावलोकन' }
];

const ApplyCertificateDialog: React.FC<ApplyCertificateDialogProps> = ({
    open,
    onClose,
    onSubmit,
    editMode = false,
    applicationId,
    applicationStatus,
    whichForm = 1
}) => {
    const [formData, setFormData] = useState<ApplyCertificateFormState>(initialCertificateApplicationState);
    const [activeStep, setActiveStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [isSaving, setIsSaving] = useState(false);
    const [isLoadingCertificateData, setIsLoadingCertificateData] = useState(false);

    // Handle whichForm logic similar to AddCertificate.tsx
    const duplicateNavHastantaran = whichForm;
    const currentWhichForm = duplicateNavHastantaran === 3 ? 2 : duplicateNavHastantaran;

    // Form type descriptions for debugging/logging
    const getFormTypeDescription = useCallback(() => {
        switch (whichForm) {
            case 1: return "Basic Edit Form (बदल करा)";
            case 2: return "Name Transfer Form (नाव हस्तांतरण)";
            case 3: return "Duplicate Name Transfer Form (दुय्यम प्रतीत नाव हस्तांतरण)";
            default: return "Unknown Form Type";
        }
    }, [whichForm]);

    // Log form type for debugging
    useEffect(() => {
        if (open && editMode) {
            console.log(`ApplyCertificateDialog opened in edit mode with form type: ${getFormTypeDescription()}`);
        }
    }, [open, editMode, whichForm, getFormTypeDescription]);


    const canTransferCertificate = () => {
        const userRole = getUserAccessLevel();
        return userRole === 2 || userRole === 1; // 2 is clark and 1 is collector
    };

    // Certificate transfer states
    const [transferConfirmOpen, setTransferConfirmOpen] = useState(false);
    const [selectedHolderIndex, setSelectedHolderIndex] = useState<number | null>(null);
    const [currentHolderName, setCurrentHolderName] = useState<string>('');
    const [newHolderName, setNewHolderName] = useState<string>('');
    const [hastantaranReason, setHastantaranReason] = useState<string>('');

    // Certificate holder selection logic
    const handleCertificateHolderSelection = (index: number) => {
        // Check if we're trying to deselect the only certificate holder
        const currentHolderIndex = formData.certificateHolders.findIndex(holder => holder.isCertificateHolder);

        if (currentHolderIndex === index) {
            // User is trying to toggle off the current holder - prevent this
            handleError("प्रमाणपत्र धारक हटविता येत नाही। कृपया दुसरा सदस्य निवडा।");
            return;
        }

        // Check if user can transfer certificate
        if (!canTransferCertificate()) {
            handleError("तुम्ही प्रमाणपत्र हस्तांतरित करू शकत नाही। कृपया क्लार्कला विनंती करा।");
            return;
        }

        // If we're in transfer mode (forms 2 or 3)
        if (editMode && (currentWhichForm === 2 || duplicateNavHastantaran === 3)) {
            // Check if form 3 requires reason
            if (duplicateNavHastantaran === 3 && !hastantaranReason.trim()) {
                handleError("कृपया नाव हस्तांतरण प्रमाणपत्राचे कारण भरा।");
                return;
            }

            // Get current and new holder details
            const currentHolder = formData.certificateHolders.find(h => h.isCertificateHolder);
            const newHolder = formData.certificateHolders[index];

            setCurrentHolderName(currentHolder ?
                `${currentHolder.fullName.firstName} ${currentHolder.fullName.middleName} ${currentHolder.fullName.lastName}`.trim() +
                ` (${currentHolder.relationToPAP})` : "सध्याचा धारक");

            setNewHolderName(newHolder ?
                `${newHolder.fullName.firstName} ${newHolder.fullName.middleName} ${newHolder.fullName.lastName}`.trim() +
                ` (${newHolder.relationToPAP})` : "नवीन धारक");

            setSelectedHolderIndex(index);
            setTransferConfirmOpen(true);
        } else {
            // Standard behavior for new applications or form 1
            setFormData(prev => ({
                ...prev,
                certificateHolders: prev.certificateHolders.map((holder, i) => ({
                    ...holder,
                    isCertificateHolder: i === index
                }))
            }));
        }
    };

    // Certificate generation functions
    const generateNavHastantaranCertificate = async (data: ApplyCertificateFormState, currentHolderName: string) => {
        try {
            // Transform data to match old format for certificate generation
            const transformedData = {
                pramanpatra_number: data.applicationId || "",
                prakalpa_nav: data.projectAffectedPerson.projectName || "",
                issue_dt: new Date().toISOString(),
                prakalp_grast_nav: data.projectAffectedPerson.name || "",
                grast_gav: data.applicant.village || "",
                grast_taluka: data.applicant.taluka || "",
                grast_jilha: data.applicant.district || "",
                shet_jamin_gav: data.affectedLand.village || "",
                shet_jamin_taluka: data.affectedLand.taluka || "",
                shet_jamin_jilha: data.affectedLand.district || "",
                shet_jamin_serve_gut: data.affectedLand.surveyGroupNumber || "",
                shet_jamin_shetra: data.affectedLand.areaInHectares || "",
                budit_malmata_gav: data.affectedLand.village || "",
                budit_malmata_taluka: data.affectedLand.taluka || "",
                budit_malmata_jilha: data.affectedLand.district || "",
                budit_malmata_ghar_number: data.affectedLand.houseNumber || "",
                budit_malmata_shetra: data.affectedLand.areaInSquareMeters || "",
                familymembers: data.certificateHolders.map(holder => ({
                    name: `${holder.fullName.firstName || ""} ${holder.fullName.middleName || ""} ${holder.fullName.lastName || ""}`.trim(),
                    relation: holder.relationToPAP || "",
                    pramanpatradharak: holder.isCertificateHolder || false
                }))
            };

            const prakalp_grast_nav = transformedData.prakalp_grast_nav.replace(/\s+/g, "_");
            const blob = await Packer.toBlob(NavHastantaran(transformedData, currentHolderName));
            const certificate_name = prakalp_grast_nav + `_नाव_हस्तांतरण.docx`;

            if (blob) {
                saveAs(blob, certificate_name);
                handleSuccess('नाव हस्तांतरण प्रमाणपत्र डाउनलोड झाले!');
            } else {
                console.error("Blob is undefined, cannot save the file.");
                handleError("प्रमाणपत्र तयार करताना त्रुटी आली आहे");
            }
        } catch (error) {
            console.error("Error generating certificate:", error);
            handleError("प्रमाणपत्र तयार करताना त्रुटी आली आहे");
        }
    };

    const generateDuyamNavHastantaranCertificate = async (data: ApplyCertificateFormState, currentHolderName: string) => {
        try {
            // Transform data to match old format for certificate generation
            const transformedData = {
                pramanpatra_number: data.applicationId || "",
                prakalpa_nav: data.projectAffectedPerson.projectName || "",
                issue_dt: new Date().toISOString(),
                prakalp_grast_nav: data.projectAffectedPerson.name || "",
                grast_gav: data.applicant.village || "",
                grast_taluka: data.applicant.taluka || "",
                grast_jilha: data.applicant.district || "",
                shet_jamin_gav: data.affectedLand.village || "",
                shet_jamin_taluka: data.affectedLand.taluka || "",
                shet_jamin_jilha: data.affectedLand.district || "",
                shet_jamin_serve_gut: data.affectedLand.surveyGroupNumber || "",
                shet_jamin_shetra: data.affectedLand.areaInHectares || "",
                budit_malmata_gav: data.affectedLand.village || "",
                budit_malmata_taluka: data.affectedLand.taluka || "",
                budit_malmata_jilha: data.affectedLand.district || "",
                budit_malmata_ghar_number: data.affectedLand.houseNumber || "",
                budit_malmata_shetra: data.affectedLand.areaInSquareMeters || "",
                hastantaran_reason: hastantaranReason,
                familymembers: data.certificateHolders.map(holder => ({
                    name: `${holder.fullName.firstName || ""} ${holder.fullName.middleName || ""} ${holder.fullName.lastName || ""}`.trim(),
                    relation: holder.relationToPAP || "",
                    pramanpatradharak: holder.isCertificateHolder || false
                }))
            };

            const prakalp_grast_nav = transformedData.prakalp_grast_nav.replace(/\s+/g, "_");
            const blob = await Packer.toBlob(DuyamNavHastantaran(transformedData, currentHolderName));
            const certificate_name = prakalp_grast_nav + `_दुय्यम_प्रतीत_नाव_हस्तांतरण.docx`;

            if (blob) {
                saveAs(blob, certificate_name);
                handleSuccess('दुय्यम प्रतीत नाव हस्तांतरण प्रमाणपत्र डाउनलोड झाले!');
            } else {
                console.error("Blob is undefined, cannot save the file.");
                handleError("प्रमाणपत्र तयार करताना त्रुटी आली आहे");
            }
        } catch (error) {
            console.error("Error generating certificate:", error);
            handleError("प्रमाणपत्र तयार करताना त्रुटी आली आहे");
        }
    };

    // Confirm certificate transfer
    const confirmCertificateTransfer = async () => {
        if (selectedHolderIndex === null) return;

        try {
            // Update the certificate holder in the form data
            const updatedFormData = {
                ...formData,
                certificateHolders: formData.certificateHolders.map((holder, i) => ({
                    ...holder,
                    isCertificateHolder: i === selectedHolderIndex
                }))
            };

            setFormData(updatedFormData);

            // Generate appropriate certificate based on form type
            if (duplicateNavHastantaran === 3) {
                await generateDuyamNavHastantaranCertificate(updatedFormData, currentHolderName);
            } else {
                await generateNavHastantaranCertificate(updatedFormData, currentHolderName);
            }

            // Close the dialog
            setTransferConfirmOpen(false);
            setSelectedHolderIndex(null);
            onClose();
        } catch (error) {
            console.error('Error confirming transfer:', error);
            handleError('प्रमाणपत्र हस्तांतरण करताना त्रुटी आली आहे');
        }
    };

    // Store original name for edit mode comparison
    const [originalProjectAffectedPersonName, setOriginalProjectAffectedPersonName] = useState<string>('');
    // Projects state
    const [projects, setProjects] = useState<Project[]>(projectsCache);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projectInputValue, setProjectInputValue] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(!projectsCacheLoaded);

    // File upload states
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});

    // Selected files for new applications (all-or-nothing approach)
    const [selectedFiles, setSelectedFiles] = useState<{ [key in DocumentType]?: File | null }>({});

    // Document validation errors state
    const [documentValidationErrors, setDocumentValidationErrors] = useState<{ [key in DocumentType]?: boolean }>({});

    // Alert states
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertTitle, setAlertTitle] = useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "info">("info");

    // File input refs
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // Modal scroll container ref
    const modalScrollRef = useRef<HTMLDivElement>(null);

    // Function to scroll to bottom of modal
    const scrollToBottom = () => {
        if (modalScrollRef.current) {
            modalScrollRef.current.scrollTo({
                top: modalScrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const resetForm = () => {
        setFormData(initialCertificateApplicationState);
        setActiveStep(0);
        setCompletedSteps(new Set());
        setSelectedProject(null);
        setProjectInputValue('');
        setUploadProgress({});
        setUploadErrors({});
        setSelectedFiles({}); // Clear selected files for new applications
        setAlertOpen(false);
        setAlertTitle("");
        setAlertMessage("");
        setAlertType("info");
    };

    // Reset selectedFiles when switching modes
    const resetSelectedFiles = () => {
        setSelectedFiles({});
        setUploadErrors({});
        setUploadProgress({});
    };

    // Load certificate data for editing
    const loadCertificateDataForEditing = async () => {
        if (!editMode || !applicationId) return;

        // Reset selectedFiles for edit mode
        resetSelectedFiles();

        setIsLoadingCertificateData(true);
        try {
            const result = await fetchCertificateApplicationDetails(applicationId);
            if (result.success && result.data) {
                // Transform document data structure to match FileMetadata format
                const transformedData = {
                    ...result.data,
                    documents: transformDocumentsToFileMetadata(result.data.documents)
                };

                setFormData(transformedData);
                // Store original name for comparison
                setOriginalProjectAffectedPersonName(transformedData.projectAffectedPerson.name?.trim());
                // Mark all steps as completed for editing
                setCompletedSteps(new Set([0, 1, 2, 3, 4, 5, 6]));
                if (whichForm === 2 || whichForm === 3) {
                    setActiveStep(3); // Go to प्रमाणपत्र धारक निवडा step for editing
                } else {
                    setActiveStep(6); // Go to review step for editing
                }
                setSelectedProject({
                    Prakalpa_id: transformedData.projectAffectedPerson.projectId || 0,
                    prakalpa_nav: transformedData.projectAffectedPerson.projectName || ""
                })
            } else {
                handleError(result.error || 'प्रमाणपत्र डेटा लोड करण्यात अयशस्वी');
            }
        } catch (error) {
            console.error('Error loading certificate data:', error);
            handleError('प्रमाणपत्र डेटा लोड करण्यात अयशस्वी');
        } finally {
            setIsLoadingCertificateData(false);
        }
    };

    const showAlert = (title: string, message: string, type: "success" | "error" | "warning" | "info" = "info") => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertType(type);
        setAlertOpen(true);
    };

    const handleAlertClose = () => {
        setAlertOpen(false);
    };

    useEffect(() => {
        if (open) {
            if (editMode && applicationId) {
                loadCertificateDataForEditing();
            } else {
                resetForm();
                cleanupEmptyHolders();
            }

            // Load projects if not already loaded
            if (!projectsCacheLoaded) {
                const loadProjects = async () => {
                    setIsLoadingProjects(true);
                    try {
                        const projectData = await fetchProjects();
                        projectsCache = projectData;
                        projectsCacheLoaded = true;
                        setProjects(projectData);
                    } catch (error) {
                        console.error('Error loading projects:', error);
                        handleError("प्रकल्प डेटा लोड करण्यात त्रुटी आली आहे।");
                    } finally {
                        setIsLoadingProjects(false);
                    }
                };
                loadProjects();
            } else {
                setProjects(projectsCache);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, editMode, applicationId]);

    // Generic input change handler
    const handleInputChange = (section: keyof ApplyCertificateFormState, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as Record<string, unknown>),
                [field]: value
            }
        }));
    };

    // Handle nested input change for certificate holders
    const handleCertificateHolderChange = (index: number, field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            certificateHolders: prev.certificateHolders.map((holder, i) =>
                i === index
                    ? field.includes('.')
                        ? {
                            ...holder,
                            fullName: {
                                ...holder.fullName,
                                [field.split('.')[1]]: value
                            }
                        }
                        : { ...holder, [field]: value }
                    : holder
            )
        }));
    };

    // Clean up empty certificate holders
    const cleanupEmptyHolders = () => {
        setFormData(prev => ({
            ...prev,
            certificateHolders: prev.certificateHolders.filter(holder =>
                holder.fullName.firstName?.trim() ||
                holder.fullName.middleName?.trim() ||
                holder.fullName.lastName?.trim() ||
                holder.relationToPAP?.trim() ||
                holder.relationToApplicant?.trim() ||
                holder.certificatePurpose?.trim()
            )
        }));
    };

    // Add certificate holder
    const addCertificateHolder = () => {
        const newHolder: CertificateHolder = {
            id: `holder-${Date.now()}`,
            fullName: { firstName: "", middleName: "", lastName: "" },
            relationToPAP: "",
            relationToApplicant: "",
            certificatePurpose: "",
            isCertificateHolder: false
        };

        setFormData(prev => ({
            ...prev,
            certificateHolders: [...prev.certificateHolders, newHolder]
        }));
    };


    // Remove certificate holder
    const removeCertificateHolder = (index: number) => {
        if (formData.certificateHolders.length === 1) {
            showAlert("सूचना", "किमान एक प्रमाणपत्र धारक आवश्यक आहे.", "warning");
            return;
        }

        setFormData(prev => ({
            ...prev,
            certificateHolders: prev.certificateHolders.filter((_, i) => i !== index)
        }));
    };

    // Handle project selection
    const handleProjectChange = (_event: React.SyntheticEvent, newValue: Project | null) => {
        setSelectedProject(newValue);
        if (newValue) {
            setFormData(prev => ({
                ...prev,
                projectAffectedPerson: {
                    ...prev.projectAffectedPerson,
                    projectId: newValue.Prakalpa_id,
                    projectName: newValue.prakalpa_nav
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                projectAffectedPerson: {
                    ...prev.projectAffectedPerson,
                    projectId: null,
                    projectName: ''
                }
            }));
        }
    };

    // Handle file selection for new applications (all-or-nothing approach)
    const handleFileSelect = (documentType: DocumentType, file: File | null) => {
        if (file) {
            // Validate file before storing
            const validation = validateFile(file, 5); // 5MB limit
            if (!validation.success) {
                setUploadErrors(prev => ({ ...prev, [documentType]: validation.error || 'फाइल अयोग्य आहे' }));
                return;
            }
        }

        // Clear any previous errors
        setUploadErrors(prev => ({ ...prev, [documentType]: '' }));

        // Store the selected file
        setSelectedFiles(prev => ({
            ...prev,
            [documentType]: file
        }));

        // Clear validation error for this document when file is selected
        if (file) {
            setDocumentValidationErrors(prev => ({
                ...prev,
                [documentType]: false
            }));
        }
    };

    // Handle file upload for edit mode (existing functionality)
    const handleFileUpload = async (documentType: DocumentType, file: File) => {
        setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
        setUploadErrors(prev => ({ ...prev, [documentType]: '' }));

        try {
            const validation = validateFile(file, 5); // Updated to 5MB
            if (!validation.success) {
                setUploadErrors(prev => ({ ...prev, [documentType]: validation.error || 'फाइल अयोग्य आहे' }));
                return;
            }
            setUploadProgress(prev => ({ ...prev, [documentType]: 50 }));
            const result = await uploadDocument(file, documentType, formData.applicationId || undefined);
            if (result.success && result.data) {
                setFormData(prev => ({
                    ...prev,
                    documents: {
                        ...prev.documents,
                        [documentType]: result.data!
                    }
                }));
                setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
                handleSuccess("फाइल यशस्वीरित्या अपलोड झाली");

                // Clear validation error for this document when file is uploaded
                setDocumentValidationErrors(prev => ({
                    ...prev,
                    [documentType]: false
                }));
            } else {
                setUploadErrors(prev => ({ ...prev, [documentType]: result.error || 'अपलोड अयशस्वी' }));
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadErrors(prev => ({ ...prev, [documentType]: 'अपलोड अयशस्वी' }));
        } finally {
            setTimeout(() => {
                setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
            }, 2000);
        }
    };

    // Handle file removal for new applications
    const handleFileRemove = (documentType: DocumentType) => {
        setSelectedFiles(prev => ({
            ...prev,
            [documentType]: null
        }));
        setUploadErrors(prev => ({ ...prev, [documentType]: '' }));
    };

    // Dummy handlers for when step components require handlers but we don't need them
    const dummyFileUpload = async (documentType: DocumentType, file: File) => {
        console.warn('dummyFileUpload called', documentType, file.name);
    };

    const dummyFileDelete = async (documentType: DocumentType) => {
        console.warn('dummyFileDelete called', documentType);
    };

    const dummyFileSelect = (documentType: DocumentType, file: File | null) => {
        console.warn('dummyFileSelect called', documentType, file?.name);
    };

    const dummyFileRemove = (documentType: DocumentType) => {
        console.warn('dummyFileRemove called', documentType);
    };

    // Handle file deletion for edit mode (existing functionality)
    const handleFileDelete = async (documentType: DocumentType) => {
        const fileMetadata = formData.documents[documentType];
        if (!fileMetadata) return;

        try {
            const result = await deleteDocument(fileMetadata.id, formData.applicationId || undefined);
            if (result.success) {
                setFormData(prev => ({
                    ...prev,
                    documents: {
                        ...prev.documents,
                        [documentType]: null
                    }
                }));
                handleSuccess("फाइल डिलीट झाली");
            } else {
                handleError(result.error || "फाइल डिलीट करण्यात अयशस्वी");
            }
        } catch (error) {
            console.error('Delete error:', error);
            handleError("फाइल डिलीट करण्यात अयशस्वी");
        }
    };

    // Step validation functions
    const validateApplicantStep = (): boolean => {
        const { applicant } = formData;
        return !!(applicant.firstName?.trim() && applicant.lastName?.trim() &&
            applicant.village?.trim() && applicant.taluka?.trim() &&
            applicant.district?.trim() && applicant.mobileNumber?.trim());
    };

    const validateProjectStep = async (): Promise<boolean> => {
        const { projectAffectedPerson } = formData;

        // Basic validation
        if (!projectAffectedPerson.name?.trim() || !projectAffectedPerson.projectId ||
            !projectAffectedPerson.projectPurpose?.trim()) {
            return false;
        }

        // In edit mode, check if the current name is the same as the original name
        if (editMode && originalProjectAffectedPersonName) {
            const currentName = projectAffectedPerson.name?.trim();

            // If current name matches original name, skip duplicate check
            if (originalProjectAffectedPersonName === currentName) {
                return true;
            }
        }

        // Check for duplicate name (both in create mode and edit mode when name has changed)
        try {
            const API_URL = import.meta.env.VITE_API_URL;
            const response = await fetch(`${API_URL}/certificate-applications/user/getGrastName?query=${encodeURIComponent(projectAffectedPerson.name?.trim())}`);
            if (!response.ok) throw new Error('Failed to fetch suggestions');

            const data = await response.json();

            if (!data || typeof data.success === 'undefined') {
                console.error('Invalid API response structure:', data);
                return true; // Allow proceeding if API fails
            }

            if (data.success && data.found) {
                showAlert("त्रुटी", `"${projectAffectedPerson.name}" हे नाव आधीपासून डेटाबेसमध्ये अस्तित्वात आहे. कृपया वेगळे नाव वापरा.`, "error");
                return false; // Prevent proceeding if duplicate found
            }

            return true; // Allow proceeding if no duplicate
        } catch (error) {
            console.error('Error checking for duplicate name:', error);
            return true; // Allow proceeding if API fails
        }
    };

    const validateFamilyMembersStep = (): boolean => {
        const validMembers = formData.certificateHolders.filter(holder =>
            holder.fullName.firstName?.trim() && holder.fullName.lastName?.trim() &&
            holder.relationToPAP?.trim() && holder.relationToApplicant?.trim() &&
            holder.certificatePurpose?.trim()
        );

        if (validMembers.length === 0) {
            showAlert("त्रुटी", "कृपया किमान एक कुटुंबातील सदस्य जोडा. पुढील पायरीत जाण्यासाठी किमान एक सदस्य आवश्यक आहे.", "error");
            return false;
        }

        return true;
    };

    const validateCertificateHolderSelectionStep = (): boolean => {
        return formData.certificateHolders.some(holder => holder.isCertificateHolder);
    };

    const validateAffectedLandStep = (): boolean => {
        const { affectedLand } = formData;
        return !!(affectedLand.village?.trim() && affectedLand.surveyGroupNumber?.trim());
    };

    const validateDocumentsStep = (): boolean => {
        const requiredDocs = DOCUMENT_CONFIG.filter(doc => doc.required);

        if (editMode) {
            // For edit mode, check the documents object
            // Check both doc.id and potential document_type keys for flexibility
            return requiredDocs.every(doc => {
                return formData.documents[doc.id] !== null && formData.documents[doc.id] !== undefined;
            });
        } else {
            // For new applications, check selectedFiles
            return requiredDocs.every(doc => selectedFiles[doc.id] !== null && selectedFiles[doc.id] !== undefined);
        }
    };

    // Get validation function for current step
    const getStepValidation = (stepIndex: number): (() => boolean | Promise<boolean>) => {
        switch (stepIndex) {
            case 0: return validateApplicantStep;
            case 1: return validateProjectStep;
            case 2: return validateFamilyMembersStep;
            case 3: return validateCertificateHolderSelectionStep;
            case 4: return validateAffectedLandStep;
            case 5: return validateDocumentsStep;
            default: return () => true;
        }
    };

    // Navigation functions
    const handleNext = async () => {
        // Clean up empty holders before validation
        if (activeStep === 2) { // Family members step
            cleanupEmptyHolders();
        }

        const currentValidation = getStepValidation(activeStep);
        const validationResult = currentValidation();

        // Handle both sync and async validation
        const isValid = validationResult instanceof Promise ? await validationResult : validationResult;

        if (!isValid) {
            // Handle document validation errors specifically
            if (activeStep === 5) {
                // Clear previous document validation errors
                setDocumentValidationErrors({});

                // Set validation errors for missing required documents
                const requiredDocs = DOCUMENT_CONFIG.filter(doc => doc.required);
                const newErrors: { [key in DocumentType]?: boolean } = {};

                requiredDocs.forEach(doc => {
                    const hasFile = editMode
                        ? formData.documents[doc.id] !== null && formData.documents[doc.id] !== undefined
                        : selectedFiles[doc.id] !== null && selectedFiles[doc.id] !== undefined;

                    if (!hasFile) {
                        newErrors[doc.id] = true;
                    }
                });

                setDocumentValidationErrors(newErrors);
                handleError("कृपया सर्व आवश्यक कागदपत्रे अपलोड करा. लाल रंगात दाखवलेले कागदपत्रे आवश्यक आहेत.");
            } else {
                handleError("आपल्या प्रमाणपत्रात काही त्रुटी आहेत, कृपया त्या दुरुस्त करा आणि पुन्हा प्रयत्न करा");
            }
            return;
        }

        const newCompletedSteps = new Set(completedSteps);
        newCompletedSteps.add(activeStep);
        setCompletedSteps(newCompletedSteps);

        // Clear document validation errors when moving to next step
        setDocumentValidationErrors({});

        if (activeStep === STEPS.length - 1) {
            handleSubmit();
        } else {
            setActiveStep(activeStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    const handleStepClick = (stepIndex: number) => {
        if (stepIndex <= activeStep || completedSteps.has(stepIndex)) {
            setActiveStep(stepIndex);
            // Clean up empty holders when accessing family members step
            if (stepIndex === 2) { // Family members step
                cleanupEmptyHolders();
            }
        }
    };

    // Check if application is in final state
    const isFinalState = applicationStatus === 'approved' || applicationStatus === 'rejected';

    // Get status message for final state
    const getFinalStateMessage = () => {
        if (applicationStatus === 'approved') {
            return 'हा अर्ज मंजूर झाला आहे. आता बदल करता येत नाहीत.';
        } else if (applicationStatus === 'rejected') {
            return 'हा अर्ज नाकारण्यात आला आहे. आता बदल करता येत नाहीत.';
        }
        return '';
    };

    // Handle submit
    const handleSubmit = async () => {
        if (isSubmitting) return;

        // Check if in final state and show message
        if (isFinalState) {
            handleError(getFinalStateMessage());
            return;
        }

        setIsSubmitting(true);
        try {
            let result;

            if (editMode && applicationId) {
                // Call edit route for existing applications
                result = await updateCertificateApplication(applicationId, formData);
                if (result.success) {
                    handleSuccess('प्रमाणपत्र यशस्वीरित्या अपडेट झाले');
                } else {
                    handleError(result.error || 'प्रमाणपत्र अपडेट करण्यात अयशस्वी');
                }
            } else {
                // Use new all-or-nothing approach for new applications
                result = await submitCertificateApplicationWithDocuments(formData, selectedFiles);
                if (result.success) {
                    handleSuccess(`अर्ज यशस्वीरित्या सबमिट झाला. अर्ज क्रमांक: ${result.applicationId}${result.documentsCount ? ` (${result.documentsCount} फाइल अपलोड झाल्या)` : ''}`);
                } else {
                    handleError(result.error || 'अर्ज सबमिट करण्यात अयशस्वी');
                }
            }

            if (result.success && onSubmit) {
                onSubmit();
                onClose();
            }
        } catch (error) {
            console.error('Submit error:', error);
            handleError(editMode ? 'प्रमाणपत्र अपडेट करण्यात अयशस्वी' : 'अर्ज सबमिट करण्यात अयशस्वी');
        } finally {
            setIsSubmitting(false);
        }
    };

    // // Handle save draft
    // const handleSaveDraft = async () => {
    //     if (isSaving) return;

    //     setIsSaving(true);
    //     try {
    //         const result = await saveCertificateApplicationDraft(formData);
    //         if (result.success) {
    //             handleSuccess('अर्ज मसुदा म्हणून जतन झाला');
    //             if (onSubmit) onSubmit();
    //             onClose();
    //         } else {
    //             handleError(result.error || "मसुदा जतन करण्यात अयशस्वी");
    //         }
    //     } catch (error) {
    //         console.error('Save draft error:', error);
    //         handleError("मसुदा जतन करण्यात अयशस्वी");
    //     } finally {
    //         setIsSaving(false);
    //     }
    // };
    return (
        <>
            {/* Certificate Transfer Confirmation Dialog */}
            <Dialog open={transferConfirmOpen} onClose={() => setTransferConfirmOpen(false)} sx={{ flex: 1, textAlign: "center" }}>
                <DialogTitle variant="h6" component="div" sx={{ fontWeight: "bold" }}>धारक बदल निश्चित करा</DialogTitle>
                <DialogContent>
                    <DialogContentText>ही कृती प्रमाणपत्र एका धारकाकडून दुसऱ्या धारकाकडे हस्तांतरित करेल.</DialogContentText>
                    <DialogContentText>मूळ धारक: {currentHolderName}</DialogContentText>
                    <DialogContentText>नवीन धारक: {newHolderName}</DialogContentText>
                    <DialogContentText>नवीन धारकासाठी {duplicateNavHastantaran === 3 ? 'दुय्यम प्रतीत नाव हस्तांतरण' : 'नाव हस्तांतरण'} प्रमाणपत्र तयार होईल.</DialogContentText>
                    <DialogContentText>कृपया खात्री करून ही कृती सुरू ठेवा.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTransferConfirmOpen(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={confirmCertificateTransfer} sx={{ fontWeight: "bold" }} color="primary" autoFocus>
                        {duplicateNavHastantaran === 3 ? 'दुय्यम प्रतीत नाव हस्तांतरण प्रमाणपत्र काढा' : 'नाव हस्तांतरण प्रमाणपत्र काढा'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Alert Dialog */}
            <ConfirmationDialog
                open={alertOpen}
                onClose={handleAlertClose}
                onConfirm={handleAlertClose}
                title={alertTitle}
                message={alertMessage}
                confirmText="ठीक आहे"
                showCancelButton={false}
                bgColor={alertType === "error" ? "#d32f2f" : alertType === "success" ? "#2e7d32" : alertType === "warning" ? "#ed6c02" : "#1976d2"}
                confirmButtonColor={alertType === "error" ? "#d32f2f" : alertType === "success" ? "#2e7d32" : alertType === "warning" ? "#ed6c02" : "#1976d2"}
            />

            <Modal
                open={open}
                onClose={onClose}
                aria-labelledby="apply-certificate-wizard-title"
                disableAutoFocus
                disableEnforceFocus
                disableRestoreFocus
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                }}
            >
                <Paper
                    ref={modalScrollRef}
                    elevation={8}
                    sx={{
                        p: 1,
                        width: { xs: "95%", sm: "90%", md: currentWhichForm === 2 ? "55%" : "85%" },
                        maxWidth: "1200px",
                        maxHeight: { xs: "95vh", sm: "90vh" },
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
                            p: 2.5,
                            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            borderTopLeftRadius: "12px",
                            borderTopRightRadius: "12px",
                        }}
                    >
                        <Typography
                            id="apply-certificate-wizard-title"
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 600,
                                flex: 1,
                                textAlign: "center",
                                color: "white",
                                letterSpacing: "0.5px",
                                textShadow: "0 1px 2px rgba(0,0,0,0.2)"
                            }}
                        >
                            {duplicateNavHastantaran === 3 ? "दुय्यम नाव हस्तांतरण करा" :
                                currentWhichForm === 1 ? (editMode ? "प्रमाणपत्र संपादित करा" : "प्रमाणपत्रासाठी अर्ज करा") :
                                    "नाव हस्तांतरण करा"}
                            {isLoadingCertificateData && editMode && ' (लोड करत आहे...)'}
                        </Typography>
                        <IconButton
                            onClick={onClose}
                            disabled={isLoadingCertificateData}
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

                    {/* Stepper */}
                    <Box sx={{ p: 3, pb: 2 }}>
                        <Stepper activeStep={activeStep} alternativeLabel>
                            {STEPS.map((step, index) => (
                                <Step key={step.id} completed={completedSteps.has(index)}>
                                    <Box
                                        onClick={() => handleStepClick(index)}
                                        sx={{
                                            cursor: (index <= activeStep || completedSteps.has(index)) ? 'pointer' : 'default',
                                        }}
                                    >
                                        <StepLabel
                                            sx={{
                                                '& .MuiStepLabel-label': {
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
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

                    {/* Content */}
                    <Box sx={{ p: 3, pt: 0 }}>
                        <Slide direction="left" in={true} mountOnEnter unmountOnExit>
                            <Box>
                                <Divider sx={{ m: 4 }} />

                                {/* Step content will be rendered here */}
                                <Typography variant="h6" sx={{ mb: 4, color: '#1a5276', fontWeight: 600, textAlign: 'center' }}>
                                    {STEPS[activeStep].label}
                                </Typography>

                                {/* Step content rendering */}
                                <Box>
                                    {activeStep === 0 && (
                                        <ApplicantStep
                                            formData={formData}
                                            onInputChange={handleInputChange}
                                            onCertificateHolderChange={handleCertificateHolderChange}
                                            onAddCertificateHolder={addCertificateHolder}
                                            onRemoveCertificateHolder={removeCertificateHolder}
                                            onCertificateHolderSelection={handleCertificateHolderSelection}
                                            onProjectChange={handleProjectChange}
                                            onFileUpload={editMode ? handleFileUpload : dummyFileUpload}
                                            onFileSelect={!editMode ? handleFileSelect : dummyFileSelect}
                                            onFileDelete={editMode ? handleFileDelete : dummyFileDelete}
                                            onFileRemove={!editMode ? handleFileRemove : dummyFileRemove}
                                            projects={projects}
                                            selectedProject={selectedProject}
                                            projectInputValue={projectInputValue}
                                            onProjectInputChange={(_event, newInputValue) => setProjectInputValue(newInputValue)}
                                            isLoadingProjects={isLoadingProjects}
                                            uploadProgress={uploadProgress}
                                            uploadErrors={uploadErrors}
                                            fileInputRefs={fileInputRefs}
                                            selectedFiles={selectedFiles}
                                            editMode={editMode}
                                        />
                                    )}
                                    {activeStep === 1 && (
                                        <ProjectStep
                                            formData={formData}
                                            onInputChange={handleInputChange}
                                            onCertificateHolderChange={handleCertificateHolderChange}
                                            onAddCertificateHolder={addCertificateHolder}
                                            onRemoveCertificateHolder={removeCertificateHolder}
                                            onCertificateHolderSelection={handleCertificateHolderSelection}
                                            onProjectChange={handleProjectChange}
                                            onFileUpload={editMode ? handleFileUpload : dummyFileUpload}
                                            onFileSelect={!editMode ? handleFileSelect : dummyFileSelect}
                                            onFileDelete={editMode ? handleFileDelete : dummyFileDelete}
                                            onFileRemove={!editMode ? handleFileRemove : dummyFileRemove}
                                            projects={projects}
                                            selectedProject={selectedProject}
                                            projectInputValue={projectInputValue}
                                            onProjectInputChange={(_event, newInputValue) => setProjectInputValue(newInputValue)}
                                            isLoadingProjects={isLoadingProjects}
                                            uploadProgress={uploadProgress}
                                            uploadErrors={uploadErrors}
                                            fileInputRefs={fileInputRefs}
                                            selectedFiles={selectedFiles}
                                            editMode={editMode}
                                            originalProjectAffectedPersonName={originalProjectAffectedPersonName}
                                        />
                                    )}
                                    {activeStep === 2 && (
                                        <FamilyMembersStep
                                            formData={formData}
                                            onInputChange={handleInputChange}
                                            onCertificateHolderChange={handleCertificateHolderChange}
                                            onAddCertificateHolder={addCertificateHolder}
                                            onRemoveCertificateHolder={removeCertificateHolder}
                                            onCertificateHolderSelection={handleCertificateHolderSelection}
                                            onProjectChange={handleProjectChange}
                                            onFileUpload={editMode ? handleFileUpload : dummyFileUpload}
                                            onFileSelect={!editMode ? handleFileSelect : dummyFileSelect}
                                            onFileDelete={editMode ? handleFileDelete : dummyFileDelete}
                                            onFileRemove={!editMode ? handleFileRemove : dummyFileRemove}
                                            projects={projects}
                                            selectedProject={selectedProject}
                                            projectInputValue={projectInputValue}
                                            onProjectInputChange={(_event, newInputValue) => setProjectInputValue(newInputValue)}
                                            isLoadingProjects={isLoadingProjects}
                                            uploadProgress={uploadProgress}
                                            uploadErrors={uploadErrors}
                                            fileInputRefs={fileInputRefs}
                                            selectedFiles={selectedFiles}
                                            onScrollToBottom={scrollToBottom}
                                            editMode={editMode}
                                        />
                                    )}
                                    {activeStep === 3 && (
                                        <>
                                            <CertificateHolderSelectionStep
                                                formData={formData}
                                                onInputChange={handleInputChange}
                                                onCertificateHolderChange={handleCertificateHolderChange}
                                                onAddCertificateHolder={addCertificateHolder}
                                                onRemoveCertificateHolder={removeCertificateHolder}
                                                onCertificateHolderSelection={handleCertificateHolderSelection}
                                                onProjectChange={handleProjectChange}
                                                onFileUpload={editMode ? handleFileUpload : dummyFileUpload}
                                                onFileSelect={!editMode ? handleFileSelect : dummyFileSelect}
                                                onFileDelete={editMode ? handleFileDelete : dummyFileDelete}
                                                onFileRemove={!editMode ? handleFileRemove : dummyFileRemove}
                                                projects={projects}
                                                selectedProject={selectedProject}
                                                projectInputValue={projectInputValue}
                                                onProjectInputChange={(_event, newInputValue) => setProjectInputValue(newInputValue)}
                                                isLoadingProjects={isLoadingProjects}
                                                uploadProgress={uploadProgress}
                                                uploadErrors={uploadErrors}
                                                fileInputRefs={fileInputRefs}
                                                selectedFiles={selectedFiles}
                                                editMode={editMode}
                                                whichForm={currentWhichForm}
                                                duplicateNavHastantaran={duplicateNavHastantaran}
                                            />

                                            {/* Hastantaran Reason Field for Form 3 */}
                                            {duplicateNavHastantaran === 3 && (
                                                <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                                                    <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                                                        दुय्यम नाव हस्तांतरण प्रमाणपत्राचे कारण
                                                    </Typography>
                                                    <TextField
                                                        fullWidth
                                                        required
                                                        multiline
                                                        rows={3}
                                                        label="नाव हस्तांतरण प्रमाणपत्राचे कारण"
                                                        value={hastantaranReason}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHastantaranReason(e.target.value)}
                                                        variant="outlined"
                                                        placeholder="कृपया नाव हस्तांतरण प्रमाणपत्राचे कारण तपशीलवार लिहा..."
                                                        sx={{ mb: 2 }}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        * हे क्षेत्र अनिवार्य आहे. कृपया नाव हस्तांतरण प्रमाणपत्राचे कारण स्पष्ट करा.
                                                    </Typography>
                                                </Box>
                                            )}
                                        </>
                                    )}
                                    {activeStep === 4 && (
                                        <AffectedLandStep
                                            formData={formData}
                                            onInputChange={handleInputChange}
                                            onCertificateHolderChange={handleCertificateHolderChange}
                                            onAddCertificateHolder={addCertificateHolder}
                                            onRemoveCertificateHolder={removeCertificateHolder}
                                            onCertificateHolderSelection={handleCertificateHolderSelection}
                                            onProjectChange={handleProjectChange}
                                            onFileUpload={editMode ? handleFileUpload : dummyFileUpload}
                                            onFileSelect={!editMode ? handleFileSelect : dummyFileSelect}
                                            onFileDelete={editMode ? handleFileDelete : dummyFileDelete}
                                            onFileRemove={!editMode ? handleFileRemove : dummyFileRemove}
                                            projects={projects}
                                            selectedProject={selectedProject}
                                            projectInputValue={projectInputValue}
                                            onProjectInputChange={(_event, newInputValue) => setProjectInputValue(newInputValue)}
                                            isLoadingProjects={isLoadingProjects}
                                            uploadProgress={uploadProgress}
                                            uploadErrors={uploadErrors}
                                            fileInputRefs={fileInputRefs}
                                            selectedFiles={selectedFiles}
                                            editMode={editMode}
                                        />
                                    )}
                                    {activeStep === 5 && (
                                        <DocumentsStep
                                            formData={formData}
                                            onInputChange={handleInputChange}
                                            onCertificateHolderChange={handleCertificateHolderChange}
                                            onAddCertificateHolder={addCertificateHolder}
                                            onRemoveCertificateHolder={removeCertificateHolder}
                                            onCertificateHolderSelection={handleCertificateHolderSelection}
                                            onProjectChange={handleProjectChange}
                                            onFileUpload={editMode ? handleFileUpload : dummyFileUpload}
                                            onFileSelect={!editMode ? handleFileSelect : dummyFileSelect}
                                            onFileDelete={editMode ? handleFileDelete : dummyFileDelete}
                                            onFileRemove={!editMode ? handleFileRemove : dummyFileRemove}
                                            projects={projects}
                                            selectedProject={selectedProject}
                                            projectInputValue={projectInputValue}
                                            onProjectInputChange={(_event, newInputValue) => setProjectInputValue(newInputValue)}
                                            isLoadingProjects={isLoadingProjects}
                                            uploadProgress={uploadProgress}
                                            uploadErrors={uploadErrors}
                                            fileInputRefs={fileInputRefs}
                                            selectedFiles={selectedFiles}
                                            editMode={editMode}
                                            documentValidationErrors={documentValidationErrors}
                                        />
                                    )}
                                    {activeStep === 6 && (
                                        <ReviewStep
                                            formData={formData}
                                            onInputChange={handleInputChange}
                                            onCertificateHolderChange={handleCertificateHolderChange}
                                            onAddCertificateHolder={addCertificateHolder}
                                            onRemoveCertificateHolder={removeCertificateHolder}
                                            onCertificateHolderSelection={handleCertificateHolderSelection}
                                            onProjectChange={handleProjectChange}
                                            onFileUpload={editMode ? handleFileUpload : dummyFileUpload}
                                            onFileSelect={!editMode ? handleFileSelect : dummyFileSelect}
                                            onFileDelete={editMode ? handleFileDelete : dummyFileDelete}
                                            onFileRemove={!editMode ? handleFileRemove : dummyFileRemove}
                                            projects={projects}
                                            selectedProject={selectedProject}
                                            projectInputValue={projectInputValue}
                                            onProjectInputChange={(_event, newInputValue) => setProjectInputValue(newInputValue)}
                                            isLoadingProjects={isLoadingProjects}
                                            uploadProgress={uploadProgress}
                                            uploadErrors={uploadErrors}
                                            fileInputRefs={fileInputRefs}
                                            selectedFiles={selectedFiles}
                                            editMode={editMode}
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Slide>

                        {/* Navigation */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                disabled={activeStep === 0}
                                startIcon={<NavigateBefore />}
                                sx={{ px: 3 }}
                            >
                                मागे
                            </Button>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                {activeStep === STEPS.length - 1 ? (
                                    <>
                                        {/* <Button
                                            variant="outlined"
                                            onClick={handleSaveDraft}
                                            disabled={isSaving}
                                            sx={{ px: 3 }}
                                        >
                                            {isSaving ? 'जतन करत आहे...' : 'मसुदा जतन करा'}
                                        </Button> */}
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            sx={{
                                                px: 3,
                                                bgcolor: isFinalState ? "#f44336" : "#1a5276",
                                                "&:hover": {
                                                    bgcolor: isFinalState ? "#d32f2f" : "#0d3d56"
                                                }
                                            }}
                                        >
                                            {isSubmitting ? (editMode ? 'अपडेट करत आहे...' : 'सबमिट करत आहे...') :
                                                isFinalState ? (editMode ? 'अपडेट करता येत नाही (मंजूर/नाकारले)' : 'सबमिट करता येत नाही') :
                                                    (editMode ? 'प्रमाणपत्र अपडेट करा' : 'अर्ज सबमिट करा')}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        variant="contained"
                                        onClick={() => handleNext()}
                                        endIcon={<NavigateNext />}
                                        sx={{
                                            px: 3,
                                            bgcolor: "#1a5276",
                                            "&:hover": { bgcolor: "#0d3d56" }
                                        }}
                                    >
                                        पुढे
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Modal>
        </>
    );
};

export default ApplyCertificateDialog;