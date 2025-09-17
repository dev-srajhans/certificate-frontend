import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Modal,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Autocomplete,
} from '@mui/material';
import Grid from "@mui/material/Grid";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormState, Project } from '../types';
import { Close } from '@mui/icons-material';
import ConfirmationDialog from './ConfirmationDialog';
const API_URL = import.meta.env.VITE_API_URL;
import { initialFormState } from '../Helpers/initialFormState';
// Import utility functions from the utils folder
import {
  handleInputChange,
  handleDateChange,
  handleMembers,
  updateFormState,
  addMember,
  removeMember,
  resetForm,
  handleSubmit as utilHandleSubmit,
  handleUpdate as utilHandleUpdate,
  confirmSelection as utilConfirmSelection,
  CertificateHandlerDependencies
} from './utils/certificateHandlers';
import { fetchProjects } from '../api/certificateApi';


type AddCertificateProps = {
  Opened: boolean;
  onClose: () => void;
  initialData: FormState | null;
  isEditMode: boolean;
  whichForm: number | null;
  handleEditClick?: (rowId: number, formId: number) => Promise<void>;
  onFormSuccess?: () => void;
};
/**
 * 
 * @param whichForm- This contains the which form is this 
 *        1: Edit form or new form
 *        2: Nav Hastantaran Form
 *        3: Duyam Nav Hastantaran Form
 * @returns 
 */
// Global cache for projects to avoid refetching
let projectsCache: Project[] = [];
let projectsCacheLoaded = false;

// Function to clear projects cache (useful if projects are updated)
export const clearProjectsCache = () => {
  projectsCache = [];
  projectsCacheLoaded = false;
};

