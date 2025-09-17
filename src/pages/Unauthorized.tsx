import { Box, Typography, Container, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import { throughUserOut } from "../Helpers/throughUserOut";

function Unauthorized() {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <AppProvider theme={theme}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#e0e8f0',
                    backgroundImage: 'linear-gradient(120deg, #e0e8f0 0%, #c3cfe2 100%)',
                    p: 3,
                    minHeight: '100vh'
                }}
            >
                <Container maxWidth="sm">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'white',
                            borderRadius: 2,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            p: 4,
                            textAlign: 'center'
                        }}
                    >
                        <LockIcon
                            sx={{
                                fontSize: 80,
                                color: '#e74c3c',
                                mb: 2
                            }}
                        />

                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                color: '#2c3e50',
                                fontWeight: 600,
                                mb: 2
                            }}
                        >
                            Access Restricted
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: '#7f8c8d',
                                mb: 3,
                                lineHeight: 1.6
                            }}
                        >
                            आपल्याला या पृष्ठावर प्रवेश करण्याची परवानगी नाही.
                            कृपया आपल्या प्रशासकाशी संपर्क साधा.
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: '#95a5a6',
                                mb: 3,
                                fontStyle: 'italic'
                            }}
                        >
                            You don't have permission to access this page.
                            Please contact your administrator.
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={() => throughUserOut(navigate)}
                            sx={{
                                backgroundColor: '#1a5276',
                                '&:hover': {
                                    backgroundColor: '#154360'
                                },
                                px: 4,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600
                            }}
                        >
                            मुख्य पृष्ठावर परत जा
                        </Button>
                    </Box>
                </Container>
            </Box>
        </AppProvider>
    );
}

export default Unauthorized; 