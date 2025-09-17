import React from 'react';
import {
    Box,
    TextField,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    IconButton,
    LinearProgress,
} from '@mui/material';
import { CloudUpload, Delete, CheckCircle } from '@mui/icons-material';
import { SelectChangeEvent } from '@mui/material/Select';

import {
    ApplyCertificateFormState,
    Project,
    DocumentType,
    DOCUMENT_CONFIG
} from '../../types';
import { getFieldStyles } from '../../utils/validationStyles';
import ConfirmationDialog from '../ConfirmationDialog';

interface StepProps {
    formData: ApplyCertificateFormState;
    onInputChange: (section: keyof ApplyCertificateFormState, field: string, value: string) => void;
    onCertificateHolderChange: (index: number, field: string, value: string | boolean) => void;
    onAddCertificateHolder: () => void;
    onRemoveCertificateHolder: (index: number) => void;
    onCertificateHolderSelection: (index: number) => void;
    onProjectChange: (event: React.SyntheticEvent, newValue: Project | null) => void;
    onFileUpload: (documentType: DocumentType, file: File) => Promise<void>;
    onFileDelete: (documentType: DocumentType) => Promise<void>;
    onFileSelect?: (documentType: DocumentType, file: File | null) => void;
    onFileRemove?: (documentType: DocumentType) => void;
    projects: Project[];
    selectedProject: Project | null;
    projectInputValue: string;
    onProjectInputChange: (event: React.SyntheticEvent, newInputValue: string) => void;
    isLoadingProjects: boolean;
    uploadProgress: { [key: string]: number };
    uploadErrors: { [key: string]: string };
    fileInputRefs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
    selectedFiles?: { [key in DocumentType]?: File | null };
    onValidateStep?: () => Promise<boolean>;
    editMode?: boolean;
    originalProjectAffectedPersonName?: string;
    documentValidationErrors?: { [key in DocumentType]?: boolean };
    whichForm?: number | null;
    duplicateNavHastantaran?: number | null;
    onScrollToBottom?: () => void;
}

// Type export to ensure proper recognition
export type { StepProps };

// Step 1: Applicant Information
export const ApplicantStep: React.FC<StepProps> = ({ formData, onInputChange }) => {
    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        required
                        fullWidth
                        label="नाव (पहिले)"
                        value={formData.applicant.firstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('applicant', 'firstName', e.target.value)}
                        variant="outlined"
                        error={!formData.applicant.firstName?.trim()}
                        helperText={!formData.applicant.firstName?.trim() ? "पहिले नाव आवश्यक आहे" : ""}
                        sx={getFieldStyles(formData.applicant.firstName, true, !formData.applicant.firstName?.trim())}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        fullWidth
                        label="नाव (मधले)"
                        value={formData.applicant.middleName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('applicant', 'middleName', e.target.value)}
                        variant="outlined"
                        sx={getFieldStyles(formData.applicant.middleName, false)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        required
                        fullWidth
                        label="नाव (आडनाव)"
                        value={formData.applicant.lastName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('applicant', 'lastName', e.target.value)}
                        variant="outlined"
                        error={!formData.applicant.lastName?.trim()}
                        helperText={!formData.applicant.lastName?.trim() ? "आडनाव आवश्यक आहे" : ""}
                        sx={getFieldStyles(formData.applicant.lastName, true, !formData.applicant.lastName?.trim())}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        required
                        fullWidth
                        label="गाव"
                        value={formData.applicant.village}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('applicant', 'village', e.target.value)}
                        variant="outlined"
                        error={!formData.applicant.village?.trim()}
                        helperText={!formData.applicant.village?.trim() ? "गाव आवश्यक आहे" : ""}
                        sx={getFieldStyles(formData.applicant.village, true, !formData.applicant.village?.trim())}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        required
                        fullWidth
                        label="तालुका"
                        value={formData.applicant.taluka}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('applicant', 'taluka', e.target.value)}
                        variant="outlined"
                        error={!formData.applicant.taluka?.trim()}
                        helperText={!formData.applicant.taluka?.trim() ? "तालुका आवश्यक आहे" : ""}
                        sx={getFieldStyles(formData.applicant.taluka, true, !formData.applicant.taluka?.trim())}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        required
                        fullWidth
                        label="जिल्हा"
                        value={formData.applicant.district}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('applicant', 'district', e.target.value)}
                        variant="outlined"
                        error={!formData.applicant.district?.trim()}
                        helperText={!formData.applicant.district?.trim() ? "जिल्हा आवश्यक आहे" : ""}
                        sx={getFieldStyles(formData.applicant.district, true, !formData.applicant.district?.trim())}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        required
                        fullWidth
                        label="मोबाईल क्र."
                        value={formData.applicant.mobileNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('applicant', 'mobileNumber', e.target.value)}
                        variant="outlined"
                        error={!formData.applicant.mobileNumber?.trim()}
                        helperText={!formData.applicant.mobileNumber?.trim() ? "मोबाईल क्रमांक आवश्यक आहे" : ""}
                        sx={getFieldStyles(formData.applicant.mobileNumber, true, !formData.applicant.mobileNumber?.trim())}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

