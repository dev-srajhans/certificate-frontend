import React from 'react';
import { Card, CardContent, CardActions, Typography, Chip, Button, Box } from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
    Assignment as AssignmentIcon,
    Schedule as ScheduleIcon,
    Pending as PendingIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { Certificate } from './types';
import StatusTracker from './StatusTracker';

interface CertificateCardProps {
    certificate: Certificate;
    onViewDetails: (certificate: Certificate) => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, onViewDetails }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'submitted':
                return {
                    label: 'प्रतीक्षित अर्ज',
                    color: '#2196f3',
                    icon: <AssignmentIcon />
                };
            case 'draft':
                return {
                    label: 'मसुदा',
                    color: '#666',
                    icon: <AssignmentIcon />
                };
            case 'under_review':
                return {
                    label: 'प्रक्रियेत',
                    color: '#ff9800',
                    icon: <ScheduleIcon />
                };
            case 'partially_verified':
                return {
                    label: 'आंशिक पडताळणी',
                    color: '#9c27b0',
                    icon: <PendingIcon />
                };
            case 'approved':
                return {
                    label: 'मंजूर',
                    color: '#4caf50',
                    icon: <CheckCircleIcon />
                };
            case 'rejected':
                return {
                    label: 'नाकारले',
                    color: '#f44336',
                    icon: <ErrorIcon />
                };
            default:
                return {
                    label: 'अज्ञात',
                    color: '#666',
                    icon: <PendingIcon />
                };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('hi-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const statusConfig = getStatusConfig(certificate.status);

    return (
        <Card sx={{
            height: '100%',
            borderRadius: { xs: 2, sm: 3, md: 3 },
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0',
            '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.3s ease'
            },
            transition: 'all 0.3s ease'
        }}>
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                {/* Header with application number and status */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: { xs: 2, sm: 2.5, md: 3 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                }}>
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 700,
                                color: '#1A5276',
                                fontSize: { xs: '1rem', sm: '1.05rem', md: '1.1rem' },
                                lineHeight: 1.3,
                                mb: 0.5
                            }}
                        >
                            {certificate.type}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#666',
                                fontWeight: 500,
                                fontSize: { xs: '0.8rem', sm: '0.85rem', md: '0.9rem' }
                            }}
                        >
                            {certificate.applicationNumber}
                        </Typography>
                    </Box>
                    <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        sx={{
                            backgroundColor: statusConfig.color,
                            color: 'white',
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                            height: { xs: 24, sm: 28, md: 32 },
                            '& .MuiChip-icon': {
                                color: 'white',
                                fontSize: { xs: 16, sm: 18, md: 20 }
                            }
                        }}
                    />
                </Box>

                {/* Project Information */}
                {certificate.projectName && (
                    <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: '#2c3e50',
                                fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' },
                                mb: 0.5
                            }}
                        >
                            प्रकल्प: {certificate.projectName}
                        </Typography>
                    </Box>
                )}

                {/* Description */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: { xs: 2, sm: 2.5, md: 3 },
                        lineHeight: 1.5,
                        fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' }
                    }}
                >
                    {certificate.description}
                </Typography>

                {/* History Timeline */}
                {certificate.historyComments && certificate.historyComments.length > 0 && (
                    <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 } }}>
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: '#2c3e50',
                                mb: 1.5,
                                fontSize: { xs: '0.875rem', sm: '0.9rem', md: '0.95rem' }
                            }}
                        >
                            प्रगती इतिहास
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                            {certificate.historyComments.slice().reverse().map((comment, index) => {
                                const commentStatusConfig = getStatusConfig(comment.status);
                                return (
                                    <Box key={index} sx={{ position: 'relative', mb: 2 }}>
                                        {/* Timeline dot and line */}
                                        <Box sx={{
                                            position: 'absolute',
                                            left: -8,
                                            top: 4,
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            backgroundColor: commentStatusConfig.color,
                                            border: '2px solid white',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            zIndex: 1
                                        }} />
                                        {index < certificate.historyComments.length - 1 && (
                                            <Box sx={{
                                                position: 'absolute',
                                                left: -2,
                                                top: 16,
                                                width: 2,
                                                height: 'calc(100% + 8px)',
                                                backgroundColor: '#e0e0e0'
                                            }} />
                                        )}

                                        {/* Content */}
                                        <Box sx={{ pl: 2 }}>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: commentStatusConfig.color,
                                                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                                                    display: 'block',
                                                    mb: 0.5
                                                }}
                                            >
                                                {commentStatusConfig.label}
                                            </Typography>
                                            {comment.notes && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                                                        mb: 0.5,
                                                        lineHeight: 1.4
                                                    }}
                                                >
                                                    {comment.notes}
                                                </Typography>
                                            )}
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: 'block',
                                                    fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' }
                                                }}
                                            >
                                                {formatDate(comment.changed_dt)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                )}

                {/* Status Tracker */}
                <StatusTracker certificate={certificate} />

                {/* Footer with dates and priority */}
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: { xs: 1.5, sm: 2, md: 2 },
                    pt: { xs: 1.5, sm: 2, md: 2 },
                    borderTop: '1px solid #f0f0f0',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            अर्ज तारीख: {certificate.appliedDate}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>

            <CardActions sx={{
                justifyContent: 'space-between',
                pt: 0,
                flexDirection: { xs: 'column', sm: 'row' },

            }}>
                <Button
                    size="medium"
                    onClick={() => onViewDetails(certificate)}
                    startIcon={<VisibilityIcon />}
                    sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: 2,
                        px: { xs: 2, sm: 2.5, md: 3 },
                        fontSize: { xs: '0.875rem', sm: '1rem', md: '1rem' },
                        minHeight: { xs: 36, sm: 40, md: 44 }
                    }}
                >
                    तपशील पहा
                </Button>
                {certificate.status === 'approved' && (
                    <Button
                        size="medium"
                        startIcon={<DownloadIcon />}
                        variant="contained"
                        sx={{
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 2,
                            px: { xs: 2, sm: 2.5, md: 3 },
                            fontSize: { xs: '0.875rem', sm: '1rem', md: '1rem' },
                            minHeight: { xs: 36, sm: 40, md: 44 },
                            backgroundColor: '#4caf50',
                            '&:hover': {
                                backgroundColor: '#388e3c'
                            }
                        }}
                    >
                        डाउनलोड
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};

export default CertificateCard; 