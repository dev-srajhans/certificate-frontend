import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';

interface StatsCardsProps {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    processingApplications: number;
    selectedStatus?: number;
    onStatusChange?: (status: number) => void;
}

const StatsCards: React.FC<StatsCardsProps> = ({
    totalApplications,
    pendingApplications,
    approvedApplications,
    processingApplications,
    onStatusChange
}) => {
    return (
        <Box>
            <Grid container spacing={{ xs: 2, sm: 3, md: 3 }} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        bgcolor: '#e3f2fd',
                        border: '1px solid #2196f3',
                        '&:hover': { transform: 'translateY(-2px)', transition: '0.3s' },
                        cursor: 'pointer'
                    }}
                        onClick={() => onStatusChange && onStatusChange(0)}
                    >
                        <CardContent sx={{
                            textAlign: 'center',
                            p: { xs: 2, sm: 3, md: 3 }
                        }}>
                            <Typography variant="h4" sx={{
                                color: 'black',
                                fontWeight: 400,
                                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                            }}>
                                {totalApplications}
                            </Typography>
                            <Typography variant="body2" sx={{
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                color: 'black',
                                fontWeight: 400
                            }}>
                                एकूण अर्ज
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        bgcolor: '#fce4ec',
                        border: '1px solid #e91e63',
                        '&:hover': { transform: 'translateY(-2px)', transition: '0.3s' },
                        cursor: 'pointer'
                    }}
                        onClick={() => onStatusChange && onStatusChange(1)}
                    >
                        <CardContent sx={{
                            textAlign: 'center',
                            p: { xs: 2, sm: 3, md: 3 }
                        }}>
                            <Typography variant="h4" sx={{
                                color: 'black',
                                fontWeight: 400,
                                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                            }}>
                                {processingApplications}
                            </Typography>
                            <Typography variant="body2" sx={{
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                color: 'black',
                                fontWeight: 400
                            }}>
                                प्रतीक्षित अर्ज
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        bgcolor: '#fff3e0',
                        border: '1px solid #ff9800',
                        '&:hover': { transform: 'translateY(-2px)', transition: '0.3s' },
                        cursor: 'pointer'
                    }}
                        onClick={() => onStatusChange && onStatusChange(3)}
                    >
                        <CardContent sx={{
                            textAlign: 'center',
                            p: { xs: 2, sm: 3, md: 3 }
                        }}>
                            <Typography variant="h4" sx={{
                                color: 'black',
                                fontWeight: 400,
                                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                            }}>
                                {pendingApplications}
                            </Typography>
                            <Typography variant="body2" sx={{
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                color: 'black',
                                fontWeight: 400
                            }}>
                                प्रक्रियेत अर्ज
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{
                        bgcolor: '#e8f5e8',
                        border: '1px solid #4caf50',
                        '&:hover': { transform: 'translateY(-2px)', transition: '0.3s' },
                        cursor: 'pointer'
                    }}
                        onClick={() => onStatusChange && onStatusChange(4)}
                    >
                        <CardContent sx={{
                            textAlign: 'center',
                            p: { xs: 2, sm: 3, md: 3 }
                        }}>
                            <Typography variant="h4" sx={{
                                color: 'black',
                                fontWeight: 400,
                                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                            }}>
                                {approvedApplications}
                            </Typography>
                            <Typography variant="body2" sx={{
                                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                                color: 'black',
                                fontWeight: 400
                            }}>
                                मंजूर अर्ज
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StatsCards; 