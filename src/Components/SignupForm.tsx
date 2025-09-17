import { useState, ChangeEvent, FormEvent } from "react";
import {
    Box,
    TextField,
    Button,
    CircularProgress,
    Grid,
    InputAdornment,
    IconButton
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { handleError, handleSuccess } from "../utils";

const API_URL = import.meta.env.VITE_API_URL;

// Define API response structure
interface SignupResponse {
    success: boolean;
    message?: string;
    error?: { details?: { message: string }[] };
}

// Form validation interface
interface FormErrors {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
}

// Form data interface
interface FormData {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

interface SignupFormProps {
    isAdminMode?: boolean;
    onSuccess?: () => void;
    onCancel?: () => void;
}

function SignupForm({ isAdminMode = false, onSuccess, onCancel }: SignupFormProps) {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation functions
    const validateName = (name: string, fieldName: string): string => {
        if (!name.trim()) {
            return `${fieldName} आवश्यक आहे`;
        }
        if (name.trim() !== name) {
            return `${fieldName} मध्ये सुरुवातीला किंवा शेवटी स्पेस असू शकत नाही`;
        }
        if (name.includes(' ')) {
            return `${fieldName} मध्ये स्पेस असू शकत नाही`;
        }
        if (name.length < 2) {
            return `${fieldName} किमान 2 अक्षरे असणे आवश्यक आहे`;
        }
        return '';
    };

    const validateEmail = (email: string): string => {
        if (!email.trim()) {
            return 'ईमेल आवश्यक आहे';
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'वैध ईमेल पत्ता प्रविष्ट करा';
        }
        return '';
    };

    const validatePhone = (phone: string): string => {
        if (!phone.trim()) {
            return 'फोन नंबर आवश्यक आहे';
        }
        return '';
    };

    const validatePassword = (password: string): string => {
        if (!password) {
            return 'पासवर्ड आवश्यक आहे';
        }
        if (password.length < 8) {
            return 'पासवर्ड किमान 8 अक्षरे असणे आवश्यक आहे';
        }
        if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
            return 'पासवर्ड मध्ये अक्षरे आणि संख्या दोन्ही असणे आवश्यक आहे';
        }
        return '';
    };

    const validateConfirmPassword = (confirmPassword: string, password: string): string => {
        if (!confirmPassword) {
            return 'पासवर्ड पुष्टीकरण आवश्यक आहे';
        }
        if (confirmPassword !== password) {
            return 'पासवर्ड जुळत नाहीत';
        }
        return '';
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        newErrors.firstName = validateName(formData.firstName, 'पहिले नाव');
        newErrors.middleName = formData.middleName ? validateName(formData.middleName, 'मधले नाव') : '';
        newErrors.lastName = validateName(formData.lastName, 'आडनाव');
        newErrors.email = validateEmail(formData.email);
        newErrors.phone = validatePhone(formData.phone);
        newErrors.password = validatePassword(formData.password);
        newErrors.confirmPassword = validateConfirmPassword(formData.confirmPassword, formData.password);

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSignup = async (formData: FormData) => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const endpoint = isAdminMode ? "/auth/admin/create-user/" : "/auth/signup/";
            const response = await fetch(API_URL + endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: formData.firstName.trim(),
                    middleName: formData.middleName.trim(),
                    lastName: formData.lastName.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    password: formData.password
                }),
            });

            const result: SignupResponse = await response.json();

            if (result.success) {
                const successMessage = isAdminMode
                    ? "वापरकर्ता यशस्वीरित्या तयार केला गेला!"
                    : "नोंदणी यशस्वी! कृपया लॉगिन करा.";
                handleSuccess(result.message || successMessage);

                if (onSuccess) {
                    onSuccess();
                }
            } else {
                const errorMsg = result.error?.details?.[0]?.message || result.message || "नोंदणी अयशस्वी";
                handleError(errorMsg);
            }
        } catch (err) {
            handleError(String(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isLoading) {
            handleSignup(formData);
        }
    };

    return (
        <Box sx={{ bgcolor: 'white', px: 3, py: 3 }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    {/* First Name */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            required
                            fullWidth
                            id="firstName"
                            label="पहिले नाव"
                            name="firstName"
                            autoComplete="given-name"
                            size="small"
                            value={formData.firstName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value)}
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 12px rgba(26, 82, 118, 0.15)'
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {/* Middle Name */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            id="middleName"
                            label="मधले नाव (पर्यायी)"
                            name="middleName"
                            autoComplete="additional-name"
                            size="small"
                            value={formData.middleName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('middleName', e.target.value)}
                            error={!!errors.middleName}
                            helperText={errors.middleName}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 12px rgba(26, 82, 118, 0.15)'
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {/* Last Name */}
                    <Grid item xs={12} sm={4}>
                        <TextField
                            required
                            fullWidth
                            id="lastName"
                            label="आडनाव"
                            name="lastName"
                            autoComplete="family-name"
                            size="small"
                            value={formData.lastName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value)}
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 12px rgba(26, 82, 118, 0.15)'
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            id="email"
                            label="ईमेल पत्ता"
                            name="email"
                            type="email"
                            autoComplete="email"
                            size="small"
                            value={formData.email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                            error={!!errors.email}
                            helperText={errors.email}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 12px rgba(26, 82, 118, 0.15)'
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {/* Phone */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            id="phone"
                            label="फोन नंबर"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            size="small"
                            value={formData.phone}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
                            error={!!errors.phone}
                            helperText={errors.phone}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 12px rgba(26, 82, 118, 0.15)'
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {/* Password */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            name="password"
                            label="पासवर्ड"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="new-password"
                            size="small"
                            value={formData.password}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            } as React.ComponentProps<typeof TextField>['InputProps']}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 12px rgba(26, 82, 118, 0.15)'
                                    }
                                }
                            }}
                        />
                    </Grid>

                    {/* Confirm Password */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            name="confirmPassword"
                            label="पासवर्ड पुष्टीकरण"
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            autoComplete="new-password"
                            size="small"
                            value={formData.confirmPassword}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('confirmPassword', e.target.value)}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle confirm password visibility"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            } as React.ComponentProps<typeof TextField>['InputProps']}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 12px rgba(26, 82, 118, 0.15)'
                                    }
                                }
                            }}
                        />
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isLoading}
                        sx={{
                            py: 1.2,
                            bgcolor: '#1a5276',
                            background: 'linear-gradient(135deg, #1a5276 0%, #2874a6 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #154a6a 0%, #216a96 100%)',
                                boxShadow: '0 6px 12px rgba(26, 82, 118, 0.25)'
                            },
                            '&:disabled': {
                                background: 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)',
                                color: 'rgba(255, 255, 255, 0.7)'
                            },
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        {isLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={20} sx={{ color: 'white' }} />
                                <span>{isAdminMode ? 'वापरकर्ता तयार करत आहे...' : 'खाते तयार करत आहे...'}</span>
                            </Box>
                        ) : (
                            isAdminMode ? 'वापरकर्ता तयार करा' : 'खाते तयार करा'
                        )}
                    </Button>

                    {isAdminMode && onCancel && (
                        <Button
                            variant="outlined"
                            onClick={onCancel}
                            disabled={isLoading}
                            sx={{
                                py: 1.2,
                                borderColor: '#1a5276',
                                color: '#1a5276',
                                '&:hover': {
                                    borderColor: '#154a6a',
                                    backgroundColor: 'rgba(26, 82, 118, 0.04)'
                                },
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                letterSpacing: '0.5px',
                                transition: 'all 0.2s ease-in-out'
                            }}
                        >
                            रद्द करा
                        </Button>
                    )}
                </Box>
            </form>
        </Box>
    );
}

export default SignupForm; 