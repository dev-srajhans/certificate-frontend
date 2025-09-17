import { FormState } from '../../types';
import { initialFormState } from '../../Helpers/initialFormState';
import { Packer } from 'docx';
import { saveAs } from "file-saver";
import { NavHastantaran } from "../../Helpers/NavHastantaran";
import { DuyamNavHastantaran } from "../../Helpers/DuyamNavHastantaran";
import { handleError, handleSuccess } from "../../utils";

// Type definitions for the component props to use in extracted functions
export interface CertificateHandlerDependencies {
    formData: FormState;
    setFormData: React.Dispatch<React.SetStateAction<FormState>>;
    onClose: () => void;
    setConfirmOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedIndex: React.Dispatch<React.SetStateAction<number | null>>;
    setJunaDharak: React.Dispatch<React.SetStateAction<string | null>>;
    setNavinDharak: React.Dispatch<React.SetStateAction<string | null>>;
    isEditMode: boolean;
    duplicateNavHastantaran: number | null;
    junaDharak: string | null;
    selectedIndex: number | null;
    API_URL: string;
    onSuccess?: () => void;
    onError?: () => void;
    showAlert?: (title: string, message: string) => void;
}

/**
 * Handles input changes for form fields
 */
export const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFormData: React.Dispatch<React.SetStateAction<FormState>>
) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
};

/**
 * Handles date field changes
 */
export const handleDateChange = (
    date: Date | null,
    fieldName: string,
    setFormData: React.Dispatch<React.SetStateAction<FormState>>
) => {
    setFormData(prev => ({
        ...prev,
        [fieldName]: date
    }));
};

/**
 * Updates family members in the form
 */
export const handleMembers = (
    index: number,
    field: keyof FormState['familymembers'][number],
    value: string,
    setFormData: React.Dispatch<React.SetStateAction<FormState>>
) => {
    setFormData((prevData) => {
        const updatedMembers = [...prevData.familymembers];
        updatedMembers[index] = { ...updatedMembers[index], [field]: value };
        return { ...prevData, familymembers: updatedMembers };
    });
};

/**
 * Updates the form state to set a family member as the certificate holder
 */
export const updateFormState = (
    selectedIndex: number | null,
    setFormData: React.Dispatch<React.SetStateAction<FormState>>
) => {
    setFormData((prevData) => {
        // If trying to deselect the current holder (uncheck a checked box), don't allow it
        const currentHolderIndex = prevData.familymembers.findIndex(member => member.pramanpatradharak);
        if (currentHolderIndex === selectedIndex) {
            // Don't allow deselecting the only holder - maintain current state
            return prevData;
        }

        // Otherwise, update normally - set the selected index as the holder and clear others
        return {
            ...prevData,
            familymembers: prevData.familymembers.map((member, i) => ({
                ...member,
                pramanpatradharak: i === selectedIndex,
            }))
        };
    });
};

/**
 * Adds a new family member to the form
 */
export const addMember = (
    setFormData: React.Dispatch<React.SetStateAction<FormState>>
) => {
    setFormData((prevData) => ({
        ...prevData,
        familymembers: [...prevData.familymembers, { name: "", relation: "", pramanpatradharak: false }]
    }));
};

/**
 * Removes a family member from the form
 */
export const removeMember = (
    index: number,
    setFormData: React.Dispatch<React.SetStateAction<FormState>>
) => {
    setFormData((prevData) => {
        const updatedMembers = prevData.familymembers.filter((_, i) => i !== index);
        return { ...prevData, familymembers: updatedMembers.length ? updatedMembers : [{ name: "", relation: "", pramanpatradharak: false }] };
    });
};

/**
 * Resets the form to initial state while preserving some fields
 */
export const resetForm = (
    setFormData: React.Dispatch<React.SetStateAction<FormState>>,
    prevFormData: FormState
) => {
    setFormData({
        ...initialFormState,
        pramanpatra_id: prevFormData.pramanpatra_id,  // Preserve ID
        updated_by: prevFormData.updated_by,          // Preserve updated_by
    });
};

/**
 * Generates and downloads the Nav Hastantaran certificate
 */
export const downloadNavHastantaranCertificate = async (
    dataForDownload: FormState,
    junaDharak: string | null
) => {
    const prakalp_grast_nav = dataForDownload.prakalp_grast_nav.replace(/\s+/g, "_");
    const blob = await Packer.toBlob(NavHastantaran(dataForDownload, junaDharak));
    const certificate_name = prakalp_grast_nav + `_नाव_हस्तांतरण.docx`;

    if (blob) {
        saveAs(blob, certificate_name);
    } else {
        console.error("Blob is undefined, cannot save the file.");
    }
};

