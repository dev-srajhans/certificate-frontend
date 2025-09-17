import React, { useState } from 'react';
import {
    Box,
    Avatar,
    Menu,
    MenuItem,
    Typography,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Logout as LogoutIcon,
    KeyboardArrowDown as ArrowDownIcon,
    HomeOutlined
} from '@mui/icons-material';
import { throughUserOut } from '../../Helpers/throughUserOut';
import { useNavigate } from 'react-router-dom';


interface UserProfileProps {
    setIsAuthenticated: (auth: boolean) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ setIsAuthenticated }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();


    // Get user data from sessionStorage
    const userName = sessionStorage.getItem("loggedInUser") || "Unknown User";
    const userEmail = sessionStorage.getItem("User_Email") || "No email available";

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSignOut = () => {
        handleClose();
        setIsAuthenticated(false);
        throughUserOut(navigate, setIsAuthenticated);
    };

    return (
        <Box>
            <Tooltip title="वापरकर्ता मेनू" placement="bottom">
                <IconButton
                    onClick={handleClick}
                    sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            border: '2px solid rgba(255, 255, 255, 0.3)'
                        },
                        transition: 'all 0.3s ease',
                        width: { xs: 40, sm: 44, md: 48 },
                        height: { xs: 40, sm: 44, md: 48 },
                    }}
                >
                    <Avatar
                        sx={{
                            width: { xs: 32, sm: 36, md: 40 },
                            height: { xs: 32, sm: 36, md: 40 },
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                        }}
                    >
                        {userName.charAt(0).toUpperCase()}
                    </Avatar>
                    <ArrowDownIcon sx={{
                        ml: { xs: 0.5, sm: 1 },
                        fontSize: { xs: 18, sm: 20, md: 22 },
                        display: { xs: 'none', sm: 'block' }
                    }} />
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                sx={{
                    mt: 1,
                    '& .MuiPaper-root': {
                        minWidth: { xs: 200, sm: 220, md: 240 },
                        maxWidth: { xs: 'calc(100vw - 32px)', sm: 'calc(100vw - 48px)', md: 'calc(100vw - 64px)' },
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                        border: '1px solid rgba(0, 0, 0, 0.08)'
                    }
                }}
            >
                {/* User Info Section */}
                <Box sx={{
                    px: { xs: 2, sm: 3, md: 4 },
                    py: { xs: 1.5, sm: 2, md: 2.5 },
                    bgcolor: '#f8f9fa'
                }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            fontWeight: 600,
                            color: '#1A5276',
                            mb: 0.5,
                            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                        }}
                    >
                        {userName}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
                    >
                        {userEmail}
                    </Typography>
                </Box>

                <Divider />

                <MenuItem
                    onClick={() => navigate('/')}
                    sx={{
                        py: { xs: 1, sm: 1.5, md: 2 },
                        px: { xs: 2, sm: 3, md: 4 },
                        '&:hover': {
                            bgcolor: 'rgba(26, 82, 118, 0.08)'
                        }
                    }}
                >
                    <HomeOutlined sx={{
                        mr: { xs: 1.5, sm: 2, md: 2.5 },
                        color: '#1A5276',
                        fontSize: { xs: 18, sm: 20, md: 22 }
                    }} />
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 500,
                            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                        }}
                    >
                        Home
                    </Typography>
                </MenuItem>

                <Divider />

                <MenuItem
                    onClick={handleSignOut}
                    sx={{
                        py: { xs: 1, sm: 1.5, md: 2 },
                        px: { xs: 2, sm: 3, md: 4 },
                        color: '#d32f2f',
                        '&:hover': {
                            bgcolor: 'rgba(211, 47, 47, 0.08)'
                        }
                    }}
                >
                    <LogoutIcon sx={{
                        mr: { xs: 1.5, sm: 2, md: 2.5 },
                        fontSize: { xs: 18, sm: 20, md: 22 }
                    }} />
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 500,
                            fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' }
                        }}
                    >
                        साइन आउट
                    </Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default UserProfile; 