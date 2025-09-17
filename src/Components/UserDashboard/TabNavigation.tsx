import React from 'react';
import { Box, Button } from '@mui/material';
import {
    Home as HomeIcon,
    Assignment as AssignmentIcon,
    Person as PersonIcon
} from '@mui/icons-material';

interface TabNavigationProps {
    activeTab: number;
    onTabChange: (tab: number) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {


    const tabs = [
        { id: 0, label: 'मुख्यपृष्ठ', icon: <HomeIcon /> },
        { id: 1, label: 'प्रमाणपत्र व्यवस्थापन', icon: <AssignmentIcon /> },
        { id: 2, label: 'वैयक्तिक माहिती', icon: <PersonIcon /> }
    ];

    return (
        <Box
            sx={{
                backgroundColor: '#ffffff',
                borderBottom: '2px solid #e0e0e0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                position: 'relative',
                zIndex: 5
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: { xs: 1, sm: 1.5, md: 2 },
                    px: { xs: 1, sm: 2, md: 3 },
                    gap: { xs: 0.5, sm: 1, md: 1 },
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                }}
            >
                {tabs.map((tab) => (
                    <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "contained" : "text"}
                        onClick={() => onTabChange(tab.id)}
                        startIcon={tab.icon}
                        sx={{
                            mx: { xs: 0.5, sm: 1, md: 1 },
                            px: { xs: 2, sm: 3, md: 4 },
                            py: { xs: 1, sm: 1.25, md: 1.5 },
                            borderRadius: 3,
                            textTransform: 'none',
                            fontWeight: activeTab === tab.id ? 600 : 500,
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                            minWidth: { xs: 120, sm: 140, md: 180 },
                            transition: 'all 0.3s ease',
                            '&.MuiButton-contained': {
                                backgroundColor: '#1A5276',
                                color: 'white',
                                boxShadow: '0 4px 12px rgba(26, 82, 118, 0.3)',
                                '&:hover': {
                                    backgroundColor: '#154360',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 16px rgba(26, 82, 118, 0.4)'
                                }
                            },
                            '&.MuiButton-text': {
                                color: '#666',
                                '&:hover': {
                                    backgroundColor: 'rgba(26, 82, 118, 0.08)',
                                    color: '#1A5276',
                                    transform: 'translateY(-1px)'
                                }
                            }
                        }}
                    >
                        {tab.label}
                    </Button>
                ))}
            </Box>
        </Box>
    );
};

export default TabNavigation; 