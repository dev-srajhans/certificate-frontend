import React from 'react';
import { Box, Container, Typography, useTheme, useMediaQuery } from '@mui/material';
import UserProfile from './UserProfile';

interface HeaderProps {
    setIsAuthenticated: (auth: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsAuthenticated }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                backgroundColor: '#1A5276',
                color: 'white',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
                padding: { xs: '12px 0', sm: '14px 0', md: '16px 0' },
            }}
        >
            <Container
                maxWidth={false}
                sx={{
                    position: 'relative',
                    px: { xs: 2, sm: 3, md: 4 },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 },
                    }}
                >
                    {/* Left side container with logo and heading */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            flexDirection: { xs: 'column', sm: 'row' },
                            textAlign: { xs: 'center', sm: 'left' },
                        }}
                    >
                        {/* Satya Mev Jayate on left side of heading */}
                        <Box
                            component="img"
                            src="/thumbnails/satya_mev_jayate.png"
                            alt="Satya Mev Jayate"
                            sx={{
                                height: { xs: 60, sm: 70, md: 80, lg: 90 },
                                marginRight: { xs: 0, sm: 2, md: 3 },
                                marginBottom: { xs: 1, sm: 0 },
                                filter: 'brightness(0) invert(1)',
                            }}
                        />

                        {/* Heading-like title */}
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 600,
                                textAlign: "center",
                                color: 'white',
                                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' },
                                lineHeight: 1.2,
                            }}
                        >
                            जिल्हाधिकारी कार्यालय, अमरावती
                            {!isMobile && <br />}
                            <span style={{
                                fontSize: isMobile ? '0.7em' : '0.8em',
                                display: 'block',
                                marginTop: isMobile ? 0.5 : 0
                            }}>
                                (पुनर्वसन शाखा)
                            </span>
                        </Typography>
                        {/* Digital India on rightmost corner - hidden on mobile */}
                        {!isMobile && (
                            <Box
                                component="img"
                                src="/thumbnails/digital_india.png"
                                alt="Digital India"
                                sx={{
                                    height: { sm: 70, md: 80, lg: 90 },
                                    right: 0,
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                                }}
                            />
                        )}
                    </Box>
                </Box>

                {/* User Profile positioned absolutely */}
                <Box
                    sx={{
                        position: "absolute",
                        right: { xs: 16, sm: 20, md: 24 },
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                    }}
                >
                    <UserProfile setIsAuthenticated={setIsAuthenticated} />
                </Box>
            </Container>
        </Box>
    );
};

export default Header; 