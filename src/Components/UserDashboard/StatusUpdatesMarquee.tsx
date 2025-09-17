import React, { useEffect, useRef, useMemo } from 'react';
import {
    Box,
    Typography,
    Chip,
    Avatar,
    Button,
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    CheckCircle as CheckCircleIcon,
    Pending as PendingIcon,
    Error as ErrorIcon,
    Schedule as ScheduleIcon,
    Assignment as AssignmentIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ApplicationStatusUpdate } from '../../types';
import { getMarathiStatus } from '../../utils/statusUtils';

interface StatusUpdatesMarqueeProps {
    updates: ApplicationStatusUpdate[];
    loading?: boolean;
    onRefresh?: () => void;
}

const StatusUpdatesMarquee: React.FC<StatusUpdatesMarqueeProps> = ({ updates, loading = false, onRefresh }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Ensure updates is always an array
    const safeUpdates = useMemo(() => Array.isArray(updates) ? updates : [], [updates]);

    // Auto-scroll effect
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || safeUpdates.length === 0) return;

        const startAutoScroll = () => {
            scrollIntervalRef.current = setInterval(() => {
                if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
                    // Reset to top when reaching bottom
                    container.scrollTop = 0;
                } else {
                    container.scrollTop += 1;
                }
            }, 50); // Scroll speed - adjust as needed
        };

        const stopAutoScroll = () => {
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
            }
        };

        // Start auto-scroll
        startAutoScroll();

        // Cleanup on unmount
        return () => stopAutoScroll();
    }, [safeUpdates]);

    // Handle hover events
    const handleMouseEnter = () => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
        }
    };

    const handleMouseLeave = () => {
        if (safeUpdates.length > 0) {
            scrollIntervalRef.current = setInterval(() => {
                const container = scrollContainerRef.current;
                if (container) {
                    if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
                        container.scrollTop = 0;
                    } else {
                        container.scrollTop += 1;
                    }
                }
            }, 50);
        }
    };

    // Get status icon based on status
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: '1.2rem' }} />;
            case 'under_review':
                return <PendingIcon sx={{ color: '#ff9800', fontSize: '1.2rem' }} />;
            case 'rejected':
                return <ErrorIcon sx={{ color: '#f44336', fontSize: '1.2rem' }} />;
            case 'submitted':
                return <AssignmentIcon sx={{ color: '#2196f3', fontSize: '1.2rem' }} />;
            case 'draft':
                return <ScheduleIcon sx={{ color: '#9e9e9e', fontSize: '1.2rem' }} />;
            default:
                return <NotificationsIcon sx={{ color: '#666', fontSize: '1.2rem' }} />;
        }
    };

    // Format date to relative time
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'आत्ताच';
        if (diffInMinutes < 60) return `${diffInMinutes} मिनिटांपूर्वी`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} तासांपूर्वी`;
        return `${Math.floor(diffInMinutes / 1440)} दिवसांपूर्वी`;
    };

    // Get status badge color
    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'approved':
                return { bgcolor: '#e8f5e8', color: '#2e7d32', border: '1px solid #4caf50' };
            case 'under_review':
                return { bgcolor: '#fff3e0', color: '#f57c00', border: '1px solid #ff9800' };
            case 'rejected':
                return { bgcolor: '#ffebee', color: '#c62828', border: '1px solid #f44336' };
            case 'submitted':
                return { bgcolor: '#e3f2fd', color: '#1565c0', border: '1px solid #2196f3' };
            case 'draft':
                return { bgcolor: '#f5f5f5', color: '#616161', border: '1px solid #9e9e9e' };
            default:
                return { bgcolor: '#f5f5f5', color: '#616161', border: '1px solid #9e9e9e' };
        }
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                py: 2,
                px: 3,
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <NotificationsIcon sx={{ mr: 2, color: '#1976d2', animation: 'pulse 1.5s infinite' }} />
                <Typography variant="body1" color="textSecondary">
                    अपडेट्स लोड करत आहे...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            position: 'relative',
            borderRadius: 2,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
        }}>
            {/* Header with Refresh Button */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                bgcolor: 'rgba(255, 255, 255, 0.5)'
            }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1a5276' }}>
                    ताजी अपडेट्स ({safeUpdates.length})
                </Typography>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={onRefresh}
                    disabled={loading}
                    size="small"
                    sx={{
                        color: '#1976d2',
                        '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' },
                        '&:disabled': { color: '#ccc' }
                    }}
                >
                    रिफ्रेश
                </Button>
            </Box>

            {/* Updates Container */}
            <Box
                ref={scrollContainerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                sx={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '6px'
                    },
                    '&::-webkit-scrollbar-track': {
                        bgcolor: 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '3px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                        bgcolor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '3px',
                        '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }}
            >
                {safeUpdates.length === 0 ? (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 4,
                        px: 3
                    }}>
                        <NotificationsIcon sx={{ mr: 2, color: '#9e9e9e' }} />
                        <Typography variant="body1" color="textSecondary">
                            कोणतेही अपडेट्स नाहीत
                        </Typography>
                    </Box>
                ) : (
                    safeUpdates.map((update, index) => (
                        <Box
                            key={update.id}
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                p: 2,
                                borderBottom: index < safeUpdates.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.5)'
                                }
                            }}
                        >
                            {/* Status Icon */}
                            <Avatar sx={{
                                width: 40,
                                height: 40,
                                mr: 2,
                                mt: 0.5,
                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                border: '2px solid rgba(255, 255, 255, 0.3)'
                            }}>
                                {getStatusIcon(update.status)}
                            </Avatar>

                            {/* Update Content */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                {/* Application Type and Status */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                                    <Typography variant="subtitle2" sx={{
                                        fontWeight: 600,
                                        color: '#1a5276',
                                        mr: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {update.applicationType}
                                    </Typography>
                                    <Chip
                                        label={getMarathiStatus(update.status)}
                                        size="small"
                                        sx={{
                                            ...getStatusBadgeColor(update.status),
                                            fontSize: '0.7rem',
                                            height: '20px'
                                        }}
                                    />
                                </Box>

                                {/* Status Message */}
                                <Typography variant="body2" sx={{
                                    color: '#555',
                                    mb: 1,
                                    lineHeight: 1.4
                                }}>
                                    {update.statusMessage}
                                </Typography>

                                {/* Time and Application ID */}
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                    <Typography variant="caption" sx={{
                                        color: '#888',
                                        fontSize: '0.7rem'
                                    }}>
                                        {formatRelativeTime(update.updatedAt)}
                                    </Typography>
                                    <Typography variant="caption" sx={{
                                        color: '#888',
                                        fontSize: '0.7rem',
                                        fontFamily: 'monospace'
                                    }}>
                                        {update.applicationId}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Priority Indicator */}
                            {update.priority <= 2 && (
                                <Box sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: update.priority === 1 ? '#f44336' : '#ff9800',
                                    animation: 'pulse 2s infinite',
                                    ml: 1,
                                    mt: 1
                                }} />
                            )}
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default StatusUpdatesMarquee; 