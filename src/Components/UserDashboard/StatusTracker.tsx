import React from 'react';
import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    Schedule as ScheduleIcon,
    Error as ErrorIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import { Certificate } from './types';

interface StatusTrackerProps {
    certificate: Certificate;
}

const StatusTracker: React.FC<StatusTrackerProps> = ({ certificate }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'submitted':
                return {
                    label: 'प्रतीक्षित अर्ज',
                    color: '#2196f3',
                    icon: <AssignmentIcon />,
                    description: 'आपला अर्ज सबमिट झाला आहे'
                };
            case 'under_review':
                return {
                    label: 'प्रक्रियेत',
                    color: '#ff9800',
                    icon: <ScheduleIcon />,
                    description: 'आपला अर्ज प्रक्रियेत आहे'
                };
            case 'partially_verified':
                return {
                    label: 'आंशिक पडताळणी',
                    color: '#9c27b0',
                    icon: <PendingIcon />,
                    description: 'काही सुधारणा आवश्यक आहेत'
                };
            case 'approved':
                return {
                    label: 'मंजूर',
                    color: '#4caf50',
                    icon: <CheckCircleIcon />,
                    description: 'आपला अर्ज मंजूर झाला आहे'
                };
            case 'rejected':
                return {
                    label: 'नाकारले',
                    color: '#f44336',
                    icon: <ErrorIcon />,
                    description: 'आपला अर्ज नाकारण्यात आला आहे'
                };
            default:
                return {
                    label: 'अज्ञात स्थिती',
                    color: '#666',
                    icon: <PendingIcon />,
                    description: 'स्थिती अज्ञात आहे'
                };
        }
    };

    const getProgressValue = (status: string) => {
        switch (status) {
            case 'submitted': return 25;
            case 'under_review': return 50;
            case 'partially_verified': return 75;
            case 'approved': return 100;
            case 'rejected': return 100;
            default: return 0;
        }
    };

    const statusConfig = getStatusConfig(certificate.status);
    const progressValue = getProgressValue(certificate.status);

    // Get the latest comment from historyComments for under_review status
    const getLatestComment = () => {
        if (certificate.status === 'under_review' && certificate.historyComments && certificate.historyComments.length > 0) {
            // Find the latest comment with notes
            const latestComment = certificate.historyComments
                .filter(comment => comment.notes)
                .sort((a, b) => new Date(b.changed_dt).getTime() - new Date(a.changed_dt).getTime())[0];

            return latestComment?.notes || null;
        }
        return certificate.comments;
    };

    const latestComment = getLatestComment();

    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                    icon={statusConfig.icon}
                    label={statusConfig.label}
                    sx={{
                        backgroundColor: statusConfig.color,
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        '& .MuiChip-icon': {
                            color: 'white'
                        }
                    }}
                />
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 2, fontStyle: 'italic' }}
                >
                    {statusConfig.description}
                </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
                <LinearProgress
                    variant="determinate"
                    value={progressValue}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: statusConfig.color,
                            borderRadius: 4
                        }
                    }}
                />
            </Box>
            {latestComment && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>टिप्पणी:</strong> {latestComment}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default StatusTracker; 