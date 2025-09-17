import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Container,
  Avatar,
  Button
} from "@mui/material";
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import SignupForm from "../Components/SignupForm";

function Signup() {
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
        <Container maxWidth="md">
          <Paper
            elevation={8}
            sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 10, 60, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Header section */}
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #1a5276 0%, #2874a6 100%)',
                color: 'white',
                textAlign: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <Avatar
                sx={{
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  width: 56,
                  height: 56,
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                }}
              >
                <PersonAddOutlinedIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 600,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  mb: 1,
                  letterSpacing: '0.5px'
                }}
              >
                जिल्हाधिकारी कार्यालय, अमरावती
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 400,
                  opacity: 0.9,
                  letterSpacing: '0.5px'
                }}
              >
                (पुनर्वसन शाखा) - नवीन खाते तयार करा
              </Typography>
            </Box>

            {/* Signup form */}
            <SignupForm
              isAdminMode={false}
              onSuccess={() => {
                setTimeout(() => {
                  navigate("/login");
                }, 2000);
              }}
            />

            {/* Login Link */}
            <Box sx={{ textAlign: 'center', mt: 2, pb: 3 }}>
              <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                आधीपासून खाते आहे?{' '}
                <Button
                  onClick={() => navigate('/login')}
                  sx={{
                    color: '#1a5276',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  लॉगिन करा
                </Button>
              </Typography>
            </Box>
          </Paper>
          <Typography
            variant="body2"
            align="center"
            sx={{
              mt: 2,
              color: 'rgba(0,0,0,0.6)',
              fontWeight: 500,
              textShadow: '0 1px 1px rgba(255,255,255,0.5)'
            }}
          >
            प्रमाणपत्र व्यवस्थापन प्रणाली © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
      <ToastContainer />
    </AppProvider>
  );
}

export default Signup;
