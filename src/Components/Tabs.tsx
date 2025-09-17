import * as React from 'react';
import CertificateDataGrid from './DataGrid';
import CancelledCertificatesDataGrid from './CancelledCertificatesDataGrid';
import Users from '../pages/Users';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useTheme, useMediaQuery } from '@mui/material';
import { hasAccessControlPermission, hasProcessRole } from '../utils/decryptUtils';
import Header from './Shared/Header';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

interface BasicTabsProps {
    setIsAuthenticated: (auth: boolean) => void;
}

export default function BasicTabs({ setIsAuthenticated }: BasicTabsProps) {
    const [value, setValue] = React.useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    // Check if user has access to cancelled certificates (ID 3)
    const hasCancelledCertificatesAccess = hasAccessControlPermission([3]);
    const canAccessTabs = hasProcessRole([1, 2]);
    const isLevel3User = hasProcessRole([3]);

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header Section */}
            <Header setIsAuthenticated={setIsAuthenticated} />

            {/* Tabs section */}
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: '#F5F7FA',
                    position: 'relative',
                    py: { xs: 0.5, sm: 1, md: 1.5 },
                    px: { xs: 1, sm: 2, md: 3 },
                }}
            >
                {/* Centered tabs */}
                <Tabs
                    value={value}
                    onChange={handleChange}
                    centered={!isMobile}
                    variant={isMobile ? "scrollable" : "standard"}
                    scrollButtons={isMobile ? "auto" : false}
                    sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: '#1A5276',
                            height: 3
                        },
                        '& .MuiTabs-scrollButtons': {
                            color: '#1A5276',
                        }
                    }}
                >
                    {canAccessTabs && (
                        <Tab
                            label="प्रमाणपत्र व्यवस्थापन"
                            {...a11yProps(0)}
                            sx={{
                                fontWeight: 500,
                                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                textTransform: 'none',
                                minWidth: { xs: 120, sm: 140, md: 160 },
                                px: { xs: 2, sm: 3, md: 4 },
                                py: { xs: 1, sm: 1.5, md: 2 },
                                '&.Mui-selected': {
                                    color: '#1A5276',
                                    fontWeight: 600
                                }
                            }}
                        />
                    )}
                    {canAccessTabs && hasCancelledCertificatesAccess && (
                        <Tab
                            label="रद्द प्रमाणपत्र"
                            {...a11yProps(1)}
                            sx={{
                                fontWeight: 500,
                                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                textTransform: 'none',
                                minWidth: { xs: 120, sm: 140, md: 160 },
                                px: { xs: 2, sm: 3, md: 4 },
                                py: { xs: 1, sm: 1.5, md: 2 },
                                '&.Mui-selected': {
                                    color: '#1A5276',
                                    fontWeight: 600
                                }
                            }}
                        />
                    )}
                    {isLevel3User && (
                        <Tab
                            label="नागरिक डॅशबोर्ड"
                            {...a11yProps(isLevel3User && canAccessTabs ? 2 : 0)}
                            sx={{
                                fontWeight: 500,
                                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                                textTransform: 'none',
                                minWidth: { xs: 120, sm: 140, md: 160 },
                                px: { xs: 2, sm: 3, md: 4 },
                                py: { xs: 1, sm: 1.5, md: 2 },
                                '&.Mui-selected': {
                                    color: '#1A5276',
                                    fontWeight: 600
                                }
                            }}
                        />
                    )}
                </Tabs>
            </Box>

            <CustomTabPanel value={value} index={0}>
                <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                    <CertificateDataGrid />
                </Box>
            </CustomTabPanel>
            {hasCancelledCertificatesAccess && (
                <CustomTabPanel value={value} index={1}>
                    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                        <CancelledCertificatesDataGrid />
                    </Box>
                </CustomTabPanel>
            )}
            {isLevel3User && (
                <CustomTabPanel value={value} index={isLevel3User && canAccessTabs ? 2 : 0}>
                    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
                        <Users setIsAuthenticated={setIsAuthenticated} />
                    </Box>
                </CustomTabPanel>
            )}
        </Box>
    );
}
