import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Button,
    Grid,
    Card,
    CardContent,
    Avatar,
    Divider,
    Fab,
    Tooltip
} from '@mui/material';
import Header from '../Shared/Header';
import { QuickActionsCard } from '../Shared';
import { Add as AddIcon } from '@mui/icons-material';
import TabNavigation from './TabNavigation';
import CertificateCard from './CertificateCard';
import ApplyCertificateDialog from './ApplyCertificateDialog';
import { Certificate } from './types';
import { ApplicationStatusUpdate } from '../../types';
import { fetchApplicationStatusUpdates, fetchUserCertificateApplications } from '../../api/certificateApi';
import StatusUpdatesMarquee from './StatusUpdatesMarquee';
import { getMarathiStatus } from '../../utils/statusUtils';
import CertificateTracker from './CertificateTracker';

interface UserDashboardProps {
    setIsAuthenticated: (auth: boolean) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ setIsAuthenticated }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [openApplyDialog, setOpenApplyDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editingCertificateId, setEditingCertificateId] = useState<string | undefined>();
    const [statusUpdates, setStatusUpdates] = useState<ApplicationStatusUpdate[]>([]);
    const [loadingStatusUpdates, setLoadingStatusUpdates] = useState(false);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loadingCertificates, setLoadingCertificates] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger state

    // Get user data from sessionStorage
    const userName = sessionStorage.getItem("loggedInUser") || "Unknown User";
    const userEmail = sessionStorage.getItem("User_Email") || "No email available";
    const userId = sessionStorage.getItem("User_id") || "No ID available";

    const handleApplyCertificate = () => {
        setEditMode(false);
        setEditingCertificateId(undefined);
        setOpenApplyDialog(true);
    };

    const handleViewCertificate = (certificate: Certificate) => {
        // Open dialog in edit mode with certificate data
        setEditMode(true);
        setEditingCertificateId(certificate.id);
        setOpenApplyDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenApplyDialog(false);
        setEditMode(false);
        setEditingCertificateId(undefined);
    };


    // Load status updates function
    const loadStatusUpdates = async () => {
        setLoadingStatusUpdates(true);
        try {
            const result = await fetchApplicationStatusUpdates();

            if (result.success && result.data) {
                setStatusUpdates(result.data);
            } else {
                console.error('Error loading status updates:', result.error);
                setStatusUpdates([]); // Set empty array on error
            }
        } catch (error) {
            console.error('Error loading status updates:', error);
            setStatusUpdates([]); // Set empty array on error
        } finally {
            setLoadingStatusUpdates(false);
        }
    };

    // Load certificates function
    const loadCertificates = async () => {
        setLoadingCertificates(true);
        try {
            const result = await fetchUserCertificateApplications();

            if (result.success && result.data) {
                // Transform API data to match our Certificate type
                const transformedCertificates: Certificate[] = result.data.map((cert: Record<string, unknown>) => ({
                    id: String(cert.applicationId || cert.id || ''),
                    applicationNumber: String(cert.applicationNumber || ''),
                    type: String(cert.applicationType || "प्रमाणपत्र"),
                    status: String(cert.status || "submitted") as Certificate['status'],
                    appliedDate: String(cert.createdAt || cert.appliedDate || ''),
                    lastUpdated: String(cert.updatedAt || cert.lastUpdated || ''),
                    description: String(cert.description || ''),
                    priority: cert.priority === 1 ? "high" : cert.priority === 2 ? "medium" : "low",
                    currentStep: getMarathiStatus(String(cert.status)),
                    nextStep: cert.status === "submitted" ? "प्रक्रियेत" : undefined,
                    comments: String(cert.reviewNotes || cert.comments || ''),
                    applicantName: String(cert.applicantName || ''),
                    papName: String(cert.papName || ''),
                    projectName: String(cert.projectName || ''),
                    historyComments: Array.isArray(cert.historyComments) ? cert.historyComments.map((comment: Record<string, unknown>) => ({
                        notes: comment.notes === null ? null : String(comment.notes || ''),
                        changed_dt: String(comment.changed_dt || ''),
                        status: String(comment.status || '')
                    })) : []
                }));

                setCertificates(transformedCertificates);
            }
        } catch (error) {
            console.error('Error loading certificates:', error);
        } finally {
            setLoadingCertificates(false);
        }
    };

    // Combined refresh function
    const refreshData = useCallback(async () => {
        await Promise.all([
            loadStatusUpdates(),
            loadCertificates()
        ]);
    }, []);



    // Load data on component mount and when refresh trigger changes
    useEffect(() => {
        refreshData();
    }, [refreshTrigger, refreshData]);

    // Handle form submission success
    const handleSubmitApplication = () => {
        setOpenApplyDialog(false);
        // Trigger refresh after form submission
        setRefreshTrigger(prev => prev + 1);
    };

    // Handle tab change with refresh for certificate management tab
    const handleTabChange = (tab: number) => {
        setActiveTab(tab);
        // Refresh data when switching to certificate management tab
        if (tab === 1) {
            setRefreshTrigger(prev => prev + 1);
        }
    };

    // Handle manual refresh (for refresh button)
    const handleManualRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
            {/* Header Section */}
            <Header setIsAuthenticated={setIsAuthenticated} />

            <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>

                {/* Tab Navigation */}
                <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />


                {/* Main Content */}
                <Paper sx={{ mb: { xs: 2, sm: 3, md: 4 }, mt: { xs: 1, sm: 2, md: 2 } }}>

                    {/* Tab Content */}
                    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                        {activeTab === 0 && (
                            <>
                                <Typography variant="h5" sx={{
                                    mb: { xs: 2, sm: 3, md: 3 },
                                    color: '#1A5276',
                                    fontWeight: 600,
                                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                                }}>
                                    स्वागत आहे! 👋
                                </Typography>
                                {/* Certificate Tracker */}
                                <CertificateTracker certificates={certificates} />
                                <Box>

                                    <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
                                        <Grid item xs={12} md={8}>
                                            <StatusUpdatesMarquee
                                                updates={statusUpdates}
                                                loading={loadingStatusUpdates}
                                                onRefresh={handleManualRefresh}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <QuickActionsCard
                                                onApplyCertificate={handleApplyCertificate}
                                                onViewAllApplications={() => handleTabChange(1)}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            </>
                        )}

                        {activeTab === 1 && (
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h5" sx={{ color: '#1A5276', fontWeight: 600 }}>
                                        माझे प्रमाणपत्र अर्ज
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        onClick={handleApplyCertificate}
                                        startIcon={<AddIcon />}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        नवीन अर्ज
                                    </Button>
                                </Box>

                                <Grid container spacing={3}>
                                    {loadingCertificates ? (
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                                <Typography variant="body1" color="textSecondary">
                                                    प्रमाणपत्रे लोड करत आहे...
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    ) : certificates.length > 0 ? (
                                        certificates.map((certificate) => (
                                            <Grid item xs={12} md={6} lg={4} key={certificate.id}>
                                                <CertificateCard
                                                    certificate={certificate}
                                                    onViewDetails={handleViewCertificate}
                                                />
                                            </Grid>
                                        ))
                                    ) : (
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                                <Typography variant="body1" color="textSecondary">
                                                    कोणतेही प्रमाणपत्र अर्ज नाहीत
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        )}

                        {activeTab === 2 && (
                            <Box>
                                <Typography variant="h5" sx={{ mb: 3, color: '#1A5276', fontWeight: 600 }}>
                                    वैयक्तिक माहिती
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Card>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                                    <Avatar
                                                        sx={{
                                                            bgcolor: '#1A5276',
                                                            width: 64,
                                                            height: 64,
                                                            mr: 2
                                                        }}
                                                    >
                                                        <Typography variant="h4" sx={{ color: 'white' }}>
                                                            {userName.charAt(0).toUpperCase()}
                                                        </Typography>
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                            {userName}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            नागरिक खाते
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Divider sx={{ mb: 2 }} />

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                                                        ईमेल पत्ता
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {userEmail}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                                                        वापरकर्ता आयडी
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {userId}
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                                                        प्रवेश स्तर
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                        स्तर 3 - नागरिक प्रवेश
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ mb: 3, color: '#1A5276' }}>
                                                    खाते सुरक्षा
                                                </Typography>

                                                <Box sx={{ mb: 3 }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                                        🔐 एन्क्रिप्टेड प्रमाणीकरण
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        आपले खाते उच्च स्तरीय एन्क्रिप्शन सुरक्षा सह संरक्षित आहे
                                                    </Typography>
                                                </Box>

                                                <Box sx={{ mb: 3 }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                                        📊 डेटा गोपनीयता
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        आपली वैयक्तिक माहिती पूर्णपणे गोपनीय राखली जाते
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                                                        ⚡ त्वरित प्रतिसाद
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        आपल्या अर्जांची स्थिती वास्तविक वेळेत अपडेट केली जाते
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Container>

            {/* Floating Action Button */}
            <Tooltip title="नवीन प्रमाणपत्र अर्ज करा" placement="left">
                <Fab
                    color="primary"
                    aria-label="add"
                    onClick={handleApplyCertificate}
                    sx={{
                        position: 'fixed',
                        bottom: { xs: 16, sm: 20, md: 24 },
                        right: { xs: 16, sm: 20, md: 24 },
                        width: { xs: 48, sm: 56, md: 56 },
                        height: { xs: 48, sm: 56, md: 56 },
                        bgcolor: '#1A5276',
                        '&:hover': { bgcolor: '#154360' }
                    }}
                >
                    <AddIcon sx={{ fontSize: { xs: 20, sm: 24, md: 24 } }} />
                </Fab>
            </Tooltip>

            {/* Apply Certificate Dialog */}
            <ApplyCertificateDialog
                open={openApplyDialog}
                onClose={handleCloseDialog}
                onSubmit={handleSubmitApplication}
                editMode={editMode}
                applicationId={editingCertificateId}
                applicationStatus={editMode ? certificates.find(cert => cert.applicationNumber === editingCertificateId)?.status : undefined}
                whichForm={1} // Default to form 1 for UserDashboard
            />
        </Box>
    );
};

export default UserDashboard; 