export default function AddCertificate({ Opened, onClose, initialData, isEditMode, whichForm, handleEditClick, onFormSuccess }: AddCertificateProps) {
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [junaDharak, setJunaDharak] = useState<string | null>(null);
  const [navinDharak, setNavinDharak] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ id: number, name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for project dropdown
  const [projects, setProjects] = useState<Project[]>(projectsCache);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectInputValue, setProjectInputValue] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(!projectsCacheLoaded);

  // State for duplicate name confirmation
  const [duplicateConfirmOpen, setDuplicateConfirmOpen] = useState(false);
  const [duplicateMatch, setDuplicateMatch] = useState<{ id: number, name: string } | null>(null);

  // State for alert dialog
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const duplicateNavHastantaran = whichForm;
  whichForm = duplicateNavHastantaran === 3 ? 2 : duplicateNavHastantaran;

  // Function to show custom alert dialog
  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  const handleAlertClose = () => {
    setAlertOpen(false);
  };

  // Fetch projects only if not already cached
  useEffect(() => {
    const loadProjects = async () => {
      if (projectsCacheLoaded) {
        setProjects(projectsCache);
        setIsLoadingProjects(false);
        return;
      }

      setIsLoadingProjects(true);
      try {
        const projectData = await fetchProjects();
        setProjects(projectData);
        projectsCache = projectData; // Cache the data
        projectsCacheLoaded = true; // Mark as loaded
      } catch (error) {
        console.error('Error loading projects:', error);
        showAlert("त्रुटी", "प्रकल्प डेटा लोड करण्यात त्रुटी आली आहे।");
      } finally {
        setIsLoadingProjects(false);
      }
    };

    if (Opened) {
      loadProjects();
    }
  }, [Opened]);

  // Handle project selection
  const handleProjectChange = (_event: React.SyntheticEvent, newValue: Project | null) => {
    setSelectedProject(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        Prakalpa_id: newValue.Prakalpa_id,
        prakalpa_nav: newValue.prakalpa_nav
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        Prakalpa_id: null,
        prakalpa_nav: ''
      }));
    }
  };

  // Handle project input change
  const handleProjectInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    setProjectInputValue(newInputValue);
  };

  // Create dependencies object for utility functions
  const dependencies: CertificateHandlerDependencies = {
    formData,
    setFormData,
    onClose,
    setConfirmOpen,
    setSelectedIndex,
    setJunaDharak,
    setNavinDharak,
    isEditMode,
    duplicateNavHastantaran,
    junaDharak,
    selectedIndex,
    API_URL,
    showAlert
  };

  // Handle debounced search for prakalp_grast_nav
  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Update form data
    setFormData(prev => ({
      ...prev,
      prakalp_grast_nav: value
    }));

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for API call - only fetch suggestions while typing, don't trigger edit mode
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/admin/getGrastNames?query=${encodeURIComponent(value)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');

        const data = await response.json();

        setSuggestions(data.suggestions);
        setShowSuggestions(true);

        // Don't check for exact match while typing - we'll do that on blur
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    }, 500) as unknown as number;
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: { id: number, name: string }) => {
    setFormData(prev => ({
      ...prev,
      prakalp_grast_nav: suggestion.name
    }));
    setShowSuggestions(false);

    // Show confirmation dialog instead of directly opening edit mode
    if (handleEditClick) {
      setDuplicateMatch(suggestion);
      setDuplicateConfirmOpen(true);
    }
  };

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    // Arrow down - move selection down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    }

    // Arrow up - move selection up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev > 0 ? prev - 1 : 0
      );
    }

    // Enter - select the highlighted suggestion
    else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedSuggestionIndex]);
    }

    // Escape - close suggestions
    else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
    }
  };

  // Reset selection index when suggestions change
  useEffect(() => {
    setSelectedSuggestionIndex(-1);
  }, [suggestions]);

  // Helper function to check if at least one family member is marked as pramanpatradharak
  const hasCertificateHolder = () => {
    return formData.familymembers.some(member => member.pramanpatradharak === true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    // Check if at least one family member is marked as pramanpatradharak
    if (!hasCertificateHolder()) {
      showAlert("सूचना", "प्रमाणपत्र धारक निवडा। कृपया किमान एका सदस्याला प्रमाणपत्र धारक म्हणून निवडा।");
      return;
    }

    // Note: Duplicate name checking is now handled in the onBlur event of the name field
    // with a confirmation dialog, so we don't need to check here again

    // Set loading state
    setIsSubmitting(true);

    // Create a wrapped version of dependencies
    const wrappedDeps = {
      ...dependencies,
      onSuccess: () => {
        setIsSubmitting(false);
        onClose();
        if (onFormSuccess) {
          onFormSuccess();
        }
      },
      onError: () => {
        setIsSubmitting(false);
      }
    };

    // Call the submit handler with our wrapped dependencies
    utilHandleSubmit(e, wrappedDeps);
  };

  const handleUpdate = (event: React.FormEvent) => {
    event.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    // Check if at least one family member is marked as pramanpatradharak
    if (!hasCertificateHolder()) {
      showAlert("सूचना", "प्रमाणपत्र धारक निवडा। कृपया किमान एका सदस्याला प्रमाणपत्र धारक म्हणून निवडा।");
      return;
    }

    // If we're editing and the name is being changed to match an existing entry
    if (initialData && formData.prakalp_grast_nav !== initialData.prakalp_grast_nav) {
      const matchingName = suggestions.find(
        suggestion => suggestion.name.toLowerCase() === formData.prakalp_grast_nav.toLowerCase() &&
          suggestion.id !== formData.pramanpatra_id
      );

      if (matchingName) {
        showAlert("सूचना", `"${formData.prakalp_grast_nav}" already exists. Please use a different name or edit that record instead.`);
        return;
      }
    }

    // Set loading state
    setIsSubmitting(true);

    // Create a wrapped version of dependencies
    const wrappedDeps = {
      ...dependencies,
      onSuccess: () => {
        setIsSubmitting(false);
        onClose();
        if (onFormSuccess) {
          onFormSuccess();
        }
      },
      onError: () => {
        setIsSubmitting(false);
      }
    };

    // Call the update handler with our wrapped dependencies
    utilHandleUpdate(event, wrappedDeps);
  };

  const handleCertificateSelection = (index: number) => {
    // Check if we're trying to deselect the only certificate holder
    const currentHolderIndex = formData.familymembers.findIndex(member => member.pramanpatradharak);

    if (currentHolderIndex === index) {
      // User is trying to toggle off the current holder - prevent this
      showAlert("सूचना", "प्रमाणपत्र धारक हटविता येत नाही। कृपया दुसरा सदस्य निवडा।");
      return;
    }

    // If we're in edit mode and handling transfer
    if (isEditMode) {
      if (duplicateNavHastantaran === 3 && formData.hastantaran_reason === "") {
        showAlert("सूचना", "कृपया नाव हस्तांतरण प्रमाणपत्राचे कारण भरा।");
        return;
      } else {
        const dharak = formData.familymembers.find(m => m.pramanpatradharak);
        const navin = formData.familymembers[index];

        setJunaDharak(dharak ? `${dharak.name} (${dharak.relation})` : "सध्याचा धारक");
        setNavinDharak(navin ? `${navin.name} (${navin.relation})` : "नवीन धारक");

        setSelectedIndex(index);
        setConfirmOpen(true);
      }
    } else {
      // Standard behavior, use the utility function
      updateFormState(index, setFormData);
    }
  };

  const confirmSelection = async () => {
    utilConfirmSelection(selectedIndex, dependencies);
  };

  useEffect(() => {
    if (initialData) {
      const editFormData: FormState = {
        pramanpatra_id: initialData?.pramanpatra_id || null,
        issue_dt: initialData?.issue_dt || new Date(),
        prakalp_grast_nav: initialData?.prakalp_grast_nav || "",
        prakalpa_nav: initialData?.prakalpa_nav || "",
        grast_gav: initialData?.grast_gav || "",
        grast_taluka: initialData?.grast_taluka || "",
        grast_jilha: initialData?.grast_jilha || "",
        familymembers: initialData?.familymembers || [{ name: "", relation: "", pramanpatradharak: false }],
        grast_pin_code: initialData?.grast_pin_code || "",
        Prakalpa_id: initialData?.Prakalpa_id || null,

        updated_by: sessionStorage.getItem("User_id"),
        shet_jamin_gav: initialData?.shet_jamin_gav || "",
        shet_jamin_taluka: initialData?.shet_jamin_taluka || "",
        shet_jamin_jilha: initialData?.shet_jamin_jilha || "",
        shet_jamin_pin_code: initialData?.shet_jamin_pin_code || "",
        shet_jamin_serve_gut: initialData?.shet_jamin_serve_gut || "",
        shet_jamin_shetra: initialData?.shet_jamin_shetra || "",
        budit_malmata_gav: initialData?.budit_malmata_gav || "",
        budit_malmata_taluka: initialData?.budit_malmata_taluka || "",
        budit_malmata_jilha: initialData?.budit_malmata_jilha || "",
        budit_malmata_pin_code: initialData?.budit_malmata_pin_code || "",
        budit_malmata_ghar_number: initialData?.budit_malmata_ghar_number || "",
        budit_malmata_shetra: initialData?.budit_malmata_shetra || "",
        hastantaran_reason: "",
      };

      setFormData(editFormData);

      // Set the selected project for the autocomplete
      if (initialData?.Prakalpa_id && initialData?.prakalpa_nav) {
        // Find the matching project from cache or current projects
        const matchingProject = (projectsCache.length > 0 ? projectsCache : projects).find(p => p.Prakalpa_id === initialData.Prakalpa_id);
        setSelectedProject(matchingProject || null);
        setProjectInputValue(initialData.prakalpa_nav);
      } else {
        setSelectedProject(null);
        setProjectInputValue("");
      }
    } else {
      setFormData(initialFormState);
      setSelectedProject(null);
      setProjectInputValue("");
    }
  }, [initialData]);

  // Handle setting selected project when projects are loaded in edit mode
  useEffect(() => {
    if (initialData?.Prakalpa_id && initialData?.prakalpa_nav && projects.length > 0 && !selectedProject) {
      const matchingProject = projects.find(p => p.Prakalpa_id === initialData.Prakalpa_id);
      if (matchingProject) {
        setSelectedProject(matchingProject);
        setProjectInputValue(initialData.prakalpa_nav);
      }
    }
  }, [projects, initialData, selectedProject]);

  // Add a new function to check for exact matches and show confirmation dialog
  const checkExactMatch = async () => {
    // Only check if not in edit mode already
    if (!isEditMode && formData.prakalp_grast_nav.trim() !== '') {
      try {
        // Make an API call to check for exact matches
        const response = await fetch(`${API_URL}/admin/getGrastNames?query=${encodeURIComponent(formData.prakalp_grast_nav)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');

        const data = await response.json();

        // Check if data has the expected structure
        if (!data || !data.suggestions || !Array.isArray(data.suggestions)) {
          console.error('Invalid API response structure:', data);
          return false;
        }

        // Check if there's an exact match with the fresh suggestions
        const exactMatch = data.suggestions.find(
          (suggestion: { id: number, name: string }) =>
            suggestion.name.toLowerCase() === formData.prakalp_grast_nav.toLowerCase()
        );

        // If found exact match, show confirmation dialog
        if (exactMatch && handleEditClick) {
          setDuplicateMatch(exactMatch);
          setDuplicateConfirmOpen(true);
          return true;
        }
      } catch (error) {
        console.error('Error checking for exact match:', error);
      }
    }
    return false;
  };

  // Handle duplicate name confirmation
  const handleDuplicateConfirm = () => {
    if (duplicateMatch && handleEditClick) {
      handleEditClick(duplicateMatch.id, 1);
    }
    setDuplicateConfirmOpen(false);
    setDuplicateMatch(null);
  };

  const handleDuplicateCancel = () => {
    // Clear the input field
    setFormData(prev => ({
      ...prev,
      prakalp_grast_nav: ""
    }));
    setDuplicateConfirmOpen(false);
    setDuplicateMatch(null);
  };

  return (
    <>
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} sx={{ flex: 1, textAlign: "center" }}>
        <DialogTitle variant="h6" component="div" sx={{ fontWeight: "bold" }}>धारक बदल निश्चित करा</DialogTitle>
        <DialogContent>
          <DialogContentText>ही कृती प्रमाणपत्र एका धारकाकडून दुसऱ्या धारकाकडे हस्तांतरित करेल.</DialogContentText>
          <DialogContentText>मूळ धारक: {junaDharak}</DialogContentText>
          <DialogContentText>नवीन धारक: {navinDharak}</DialogContentText>
          <DialogContentText>नवीन धारकासाठी नाव हस्तांतरण प्रमाणपत्र तयार होईल.</DialogContentText>
          <DialogContentText>कृपया खात्री करून ही कृती सुरू ठेवा.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={confirmSelection} sx={{ fontWeight: "bold" }} color="primary" autoFocus>
            नाव हस्तांतरण प्रमाणपत्र काढा
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Name Confirmation Dialog */}
      <ConfirmationDialog
        open={duplicateConfirmOpen}
        onClose={handleDuplicateCancel}
        onConfirm={handleDuplicateConfirm}
        title="नाव आधीपासून अस्तित्वात आहे"
        message={`"${duplicateMatch?.name}" हे नाव आधीपासून डेटाबेसमध्ये अस्तित्वात आहे. तुम्हाला या रेकॉर्डची माहिती मिळवून एडिट मोडमध्ये उघडायचे आहे का?`}
        confirmText="होय, एडिट मोडमध्ये उघडा"
        cancelText="नाही, नाव बदला"
        bgColor="#1976d2"
        confirmButtonColor="#1976d2"
      />

      {/* Alert Dialog */}
      <ConfirmationDialog
        open={alertOpen}
        onClose={handleAlertClose}
        onConfirm={handleAlertClose}
        title={alertTitle}
        message={alertMessage}
        confirmText="ठीक आहे"
        showCancelButton={false}
        bgColor="#1976d2"
        confirmButtonColor="#1976d2"
      />
      <Modal
        open={Opened}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 0,
            width: whichForm === 2 ? "55%" : "85%", // Adjust width based on form type
            maxHeight: "90%", // Allow more vertical space
            overflowY: "auto", // Enable scrolling
            borderRadius: "12px", // Rounded corners
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)", // Soft shadow for depth
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "#1a5276", // Use the specified blue color
              p: 2.5,
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          >
            <Typography
              id="modal-modal-title"
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
              {duplicateNavHastantaran === 3 ? "दुय्यम नाव हस्तांतरण करा" : whichForm === 1 ? isEditMode ? "प्रमाणपत्र संपादित करा" : "प्रमाणपत्र बनवा" : "नाव हस्तांतरण करा"}
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

          <Box
            id="modal-modal-description"
            component="form"
            onKeyDown={(e: React.KeyboardEvent<HTMLFormElement>) => {
              if (e.key === "Enter" && (e.target as HTMLElement).nodeName === "INPUT") {
                e.preventDefault(); // Prevent form submission on Enter key press
              }
            }}
            noValidate
            tabIndex={-1}
            sx={{
              width: '100%',
              p: 3, // Add padding for the form content
              backgroundColor: "#f8f9fa" // Light background for the form
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>

              {/* *************************************** प्रकल्पग्रस्ताची माहिती *************************************** */}
              <Divider sx={{ mt: 4, mb: 4 }} style={{ display: whichForm === 1 ? undefined : "none" }}><Chip label="प्रकल्पग्रस्ताची माहिती" size="medium" /></Divider>

              <Grid container spacing={4} sx={{ width: '100%', mt: whichForm === 2 ? 4 : 0 }}>
                {/* Prakalpa Nav - Autocomplete Dropdown */}
                <Grid item xs={12} md={whichForm === 2 ? 4 : 2}>
                  <Autocomplete
                    value={selectedProject}
                    onChange={handleProjectChange}
                    inputValue={projectInputValue}
                    onInputChange={handleProjectInputChange}
                    options={projects}
                    getOptionLabel={(option) => option.prakalpa_nav}
                    isOptionEqualToValue={(option, value) => option.Prakalpa_id === value.Prakalpa_id}
                    loading={isLoadingProjects}
                    renderInput={(params) => (
                      // @ts-expect-error - Autocomplete types are not compatible with TextField
                      <TextField
                        required
                        label="प्रकल्पाचे नाव"
                        variant="outlined"
                        inputRef={params.InputProps.ref}
                        {...params}
                      />
                    )}
                    sx={{ width: "100%" }}
                    noOptionsText="कोणतेही प्रकल्प सापडले नाहीत"
                    loadingText="प्रकल्प लोड करत आहे..."
                  />
                </Grid>


                {/* Prakalp Grast Nav */}
                <Grid item xs={12} md={whichForm === 2 ? 4 : 2} style={{ position: 'relative' }}>
                  <Box onKeyDown={handleKeyDown}>
                    <TextField
                      required
                      fullWidth
                      label="प्रकल्पग्रस्ताचे नाव"
                      name="prakalp_grast_nav"
                      autoComplete="off"
                      value={formData.prakalp_grast_nav}
                      onChange={handleNameInputChange}
                      variant="outlined"
                      onBlur={async () => {
                        // Wait a moment to make sure any pending API calls complete
                        setTimeout(async () => {
                          // Check for exact match
                          await checkExactMatch();

                          // Always hide suggestions after we're done
                          setShowSuggestions(false);
                        }, 300);
                      }}
                      onFocus={() => {
                        // Show suggestions again if we have them and there's text
                        if (suggestions.length > 0 && formData.prakalp_grast_nav) {
                          setShowSuggestions(true);
                        }
                      }}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <Paper
                        elevation={3}
                        sx={{
                          position: 'absolute',
                          zIndex: 1000,
                          width: '100%',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          mt: 0.5
                        }}
                      >
                        {suggestions.map((suggestion, index) => (
                          <Box
                            key={suggestion.id}
                            sx={{
                              p: 1.5,
                              cursor: 'pointer',
                              backgroundColor: index === selectedSuggestionIndex ? '#e3f2fd' : 'transparent',
                              '&:hover': { backgroundColor: '#e3f2fd' }
                            }}
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion.name}
                          </Box>
                        ))}
                      </Paper>
                    )}
                  </Box>
                </Grid>

                {/* गाव */}
                <Grid item xs={12} md={2} style={{ display: whichForm === 1 ? undefined : "none" }}>
                  <TextField
                    fullWidth
                    label="गाव"
                    name="grast_gav"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.grast_gav}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {/* तालुका  */}
                <Grid item xs={12} md={2} style={{ display: whichForm === 1 ? undefined : "none" }}>
                  <TextField
                    fullWidth
                    label="तालुका "
                    name="grast_taluka"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.grast_taluka}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {/* जिल्हा */}
                <Grid item xs={12} md={2} style={{ display: whichForm === 1 ? undefined : "none" }}>
                  <TextField
                    fullWidth
                    label="जिल्हा"
                    name="grast_jilha"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.grast_jilha}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {/* पिन कोड */}
                <Grid item xs={12} md={2} style={{ display: whichForm === 1 ? undefined : "none" }}>
                  <TextField
                    fullWidth
                    label="पिन कोड"
                    name="grast_pin_code"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.grast_pin_code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={8} style={{ display: duplicateNavHastantaran === 3 ? undefined : "none" }}>
                  <TextField
                    fullWidth
                    required
                    label="दुय्यम नाव हस्तांतरण प्रमाणपत्राचे कारण"
                    name="hastantaran_reason"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.hastantaran_reason}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {formData.familymembers.map((member, index) => (
                  <Grid container item spacing={4} key={index}>
                    <Grid item xs={12} md={whichForm === 2 ? 4 : 2}>
                      <TextField
                        fullWidth
                        label="कुटुंबातील सदस्याचे नाव"
                        name="name"
                        value={member.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMembers(index, "name", e.target.value, setFormData)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={whichForm === 2 ? 4 : 2}>
                      <TextField
                        fullWidth
                        label="प्रकल्पग्रस्ताशी नाते"
                        name="relation"
                        value={member.relation}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMembers(index, "relation", e.target.value, setFormData)}
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Tooltip title="प्रमाणपत्र धारक" arrow>
                        <IconButton
                          onClick={() => handleCertificateSelection(index)}
                          sx={{
                            border: `2px solid ${member.pramanpatradharak ? "green" : "gray"}`,
                            borderRadius: "4px", // Square shape
                            width: 40,
                            height: 40,
                            color: member.pramanpatradharak ? "green" : "gray",
                            backgroundColor: member.pramanpatradharak ? "rgba(0, 128, 0, 0.2)" : "transparent", // Light green bg if selected
                            "&:hover": {
                              backgroundColor: "rgba(0, 128, 0, 0.2)", // Darker green on hover
                            }
                          }}
                        >
                          <Typography variant="h6"> {member.pramanpatradharak ? '✓' : ''}</Typography>
                        </IconButton>
                      </Tooltip>
                      {formData.familymembers.length === 1 || index === formData.familymembers.length - 1 ? (
                        <Tooltip title="सदस्य जोडा" arrow>
                          <Button onClick={() => addMember(setFormData)} variant="outlined" sx={{ border: "2px solid rgba(0, 0, 128, 0.8)", color: "rgba(0, 0, 128, 0.8)", minWidth: 40 }}>+</Button>
                        </Tooltip>
                      ) : (
                        <Tooltip title="सदस्य काढा" arrow>
                          <Button onClick={() => removeMember(index, setFormData)} variant="outlined" sx={{ border: "2px solid rgba(128, 0, 0, 0.8)", color: "rgba(128, 0, 0, 0.8)", minWidth: 40 }} disabled={formData.familymembers.length === 1}>-</Button>
                        </Tooltip>
                      )}
                    </Grid>
                  </Grid>
                ))}
              </Grid>

              {/* *************************************** बाधित शेतजमिनीची माहिती*************************************** */}
              <Divider sx={{ mt: 4, mb: 4 }} style={{ display: whichForm === 1 ? undefined : "none" }}><Chip label="बाधित शेतजमिनीची माहिती" size="medium" /></Divider>

              <Grid container spacing={4} sx={{ width: '100%' }} style={{ display: whichForm === 1 ? undefined : "none" }}>

                {/* गाव */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="गाव"
                    name="shet_jamin_gav"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.shet_jamin_gav}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {/* तालुका  */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="तालुका "
                    name="shet_jamin_taluka"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.shet_jamin_taluka}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {/* जिल्हा */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="जिल्हा"
                    name="shet_jamin_jilha"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.shet_jamin_jilha}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {/* पिन कोड */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="पिन कोड"
                    name="shet_jamin_pin_code"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.shet_jamin_pin_code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {/* सर्वे / गट क्रमांक */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="सर्वे / गट क्रमांक "
                    name="shet_jamin_serve_gut"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.shet_jamin_serve_gut}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>


                {/* क्षेत्र  */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="क्षेत्र"
                    name="shet_jamin_shetra"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.shet_jamin_shetra}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>
              </Grid>



              {/* *************************************** बाधित मालमतेची माहिती *************************************** */}
              <Divider sx={{ mt: 4, mb: 4 }} style={{ display: whichForm === 1 ? undefined : "none" }}><Chip label="बाधित मालमतेची माहिती" size="medium" /></Divider>

              <Grid container spacing={4} sx={{ width: '100%' }} style={{ display: whichForm === 1 ? undefined : "none" }}>
                {/* बाधित मालमत्ता गाव */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="गाव"
                    name="budit_malmata_gav"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.budit_malmata_gav}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {/* बाधित मालमत्ता तालुका  */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="तालुका "
                    name="budit_malmata_taluka"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.budit_malmata_taluka}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {/* बाधित मालमत्ता जिल्हा */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="जिल्हा"
                    name="budit_malmata_jilha"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.budit_malmata_jilha}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {/* बाधित मालमत्ता पिन कोड */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="पिन कोड"
                    name="budit_malmata_pin_code"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.budit_malmata_pin_code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {/* बाधित घर / मालमत्ता घर क्रमांक */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="घर / मालमत्ता क्रमांक "
                    name="budit_malmata_ghar_number"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.budit_malmata_ghar_number}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>


                {/* बाधित मालमत्ता क्षेत्र  */}
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    label="क्षेत्र"
                    name="budit_malmata_shetra"
                    autoComplete="on"
                    multiline
                    rows={1}
                    value={formData.budit_malmata_shetra}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e, setFormData)}
                    variant="outlined"
                  />
                </Grid>

                {/* Issue Date */}
                <Grid item xs={12} md={2}>
                  <DatePicker
                    label="issue Date"
                    value={formData.issue_dt ? new Date(formData.issue_dt) : new Date()}
                    onChange={(date) => handleDateChange(date, 'issue_dt', setFormData)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined'
                      }
                    }}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={4} sx={{ mt: 4, width: '100%' }}>
                {/* Submit Button */}
                <Grid item xs={12} sx={{ textAlign: "right" }}>
                  {!isEditMode && (
                    <Button
                      type="button"
                      variant="outlined"
                      color="warning"
                      size="medium"
                      disabled={isSubmitting}
                      sx={{
                        px: 4,
                        py: 1.5,
                        mr: 2,
                        borderRadius: "8px",
                        borderWidth: "2px",
                        "&:hover": {
                          borderWidth: "2px",
                        }
                      }}
                      onClick={() => resetForm(setFormData, formData)}
                    >
                      Reset
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="contained"
                    size="medium"
                    disabled={isSubmitting}
                    sx={{
                      px: 4,
                      py: 1.5,
                      bgcolor: "#1a5276",
                      borderRadius: "8px",
                      fontWeight: 600,
                      "&:hover": {
                        bgcolor: "#0d3d56"
                      },
                      boxShadow: "0 4px 8px rgba(26, 82, 118, 0.3)"
                    }}
                    onClick={isEditMode ? handleUpdate : handleSubmit}
                  >
                    {isSubmitting ? 'प्रक्रिया सुरू आहे...' : 'प्रविष्ट करा'}
                  </Button>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Box>
        </Paper>
      </Modal >

    </>
  );
}