/**
 * Generates and downloads the Duyam Nav Hastantaran certificate
 */
export const downloadDuyamNavHastantaranCertificate = async (
    dataForDownload: FormState,
    junaDharak: string | null
) => {
    const prakalp_grast_nav = dataForDownload.prakalp_grast_nav.replace(/\s+/g, "_");
    const blob = await Packer.toBlob(DuyamNavHastantaran(dataForDownload, junaDharak));
    const certificate_name = prakalp_grast_nav + `_दुय्यम_प्रतीत_नाव_हस्तांतरण.docx`;

    if (blob) {
        saveAs(blob, certificate_name);
    } else {
        console.error("Blob is undefined, cannot save the file.");
    }
};

/**
 * Handles form submission to save a new certificate
 */
export const handleSubmit = async (
    e: React.FormEvent,
    { formData, setFormData, onClose, API_URL, onSuccess, onError }: CertificateHandlerDependencies
) => {
    e.preventDefault();
    try {
        const response = await fetch(API_URL + '/admin/savePramanpatra', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
            body: JSON.stringify(formData),
        });
        if (!response.ok) {
            throw new Error('Failed to add certificate');
        }
        // Reset form after successful submission
        setFormData(initialFormState);
        // Show success message
        handleSuccess('प्रमाणपत्र जतन झाला.');

        // Call success callback if provided
        if (onSuccess) {
            onSuccess();
        } else {
            onClose();
        }
    } catch (error) {
        console.error('Error:', error);
        handleError('प्रमाणपत्र जतन झाला नाही.');

        // Call error callback if provided
        if (onError) {
            onError();
        }
    }
};

/**
 * Handles updating an existing certificate
 */
export const handleUpdate = async (
    event: React.FormEvent,
    { formData, setFormData, onClose, API_URL, onSuccess, onError }: CertificateHandlerDependencies
) => {
    event.preventDefault();

    try {
        const response = await fetch(API_URL + '/admin/updateCertificate', {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
            body: JSON.stringify(formData),
        });
        if (!response.ok) {
            throw new Error('Failed to update certificate');
        }

        // Reset form after successful submission
        setFormData(initialFormState);

        // Show success message
        handleSuccess('Certificate updated successfully!');

        // Call success callback if provided
        if (onSuccess) {
            onSuccess();
        } else {
            onClose();
        }
    } catch (error) {
        console.error("Error updating certificate:", error);
        handleError("Failed to update certificate.");

        // Call error callback if provided
        if (onError) {
            onError();
        }
    }
};

/**
 * Handles certificate holder selection
 */
export const handleCertificateSelection = (
    index: number,
    { isEditMode, formData, duplicateNavHastantaran, setJunaDharak, setNavinDharak, setSelectedIndex, setConfirmOpen, setFormData, showAlert }: CertificateHandlerDependencies,
    setFormDataCallback: (index: number, setFormData: React.Dispatch<React.SetStateAction<FormState>>) => void
) => {
    if (!isEditMode) {
        setFormDataCallback(index, setFormData);
    } else {
        if (duplicateNavHastantaran === 3 && formData.hastantaran_reason === "") {
            if (showAlert) {
                showAlert("सूचना", "कृपया नाव हस्तांतरण प्रमाणपत्राचे कारण भरा.");
            } else {
                alert("कृपया नाव हस्तांतरण प्रमाणपत्राचे कारण भरा.");
            }
            return;
        } else {
            const dharak = formData.familymembers.find(m => m.pramanpatradharak);
            const navin = formData.familymembers[index];

            setJunaDharak(dharak ? `${dharak.name} (${dharak.relation})` : "सध्याचा धारक");
            setNavinDharak(navin ? `${navin.name} (${navin.relation})` : "नवीन धारक");

            setSelectedIndex(index);
            setConfirmOpen(true);
        }
    }
};

/**
 * Confirms the certificate holder selection and generates the certificate
 */
export const confirmSelection = async (
    selectedIndex: number | null,
    { formData, setFormData, duplicateNavHastantaran, junaDharak, setConfirmOpen, setSelectedIndex }: CertificateHandlerDependencies
) => {
    if (selectedIndex === null) return;

    const updatedData = {
        ...formData,
        familymembers: formData.familymembers.map((member, i) => ({
            ...member,
            pramanpatradharak: i === selectedIndex,
        }))
    };

    setFormData(updatedData);
    if (duplicateNavHastantaran === 3) {
        downloadDuyamNavHastantaranCertificate(updatedData, junaDharak);
    } else {
        downloadNavHastantaranCertificate(updatedData, junaDharak);
    }
    setConfirmOpen(false);
    setSelectedIndex(null);
};