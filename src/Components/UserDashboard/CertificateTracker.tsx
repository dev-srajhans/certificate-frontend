import React, { useState, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Grid,
} from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Schedule as ScheduleIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { Certificate } from './types';

interface CertificateTrackerProps {
    certificates: Certificate[];
}

const CertificateTracker: React.FC<CertificateTrackerProps> = ({ certificates }) => {
    const [selectedCertificateId, setSelectedCertificateId] = useState<string>('');
    const [showCommentAlert, setShowCommentAlert] = useState(true);

    // Get the most recent certificate by default
    const defaultCertificate = useMemo(() => {
        if (certificates.length === 0) return null;

        const sortedCertificates = [...certificates].sort((a, b) =>
            new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
        );

        return sortedCertificates[0];
    }, [certificates]);

    // Set default selected certificate
    React.useEffect(() => {
        if (defaultCertificate && !selectedCertificateId) {
            setSelectedCertificateId(defaultCertificate.id);
        }
    }, [defaultCertificate, selectedCertificateId]);

    const selectedCertificate = certificates.find(cert => cert.id === selectedCertificateId) || defaultCertificate;

    const getSteps = (certificate: Certificate) => {
        const steps = [
            {
                label: 'प्रतीक्षित अर्ज',
                description: 'आपला अर्ज सबमिट झाला आहे',
                icon: <AssignmentIcon />,
                color: '#2196f3',
                completed: ['submitted', 'under_review', 'partially_verified', 'approved', 'rejected'].includes(certificate.status),
                active: certificate.status === 'submitted'
            },
            {
                label: 'प्रक्रियेत',
                description: 'आपला अर्ज प्रक्रियेत आहे',
                icon: <ScheduleIcon />,
                color: '#ff9800',
                completed: ['under_review', 'partially_verified', 'approved', 'rejected'].includes(certificate.status),
                active: certificate.status === 'under_review'
            },
            {
                label: 'मंजूर',
                description: 'आपला अर्ज मंजूर झाला आहे',
                icon: <CheckCircleIcon />,
                color: '#4caf50',
                completed: ['approved'].includes(certificate.status),
                active: certificate.status === 'approved'
            }
        ];

        // Add rejected step if certificate is rejected
        if (certificate.status === 'rejected') {
            steps.push({
                label: 'नाकारले',
                description: 'आपला अर्ज नाकारण्यात आला आहे',
                icon: <ErrorIcon />,
                color: '#f44336',
                completed: true,
                active: true
            });
        }

        return steps;
    };

    const getLatestComment = (certificate: Certificate) => {
        if (certificate.status === 'under_review' && certificate.historyComments && certificate.historyComments.length > 0) {
            const latestComment = certificate.historyComments
                .filter(comment => comment.notes)
                .sort((a, b) => new Date(b.changed_dt).getTime() - new Date(a.changed_dt).getTime())[0];

            return latestComment?.notes || null;
        }
        return certificate.comments;
    };

    if (!selectedCertificate) {
        return (
            <Card sx={{
                borderRadius: 2,
                marginBottom: 2,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
                        कोणतेही प्रमाणपत्र उपलब्ध नाही
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, opacity: 0.7 }}>
                        नवीन प्रमाणपत्र अर्ज करा
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const steps = getSteps(selectedCertificate);
    const latestComment = getLatestComment(selectedCertificate);

    return (
        <Card sx={{
            bgcolor: '#ffffff',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            marginBottom: 2,
            marginTop: 2
        }}>
            {/* Info Alert for Recent Comment */}
            {latestComment && showCommentAlert && (
                <Box sx={{
                    bgcolor: '#e3f2fd',
                    borderBottom: '1px solid #bbdefb',
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{
                            fontWeight: 600,
                            mb: 0.5,
                            color: '#1976d2',
                            fontSize: '0.875rem'
                        }}>
                            नवीनतम टिप्पणी
                        </Typography>
                        <Typography variant="body2" sx={{
                            lineHeight: 1.5,
                            color: '#1976d2',
                            opacity: 0.9
                        }}>
                            {latestComment}
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => setShowCommentAlert(false)}
                        sx={{
                            color: '#1976d2',
                            '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' }
                        }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}

            {/* Main Content Grid */}
            <Grid container>
                {/* Certificate Selection Sidebar - 20% on desktop */}
                <Grid item xs={12} md={3} sx={{
                    bgcolor: '#fafafa',
                    borderRight: { md: '1px solid #e0e0e0' }
                }}>
                    <Box sx={{ p: 4 }}>
                        {/* Certificate Selection */}
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: '#666', fontSize: '0.875rem' }}>
                                प्रमाणपत्र ट्रॅक करा
                            </InputLabel>
                            <Select
                                value={selectedCertificateId}
                                onChange={(e) => setSelectedCertificateId(e.target.value)}
                                label="प्रमाणपत्र ट्रॅक करा"
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#ddd',
                                        borderRadius: 1
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#2196f3'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#2196f3'
                                    }
                                }}
                            >
                                {certificates.map((cert) => (
                                    <MenuItem key={cert.id} value={cert.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {cert.applicationNumber}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>

                {/* Certificate Tracking Content - 80% on desktop */}
                <Grid item xs={12} md={9}>
                    <Box sx={{ p: 4 }}>
                        {/* Status Timeline */}
                        <Stepper
                            orientation="horizontal"
                        >
                            {steps.map((step, index) => (
                                <Step key={index} completed={step.completed} active={step.active}>
                                    <StepLabel
                                        StepIconComponent={() => (
                                            <Box sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: step.completed ? step.color : '#f5f5f5',
                                                color: step.completed ? 'white' : '#999',
                                                border: step.active ? `2px solid ${step.color}` : 'none',
                                                boxShadow: step.active ? `0 0 0 6px ${step.color}15` : 'none',
                                                transition: 'all 0.2s ease'
                                            }}>
                                                {step.icon}
                                            </Box>
                                        )}
                                        sx={{
                                            '& .MuiStepLabel-label': {
                                                fontSize: '0.875rem',
                                                fontWeight: step.active ? 600 : 400,
                                                color: step.active ? step.color : '#666',
                                            }
                                        }}
                                    >
                                        {step.label}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>
                </Grid>
            </Grid>
        </Card>
    );
};

export default CertificateTracker; 