// Step 2: Project Information
export const ProjectStep: React.FC<StepProps> = ({
    formData,
    onInputChange,
    onProjectChange,
    projects,
    selectedProject,
    projectInputValue,
    onProjectInputChange,
    isLoadingProjects,
    editMode = false,
    originalProjectAffectedPersonName = ''
}) => {
    // State for duplicate name verification
    const [duplicateConfirmOpen, setDuplicateConfirmOpen] = React.useState(false);
    const [duplicateMatch, setDuplicateMatch] = React.useState<{ id: number, name: string } | null>(null);
    const [isCheckingDuplicate, setIsCheckingDuplicate] = React.useState(false);
    const debounceTimeoutRef = React.useRef<number | null>(null);


    const API_URL = import.meta.env.VITE_API_URL;

    // Check for exact match with existing names
    const checkExactMatch = async (name: string) => {
        if (!name?.trim()) return false;

        // In edit mode, check if the current name is the same as the original name
        if (editMode && originalProjectAffectedPersonName) {
            const currentName = name?.trim();

            // If current name matches original name, skip duplicate check
            if (originalProjectAffectedPersonName === currentName) {
                return false; // No duplicate found
            }
        }

        try {
            setIsCheckingDuplicate(true);
            const response = await fetch(`${API_URL}/certificate-applications/user/getGrastName?query=${encodeURIComponent(name)}`);
            if (!response.ok) throw new Error('Failed to fetch suggestions');

            const data = await response.json();

            if (!data || typeof data.success === 'undefined') {
                console.error('Invalid API response structure:', data);
                return false;
            }

            if (data.success && data.found) {
                setDuplicateMatch({ id: 0, name: name }); // Using entered name since we just need to show duplicate warning
                setDuplicateConfirmOpen(true);
                return true;
            }
        } catch (error) {
            console.error('Error checking for exact match:', error);
        } finally {
            setIsCheckingDuplicate(false);
        }
        return false;
    };

    // Handle project affected person name change
    const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        onInputChange('projectAffectedPerson', 'name', newName);

        // Clear previous timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Set new timeout for API call
        debounceTimeoutRef.current = setTimeout(async () => {
            await checkExactMatch(newName);
        }, 500) as unknown as number;
    };

    // Handle blur event for immediate duplicate check
    const handleProjectNameBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const name = e.target.value.trim();
        if (name) {
            await checkExactMatch(name);
        }
    };

    // Handle paste event for duplicate check
    const handleProjectNamePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        // Get pasted text
        const pastedText = e.clipboardData.getData('text');
        if (pastedText?.trim()) {
            // Wait a bit for the paste to complete, then check
            setTimeout(async () => {
                const currentValue = e.currentTarget.value;
                if (currentValue?.trim()) {
                    await checkExactMatch(currentValue);
                }
            }, 100);
        }
    };

    // Handle duplicate confirmation
    const handleDuplicateConfirm = () => {
        // Clear the input field
        onInputChange('projectAffectedPerson', 'name', '');
        setDuplicateConfirmOpen(false);
        setDuplicateMatch(null);
    };

    const handleDuplicateCancel = () => {
        setDuplicateConfirmOpen(false);
        setDuplicateMatch(null);
    };

    // Create a ref to store the validation function
    const validateStepRef = React.useRef<(() => Promise<boolean>) | null>(null);

    // Expose validation function to parent component
    React.useEffect(() => {
        validateStepRef.current = async () => {
            const name = formData.projectAffectedPerson.name?.trim();
            if (name) {
                const hasDuplicate = await checkExactMatch(name);
                if (hasDuplicate) {
                    return false; // Prevent proceeding if duplicate found
                }
            }
            return true; // Allow proceeding if no duplicate
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.projectAffectedPerson.name]);

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return (
        <>
            <Box>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Autocomplete
                            value={selectedProject}
                            onChange={onProjectChange}
                            inputValue={projectInputValue}
                            onInputChange={onProjectInputChange}
                            options={projects}
                            getOptionLabel={(option) => option.prakalpa_nav}
                            isOptionEqualToValue={(option, value) => option.Prakalpa_id === value.Prakalpa_id}
                            loading={isLoadingProjects}
                            renderInput={(params) => (
                                // @ts-expect-error - Autocomplete types are not compatible with TextField
                                <TextField
                                    required
                                    label="प्रकल्प निवडा"
                                    variant="outlined"
                                    error={!selectedProject}
                                    helperText={!selectedProject ? "प्रकल्प निवडा आवश्यक आहे" : ""}
                                    sx={getFieldStyles(selectedProject?.prakalpa_nav || '', true, !selectedProject)}
                                    inputRef={params.InputProps.ref}
                                    {...params}
                                />
                            )}
                            sx={{ width: "100%" }}
                            noOptionsText="कोणतेही प्रकल्प सापडले नाहीत"
                            loadingText="प्रकल्प लोड करत आहे..."
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            required
                            fullWidth
                            label="प्रकल्पग्रस्ताचे नाव"
                            value={formData.projectAffectedPerson.name}
                            onChange={handleProjectNameChange}
                            onBlur={handleProjectNameBlur}
                            variant="outlined"
                            error={!formData.projectAffectedPerson.name?.trim()}
                            helperText={
                                !formData.projectAffectedPerson.name?.trim()
                                    ? "प्रकल्पग्रस्ताचे नाव आवश्यक आहे"
                                    : isCheckingDuplicate
                                        ? "नाव तपासत आहे..."
                                        : ""
                            }
                            sx={getFieldStyles(formData.projectAffectedPerson.name, true, !formData.projectAffectedPerson.name?.trim())}
                            inputProps={{
                                onPaste: handleProjectNamePaste
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth required error={!formData.projectAffectedPerson.projectPurpose?.trim()}>
                            <InputLabel>प्रकल्प कामाचे प्रयोजन</InputLabel>
                            <Select
                                value={formData.projectAffectedPerson.projectPurpose}
                                label="प्रकल्प कामाचे प्रयोजन"
                                onChange={(e: SelectChangeEvent) => onInputChange('projectAffectedPerson', 'projectPurpose', e.target.value)}
                                sx={getFieldStyles(formData.projectAffectedPerson.projectPurpose, true, !formData.projectAffectedPerson.projectPurpose?.trim())}
                            >
                                <MenuItem value="कालवा">कालवा</MenuItem>
                                <MenuItem value="बुडीत भाग">बुडीत भाग</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="आधार कार्ड क्रमांक"
                            value={formData.projectAffectedPerson.aadhaarId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('projectAffectedPerson', 'aadhaarId', e.target.value)}
                            variant="outlined"
                            sx={getFieldStyles(formData.projectAffectedPerson.aadhaarId, false, false)}
                            inputProps={{
                                inputMode: 'numeric',
                                pattern: '[0-9]*'
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="शेतकरी आयडी"
                            value={formData.projectAffectedPerson.farmerId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('projectAffectedPerson', 'farmerId', e.target.value)}
                            variant="outlined"
                            sx={getFieldStyles(formData.projectAffectedPerson.farmerId, false, false)}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Duplicate Name Confirmation Dialog */}
            <ConfirmationDialog
                open={duplicateConfirmOpen}
                onClose={handleDuplicateCancel}
                onConfirm={handleDuplicateConfirm}
                title="नाव आधीपासून अस्तित्वात आहे"
                message={`"${duplicateMatch?.name}" हे नाव आधीपासून डेटाबेसमध्ये अस्तित्वात आहे. कृपया वेगळे नाव वापरा.`}
                confirmText="ठीक आहे"
                cancelText="रद्द करा"
                bgColor="#f44336"
                confirmButtonColor="#f44336"
            />
        </>
    );
};

// Step 3: Family Members Information (Add Family Members)
export const FamilyMembersStep: React.FC<StepProps> = ({
    formData,
    onCertificateHolderChange,
    onAddCertificateHolder,
    onRemoveCertificateHolder,
    onScrollToBottom
}) => {
    // Local state for the current entry form
    const [currentEntry, setCurrentEntry] = React.useState({
        firstName: '',
        middleName: '',
        lastName: '',
        relationToPAP: '',
        relationToApplicant: '',
        certificatePurpose: '' as 'शिक्षण' | 'नौकरी' | ''
    });

    // Handle input changes for the current entry form
    const handleCurrentEntryChange = (field: string, value: string) => {
        setCurrentEntry(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle adding a new family member
    const handleAddFamilyMember = () => {
        // Validate required fields
        if (!currentEntry.firstName?.trim() || !currentEntry.lastName?.trim() ||
            !currentEntry.relationToPAP?.trim() || !currentEntry.relationToApplicant?.trim() ||
            !currentEntry.certificatePurpose?.trim()) {
            return; // Don't add if required fields are empty
        }

        // Check if this is the first entry (before adding)
        const isFirstEntry = formData.certificateHolders.length === 0;

        // Add the current entry to the form data
        onAddCertificateHolder();

        // Update the newly added certificate holder with current entry data
        const newIndex = formData.certificateHolders.length;
        onCertificateHolderChange(newIndex, 'fullName.firstName', currentEntry.firstName);
        onCertificateHolderChange(newIndex, 'fullName.middleName', currentEntry.middleName);
        onCertificateHolderChange(newIndex, 'fullName.lastName', currentEntry.lastName);
        onCertificateHolderChange(newIndex, 'relationToPAP', currentEntry.relationToPAP);
        onCertificateHolderChange(newIndex, 'relationToApplicant', currentEntry.relationToApplicant);
        onCertificateHolderChange(newIndex, 'certificatePurpose', currentEntry.certificatePurpose);

        // Scroll to bottom only for the first entry
        if (isFirstEntry && onScrollToBottom) {
            // Use setTimeout to ensure the DOM has updated before scrolling
            setTimeout(() => {
                onScrollToBottom();
            }, 100);
        }

        // Reset the current entry form
        setCurrentEntry({
            firstName: '',
            middleName: '',
            lastName: '',
            relationToPAP: '',
            relationToApplicant: '',
            certificatePurpose: ''
        });
    };

    // Check if the current entry form is valid
    const isCurrentEntryValid = currentEntry.firstName?.trim() &&
        currentEntry.lastName?.trim() &&
        currentEntry.relationToPAP?.trim() &&
        currentEntry.relationToApplicant?.trim() &&
        currentEntry.certificatePurpose?.trim();

    return (
        <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
                प्रकल्पग्रस्ताच्या कुटुंबातील सदस्यांची माहिती भरा. पुढील पायरीत त्यांमधून प्रमाणपत्र धारक निवडू शकाल.
            </Typography>

            {/* Single Entry Form */}
            <Card sx={{
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                borderRadius: "10px",
                mb: 4
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                required
                                fullWidth
                                label="नाव (पहिले)"
                                value={currentEntry.firstName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleCurrentEntryChange('firstName', e.target.value)}
                                variant="outlined"
                                error={!currentEntry.firstName?.trim()}
                                helperText={!currentEntry.firstName?.trim() ? "पहिले नाव आवश्यक आहे" : ""}
                                sx={getFieldStyles(currentEntry.firstName, true, !currentEntry.firstName?.trim())}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="नाव (मधले)"
                                value={currentEntry.middleName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleCurrentEntryChange('middleName', e.target.value)}
                                variant="outlined"
                                sx={getFieldStyles(currentEntry.middleName, false)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                required
                                fullWidth
                                label="नाव (आडनाव)"
                                value={currentEntry.lastName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleCurrentEntryChange('lastName', e.target.value)}
                                variant="outlined"
                                error={!currentEntry.lastName?.trim()}
                                helperText={!currentEntry.lastName?.trim() ? "आडनाव आवश्यक आहे" : ""}
                                sx={getFieldStyles(currentEntry.lastName, true, !currentEntry.lastName?.trim())}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                required
                                fullWidth
                                label="प्रकल्पग्रस्ताशी नाते"
                                value={currentEntry.relationToPAP}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleCurrentEntryChange('relationToPAP', e.target.value)}
                                variant="outlined"
                                error={!currentEntry.relationToPAP?.trim()}
                                helperText={!currentEntry.relationToPAP?.trim() ? "प्रकल्पग्रस्ताशी नाते आवश्यक आहे" : ""}
                                sx={getFieldStyles(currentEntry.relationToPAP, true, !currentEntry.relationToPAP?.trim())}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                required
                                fullWidth
                                label="अर्जदाराशी नाते"
                                value={currentEntry.relationToApplicant}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                    handleCurrentEntryChange('relationToApplicant', e.target.value)}
                                variant="outlined"
                                error={!currentEntry.relationToApplicant?.trim()}
                                helperText={!currentEntry.relationToApplicant?.trim() ? "अर्जदाराशी नाते आवश्यक आहे" : ""}
                                sx={getFieldStyles(currentEntry.relationToApplicant, true, !currentEntry.relationToApplicant?.trim())}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl fullWidth required error={!currentEntry.certificatePurpose?.trim()}>
                                <InputLabel>प्रमाणपत्राचे प्रयोजन</InputLabel>
                                <Select
                                    value={currentEntry.certificatePurpose}
                                    label="प्रमाणपत्राचे प्रयोजन"
                                    onChange={(e: SelectChangeEvent) =>
                                        handleCurrentEntryChange('certificatePurpose', e.target.value)}
                                    sx={getFieldStyles(currentEntry.certificatePurpose, true, !currentEntry.certificatePurpose?.trim())}
                                >
                                    <MenuItem value="शिक्षण">शिक्षण</MenuItem>
                                    <MenuItem value="नौकरी">नौकरी</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Add Family Member Button */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mt: 3,
                        pt: 2,
                        borderTop: '1px solid #e0e0e0'
                    }}>
                        <Button
                            onClick={handleAddFamilyMember}
                            variant="contained"
                            size="large"
                            disabled={!isCurrentEntryValid}
                            sx={{
                                bgcolor: formData.certificateHolders.length === 0 ? "#d32f2f" : "#1a5276",
                                "&:hover": {
                                    bgcolor: formData.certificateHolders.length === 0 ? "#b71c1c" : "#0d3d56"
                                },
                                "&:disabled": { bgcolor: "#ccc" },
                                px: 4,
                                py: 1.5,
                                fontWeight: formData.certificateHolders.length === 0 ? 600 : 400,
                                boxShadow: formData.certificateHolders.length === 0 ? "0 4px 8px rgba(211, 47, 47, 0.3)" : "none"
                            }}
                        >
                            {formData.certificateHolders.length === 0 ? "⚠️ कुटुंबातील सदस्य जोडा (आवश्यक)" : "+ कुटुंबातील सदस्य जोडा"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Family Members Grid/Table */}
            <Card sx={{
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                borderRadius: "10px"
            }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{
                        fontWeight: 600,
                        color: "#1a5276",
                        mb: 3,
                        textAlign: 'center'
                    }}>
                        जोडलेले कुटुंबातील सदस्य ({formData.certificateHolders.length})
                    </Typography>

                    {formData.certificateHolders.length === 0 ? (
                        <Box sx={{
                            textAlign: 'center',
                            py: 4,
                            px: 2,
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            borderRadius: '8px',
                            color: '#856404'
                        }}>
                            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                ⚠️ कुटुंबातील सदस्य जोडा
                            </Typography>
                            <Typography variant="body1">
                                पुढील पायरीत जाण्यासाठी किमान एक कुटुंबातील सदस्य जोडणे आवश्यक आहे. कृपया वरील फॉर्म भरून "कुटुंबातील सदस्य जोडा" बटण क्लिक करा.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                            {/* Desktop/Tablet View */}
                            <Box sx={{
                                display: { xs: 'none', lg: 'grid' },
                                gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 120px',
                                gap: 2,
                                mb: 2,
                                p: 2,
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                fontWeight: 600,
                                color: '#1a5276',
                                borderBottom: '2px solid #e3f2fd'
                            }}>
                                <Box>नाव</Box>
                                <Box>प्रकल्पग्रस्ताशी नाते</Box>
                                <Box>अर्जदाराशी नाते</Box>
                                <Box>प्रमाणपत्राचे प्रयोजन</Box>
                                <Box sx={{ textAlign: 'center' }}>कृती</Box>
                            </Box>
                            {formData.certificateHolders
                                .filter(holder =>
                                    holder.fullName.firstName?.trim() ||
                                    holder.fullName.middleName?.trim() ||
                                    holder.fullName.lastName?.trim() ||
                                    holder.relationToPAP?.trim() ||
                                    holder.relationToApplicant?.trim() ||
                                    holder.certificatePurpose?.trim()
                                )
                                .map((holder, index) => (
                                    <Box key={holder.id} sx={{
                                        display: { xs: 'none', lg: 'grid' },
                                        gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 120px',
                                        gap: 2,
                                        p: 2,
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        mb: 1,
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: '#f0f7ff',
                                            borderColor: '#1a5276',
                                            boxShadow: '0 2px 8px rgba(26, 82, 118, 0.15)'
                                        }
                                    }}>
                                        <Box sx={{
                                            fontWeight: 500,
                                            color: '#2c3e50'
                                        }}>
                                            {`${holder.fullName.firstName} ${holder.fullName.middleName ? holder.fullName.middleName + ' ' : ''}${holder.fullName.lastName}`}
                                        </Box>
                                        <Box sx={{ color: '#34495e' }}>{holder.relationToPAP}</Box>
                                        <Box sx={{ color: '#34495e' }}>{holder.relationToApplicant}</Box>
                                        <Box sx={{ color: '#34495e' }}>{holder.certificatePurpose}</Box>
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <Button
                                                onClick={() => onRemoveCertificateHolder(index)}
                                                variant="outlined"
                                                size="small"
                                                color="error"
                                                sx={{
                                                    minWidth: '60px',
                                                    "&:hover": {
                                                        backgroundColor: "rgba(211, 47, 47, 0.1)",
                                                        borderColor: '#d32f2f'
                                                    }
                                                }}
                                            >
                                                काढा
                                            </Button>
                                        </Box>
                                    </Box>
                                ))}

                            {/* Mobile View */}
                            {formData.certificateHolders
                                .filter(holder =>
                                    holder.fullName.firstName?.trim() ||
                                    holder.fullName.middleName?.trim() ||
                                    holder.fullName.lastName?.trim() ||
                                    holder.relationToPAP?.trim() ||
                                    holder.relationToApplicant?.trim() ||
                                    holder.certificatePurpose?.trim()
                                )
                                .map((holder, index) => (
                                    <Card key={`mobile-${holder.id}`} sx={{
                                        display: { xs: 'block', lg: 'none' },
                                        mb: 2,
                                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafbfc',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: '#f0f7ff',
                                            borderColor: '#1a5276',
                                            boxShadow: '0 2px 8px rgba(26, 82, 118, 0.15)'
                                        }
                                    }}>
                                        <CardContent sx={{ p: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Typography variant="subtitle1" sx={{
                                                    fontWeight: 600,
                                                    color: '#2c3e50',
                                                    flex: 1
                                                }}>
                                                    {`${holder.fullName.firstName} ${holder.fullName.middleName ? holder.fullName.middleName + ' ' : ''}${holder.fullName.lastName}`}
                                                </Typography>
                                                <Button
                                                    onClick={() => onRemoveCertificateHolder(index)}
                                                    variant="outlined"
                                                    size="small"
                                                    color="error"
                                                    sx={{
                                                        minWidth: '50px',
                                                        ml: 1,
                                                        "&:hover": {
                                                            backgroundColor: "rgba(211, 47, 47, 0.1)",
                                                            borderColor: '#d32f2f'
                                                        }
                                                    }}
                                                >
                                                    काढा
                                                </Button>
                                            </Box>

                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                                                        प्रकल्पग्रस्ताशी नाते:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#34495e' }}>
                                                        {holder.relationToPAP}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                                                        अर्जदाराशी नाते:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#34495e' }}>
                                                        {holder.relationToApplicant}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                                                        प्रमाणपत्राचे प्रयोजन:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#34495e' }}>
                                                        {holder.certificatePurpose}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

// Step 4: Certificate Holder Selection
export const CertificateHolderSelectionStep: React.FC<StepProps> = ({
    formData,
    onCertificateHolderSelection
}) => {
    return (
        <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
                कुटुंबातील सदस्यांमधून प्रमाणपत्र धारक निवडा. फक्त एक सदस्य प्रमाणपत्र धारक असू शकतो.
            </Typography>

            <Card sx={{
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                borderRadius: "10px"
            }}>
                <CardContent sx={{ p: 3 }}>
                    {formData.certificateHolders.length === 0 ? (
                        <Box sx={{
                            textAlign: 'center',
                            py: 4,
                            color: '#666'
                        }}>
                            <Typography variant="body1">
                                कृपया मागील पायरीत कुटुंबातील सदस्य जोडा
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                            {/* Desktop/Tablet View */}
                            <Box sx={{
                                display: { xs: 'none', lg: 'grid' },
                                gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 120px',
                                gap: 2,
                                mb: 2,
                                p: 2,
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                fontWeight: 600,
                                color: '#1a5276',
                                borderBottom: '2px solid #e3f2fd'
                            }}>
                                <Box>नाव</Box>
                                <Box>प्रकल्पग्रस्ताशी नाते</Box>
                                <Box>अर्जदाराशी नाते</Box>
                                <Box>प्रमाणपत्राचे प्रयोजन</Box>
                                <Box sx={{ textAlign: 'center' }}>निवड</Box>
                            </Box>

                            {formData.certificateHolders.map((holder, index) => (
                                <Box key={holder.id} sx={{
                                    display: { xs: 'none', lg: 'grid' },
                                    gridTemplateColumns: '2fr 1.5fr 1.5fr 1.5fr 120px',
                                    gap: 2,
                                    p: 2,
                                    border: `2px solid ${holder.isCertificateHolder ? "#4caf50" : "#e0e0e0"}`,
                                    borderRadius: '8px',
                                    mb: 1,
                                    backgroundColor: holder.isCertificateHolder ? '#f8fff8' : (index % 2 === 0 ? '#ffffff' : '#fafbfc'),
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: holder.isCertificateHolder ? '#f0fff0' : '#f0f7ff',
                                        borderColor: holder.isCertificateHolder ? '#45a049' : '#1a5276',
                                        boxShadow: '0 2px 8px rgba(26, 82, 118, 0.15)'
                                    }
                                }}
                                    onClick={() => onCertificateHolderSelection(index)}
                                >
                                    <Box sx={{
                                        fontWeight: 500,
                                        color: holder.isCertificateHolder ? '#4caf50' : '#2c3e50'
                                    }}>
                                        {`${holder.fullName.firstName} ${holder.fullName.middleName ? holder.fullName.middleName + ' ' : ''}${holder.fullName.lastName}`}
                                    </Box>
                                    <Box sx={{ color: '#34495e' }}>{holder.relationToPAP}</Box>
                                    <Box sx={{ color: '#34495e' }}>{holder.relationToApplicant}</Box>
                                    <Box sx={{ color: '#34495e' }}>{holder.certificatePurpose}</Box>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {holder.isCertificateHolder ? (
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                color: "#4caf50",
                                                fontWeight: 600
                                            }}>
                                                <CheckCircle />
                                                <Typography variant="body2">
                                                    निवडले
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    minWidth: '60px',
                                                    borderColor: '#1a5276',
                                                    color: '#1a5276',
                                                    "&:hover": {
                                                        borderColor: '#0d3d56',
                                                        backgroundColor: 'rgba(26, 82, 118, 0.1)',
                                                    }
                                                }}
                                            >
                                                निवडा
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            ))}

                            {/* Mobile View */}
                            {formData.certificateHolders.map((holder, index) => (
                                <Card key={`mobile-${holder.id}`} sx={{
                                    display: { xs: 'block', lg: 'none' },
                                    mb: 2,
                                    backgroundColor: holder.isCertificateHolder ? '#f8fff8' : (index % 2 === 0 ? '#ffffff' : '#fafbfc'),
                                    border: `2px solid ${holder.isCertificateHolder ? "#4caf50" : "#e0e0e0"}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: holder.isCertificateHolder ? '#f0fff0' : '#f0f7ff',
                                        borderColor: holder.isCertificateHolder ? '#45a049' : '#1a5276',
                                        boxShadow: '0 2px 8px rgba(26, 82, 118, 0.15)'
                                    }
                                }}
                                    onClick={() => onCertificateHolderSelection(index)}
                                >
                                    <CardContent sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{
                                                fontWeight: 600,
                                                color: holder.isCertificateHolder ? '#4caf50' : '#2c3e50',
                                                flex: 1
                                            }}>
                                                {`${holder.fullName.firstName} ${holder.fullName.middleName ? holder.fullName.middleName + ' ' : ''}${holder.fullName.lastName}`}
                                            </Typography>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                {holder.isCertificateHolder ? (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        color: "#4caf50",
                                                        fontWeight: 600
                                                    }}>
                                                        <CheckCircle />
                                                        <Typography variant="body2">
                                                            निवडले
                                                        </Typography>
                                                    </Box>
                                                ) : (
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{
                                                            minWidth: '50px',
                                                            borderColor: '#1a5276',
                                                            color: '#1a5276',
                                                            "&:hover": {
                                                                borderColor: '#0d3d56',
                                                                backgroundColor: 'rgba(26, 82, 118, 0.1)',
                                                            }
                                                        }}
                                                    >
                                                        निवडा
                                                    </Button>
                                                )}
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                                                    प्रकल्पग्रस्ताशी नाते:
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#34495e' }}>
                                                    {holder.relationToPAP}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                                                    अर्जदाराशी नाते:
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#34495e' }}>
                                                    {holder.relationToApplicant}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                                                    प्रमाणपत्राचे प्रयोजन:
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#34495e' }}>
                                                    {holder.certificatePurpose}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

// Step 5: Affected Land Information
export const AffectedLandStep: React.FC<StepProps> = ({ formData, onInputChange }) => {
    return (
        <Box>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        required
                        fullWidth
                        label="गाव"
                        value={formData.affectedLand.village}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('affectedLand', 'village', e.target.value)}
                        variant="outlined"
                        error={!formData.affectedLand.village?.trim()}
                        helperText={!formData.affectedLand.village?.trim() ? "गाव आवश्यक आहे" : ""}
                        sx={getFieldStyles(formData.affectedLand.village, true, !formData.affectedLand.village?.trim())}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        required
                        fullWidth
                        label="तालुका"
                        value={formData.affectedLand.taluka}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('affectedLand', 'taluka', e.target.value)}
                        variant="outlined"
                        error={!formData.affectedLand.taluka?.trim()}
                        helperText={!formData.affectedLand.taluka?.trim() ? "तालुका आवश्यक आहे" : ""}
                        sx={getFieldStyles(formData.affectedLand.taluka, true, !formData.affectedLand.taluka?.trim())}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        required
                        fullWidth
                        label="जिल्हा"
                        value={formData.affectedLand.district}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('affectedLand', 'district', e.target.value)}
                        variant="outlined"
                        error={!formData.affectedLand.district?.trim()}
                        helperText={!formData.affectedLand.district?.trim() ? "जिल्हा आवश्यक आहे" : ""}
                        sx={getFieldStyles(formData.affectedLand.district, true, !formData.affectedLand.district?.trim())}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        required
                        fullWidth
                        label="शेत सर्व्हे नं./गट नं."
                        value={formData.affectedLand.surveyGroupNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('affectedLand', 'surveyGroupNumber', e.target.value)}
                        variant="outlined"
                        error={!formData.affectedLand.surveyGroupNumber?.trim()}
                        helperText={!formData.affectedLand.surveyGroupNumber?.trim() ? "सर्व्हे/गट नंबर आवश्यक आहे" : ""}
                        sx={getFieldStyles(formData.affectedLand.surveyGroupNumber, true, !formData.affectedLand.surveyGroupNumber?.trim())}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="क्षेत्र (हे.आर)"
                        value={formData.affectedLand.areaInHectares}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('affectedLand', 'areaInHectares', e.target.value)}
                        variant="outlined"
                        sx={getFieldStyles(formData.affectedLand.areaInHectares, false)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="घर क्रमांक"
                        value={formData.affectedLand.houseNumber}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('affectedLand', 'houseNumber', e.target.value)}
                        variant="outlined"
                        sx={getFieldStyles(formData.affectedLand.houseNumber, false)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                    <TextField
                        fullWidth
                        label="क्षेत्र (चौ.मी)"
                        value={formData.affectedLand.areaInSquareMeters}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange('affectedLand', 'areaInSquareMeters', e.target.value)}
                        variant="outlined"
                        sx={getFieldStyles(formData.affectedLand.areaInSquareMeters, false)}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

// Step 6: Document Uploads
export const DocumentsStep: React.FC<StepProps> = ({
    formData,
    onFileUpload,
    onFileDelete,
    onFileSelect,
    onFileRemove,
    uploadProgress,
    uploadErrors,
    fileInputRefs,
    selectedFiles,
    editMode = false,
    documentValidationErrors = {}
}) => {
    const handleFileSelection = (docConfig: typeof DOCUMENT_CONFIG[0], file: File | null) => {
        if (editMode) {
            // For edit mode, use the old upload approach
            if (file && onFileUpload) {
                onFileUpload(docConfig.id, file);
            }
        } else {
            // For new applications, use file selection approach
            if (onFileSelect) {
                onFileSelect(docConfig.id, file);
            }
        }
    };

    const handleFileRemoval = (docConfig: typeof DOCUMENT_CONFIG[0]) => {
        if (editMode) {
            // For edit mode, use the old delete approach
            if (onFileDelete) {
                onFileDelete(docConfig.id);
            }
        } else {
            // For new applications, use file removal approach
            if (onFileRemove) {
                onFileRemove(docConfig.id);
            }
        }
    };

    const getFileInfo = (docConfig: typeof DOCUMENT_CONFIG[0]) => {
        if (editMode) {
            return formData.documents[docConfig.id];
        } else {
            return selectedFiles?.[docConfig.id] ? {
                name: selectedFiles[docConfig.id]!.name,
                size: selectedFiles[docConfig.id]!.size
            } : null;
        }
    };

    const hasFile = (docConfig: typeof DOCUMENT_CONFIG[0]) => {
        if (editMode) {
            return !!formData.documents[docConfig.id];
        } else {
            return !!selectedFiles?.[docConfig.id];
        }
    };

    return (
        <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
                {editMode ? 'फाइल अपलोड किंवा बदला करा' : 'सर्व फाइल निवडा (सबमिट करताना एकाच वेळी अपलोड होतील)'}
            </Typography>

            <Grid container spacing={2}>
                {DOCUMENT_CONFIG.map((docConfig) => (
                    <Grid item xs={12} sm={6} md={6} key={docConfig.id}>
                        <Card sx={{
                            height: '100%',
                            border: documentValidationErrors[docConfig.id] ? '2px solid #d32f2f' : '1px solid #e0e0e0',
                            backgroundColor: documentValidationErrors[docConfig.id] ? '#ffebee' : '#fff'
                        }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom>
                                    {docConfig.name}
                                    {docConfig.required && <span style={{ color: 'red' }}> *</span>}
                                </Typography>

                                {hasFile(docConfig) ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <CheckCircle color="success" />
                                        <Typography variant="body2" sx={{ flex: 1 }}>
                                            {getFileInfo(docConfig)?.name}
                                        </Typography>
                                        <IconButton
                                            onClick={() => handleFileRemoval(docConfig)}
                                            size="small"
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box>
                                        <input
                                            type="file"
                                            ref={(el: HTMLInputElement | null) => {
                                                if (el) {
                                                    fileInputRefs.current[docConfig.id] = el;
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                            accept={docConfig.acceptedTypes.join(',')}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    handleFileSelection(docConfig, file);
                                                }
                                                // Clear the input so the same file can be selected again
                                                e.target.value = '';
                                            }}
                                        />
                                        <Button
                                            variant="outlined"
                                            startIcon={<CloudUpload />}
                                            onClick={() => fileInputRefs.current[docConfig.id]?.click()}
                                            fullWidth
                                        >
                                            फाइल निवडा
                                        </Button>

                                        {/* Show upload progress only in edit mode */}
                                        {editMode && uploadProgress[docConfig.id] > 0 && (
                                            <LinearProgress
                                                variant="determinate"
                                                value={uploadProgress[docConfig.id]}
                                                sx={{ mt: 1 }}
                                            />
                                        )}

                                        {uploadErrors[docConfig.id] && (
                                            <Box sx={{ mt: 1, mb: 1, p: 1, bgcolor: '#ffebee', border: '1px solid #f44336', borderRadius: 1 }}>
                                                <Typography variant="body2" color="error">
                                                    {uploadErrors[docConfig.id]}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                )}

                                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                    स्वीकार्य: {docConfig.acceptedTypes.join(', ')} | कमाल आकार: {docConfig.maxSize}MB
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

// Step 7: Review and Confirm
export const ReviewStep: React.FC<StepProps> = ({ formData, selectedFiles, editMode = false }) => {
    return (
        <Box>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
                कृपया सर्व माहिती तपासून पहा आणि पुष्टी करा
            </Typography>

            <Grid container spacing={3}>
                {/* Applicant Information Review */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, color: '#1a5276' }}>
                                अर्जदाराची माहिती
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2">
                                    <strong>नाव:</strong> {formData.applicant.firstName} {formData.applicant.middleName} {formData.applicant.lastName}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>गाव:</strong> {formData.applicant.village}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>तालुका:</strong> {formData.applicant.taluka}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>जिल्हा:</strong> {formData.applicant.district}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>मोबाईल:</strong> {formData.applicant.mobileNumber}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Project Information Review */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, color: '#1a5276' }}>
                                प्रकल्पग्रस्ताची माहिती
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2">
                                    <strong>प्रकल्प:</strong> {formData.projectAffectedPerson.projectName}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>प्रकल्पग्रस्ताचे नाव:</strong> {formData.projectAffectedPerson.name}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>प्रयोजन:</strong> {formData.projectAffectedPerson.projectPurpose}
                                </Typography>
                                {formData.projectAffectedPerson.aadhaarId && (
                                    <Typography variant="body2">
                                        <strong>आधार कार्ड क्रमांक:</strong> {formData.projectAffectedPerson.aadhaarId}
                                    </Typography>
                                )}
                                {formData.projectAffectedPerson.farmerId && (
                                    <Typography variant="body2">
                                        <strong>शेतकरी आयडी:</strong> {formData.projectAffectedPerson.farmerId}
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Certificate Holders Review */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, color: '#1a5276' }}>
                                प्रमाणपत्र धारक
                            </Typography>
                            {formData.certificateHolders.map((holder, index) => (
                                <Box key={holder.id} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1, color: holder.isCertificateHolder ? '#4caf50' : '#666' }}>
                                        सदस्य {index + 1} {holder.isCertificateHolder && '✓ (प्रमाणपत्र धारक)'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>नाव:</strong> {holder.fullName.firstName} {holder.fullName.middleName} {holder.fullName.lastName}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>प्रयोजन:</strong> {holder.certificatePurpose}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>प्रकल्पग्रस्ताशी नाते:</strong> {holder.relationToPAP}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>अर्जदाराशी नाते:</strong> {holder.relationToApplicant}
                                    </Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Affected Land Review */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, color: '#1a5276' }}>
                                बाधित जमिनीची माहिती
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2">
                                    <strong>गाव:</strong> {formData.affectedLand.village}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>तालुका:</strong> {formData.affectedLand.taluka}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>जिल्हा:</strong> {formData.affectedLand.district}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>सर्व्हे/गट नंबर:</strong> {formData.affectedLand.surveyGroupNumber}
                                </Typography>
                                {formData.affectedLand.areaInHectares && (
                                    <Typography variant="body2">
                                        <strong>क्षेत्र (हे.आर):</strong> {formData.affectedLand.areaInHectares}
                                    </Typography>
                                )}
                                {formData.affectedLand.houseNumber && (
                                    <Typography variant="body2">
                                        <strong>घर क्रमांक:</strong> {formData.affectedLand.houseNumber}
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Documents Review */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, color: '#1a5276' }}>
                                अपलोड केलेली कागदपत्रे
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {DOCUMENT_CONFIG.map((docConfig) => {
                                    // Check for document in edit mode or selected file in new application mode
                                    const hasDocument = editMode
                                        ? !!formData.documents[docConfig.id]  // Edit mode: check documents object
                                        : !!selectedFiles?.[docConfig.id];    // New mode: check selectedFiles

                                    const documentName = editMode && formData.documents[docConfig.id]
                                        ? formData.documents[docConfig.id]!.name
                                        : selectedFiles?.[docConfig.id]?.name;

                                    return (
                                        <Box key={docConfig.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {hasDocument ? (
                                                <>
                                                    <CheckCircle color="success" fontSize="small" />
                                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                                        {docConfig.name}
                                                        {documentName && (
                                                            <Typography component="span" variant="caption" sx={{ ml: 1, color: '#666' }}>
                                                                ({documentName})
                                                            </Typography>
                                                        )}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <>
                                                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#ccc' }} />
                                                    <Typography variant="body2" sx={{ flex: 1, color: '#999' }}>
                                                        {docConfig.name} {docConfig.required && '(आवश्यक)'}
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}; 