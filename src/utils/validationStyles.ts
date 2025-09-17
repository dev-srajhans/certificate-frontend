// Bootstrap-like validation styles for Material-UI components
export const getValidationStyles = (isRequired: boolean = false, hasValue: boolean = false, hasError: boolean = false) => ({
    "& .MuiOutlinedInput-root": {
        // Default state - green if not required, blue if required but empty
        "& fieldset": {
            borderColor: isRequired ? (hasValue ? "#2e7d32" : "#1976d2") : "#2e7d32",
        },
        // Hover state - always blue
        "&:hover fieldset": {
            borderColor: "#1976d2",
        },
        // Focus state - blue if no error, red if error
        "&.Mui-focused fieldset": {
            borderColor: hasError ? "#d32f2f" : "#1976d2",
        },
        // Error state - always red
        "&.Mui-error fieldset": {
            borderColor: "#d32f2f",
        },
        "&.Mui-error:hover fieldset": {
            borderColor: "#d32f2f",
        },
    },
    // Label colors
    "& .MuiInputLabel-root": {
        color: hasError ? "#d32f2f" : hasValue ? "#2e7d32" : "#666",
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: hasError ? "#d32f2f" : "#1976d2",
    },
    "& .MuiInputLabel-root.Mui-error": {
        color: "#d32f2f",
    },
    // Select and Autocomplete specific styles
    "& .MuiSelect-select, & .MuiAutocomplete-input": {
        "&:focus": {
            backgroundColor: "transparent",
        },
    },
});

// Helper function to check if field has value
export const hasValue = (value: string | number | null | undefined): boolean => {
    if (typeof value === 'string') return value?.trim().length > 0;
    if (typeof value === 'number') return value > 0;
    return false;
};

// Helper function to get validation state for a field
export const getFieldValidationState = (
    value: string | number | null | undefined,
    isRequired: boolean = false,
    customError?: boolean
): { hasValue: boolean; hasError: boolean } => {
    const hasValueResult = hasValue(value);
    const hasError = customError !== undefined ? customError : (isRequired && !hasValueResult);

    return {
        hasValue: hasValueResult,
        hasError
    };
};

// Helper function to get complete validation styles for a field
export const getFieldStyles = (
    value: string | number | null | undefined,
    isRequired: boolean = false,
    customError?: boolean
) => {
    const { hasValue: hasValueResult, hasError } = getFieldValidationState(value, isRequired, customError);
    return getValidationStyles(isRequired, hasValueResult, hasError);
}; 