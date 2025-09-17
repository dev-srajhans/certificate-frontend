import { useNavigate } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import { Checkbox, Box, Typography, Paper, Container, Avatar, TextField, Button, FormControlLabel, CircularProgress } from "@mui/material";
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useState, ChangeEvent, FormEvent } from "react";
import { validateEnvironment, getApiUrl } from "../utils/envUtils";
import { clearAccessControlCache, getUserAccessLevel } from "../utils/decryptUtils";
import { getDefaultRouteForAccessLevel } from "../config/routeConfig";

// Validate environment on component load
if (!validateEnvironment()) {
  console.error('Critical environment validation failed - encryption/decryption may not work properly');
}

const API_URL = getApiUrl();

// Define API response structure
interface LoginResponse {
  temp_ids: string;
  User_id: string;
  email: string;
  success: boolean;
  message?: string;
  jwtToken?: string;
  name?: string;
  error?: { details?: { message: string }[] };
}

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      return handleError("Email and password are required");
    }

    setIsLoading(true);

    try {
      const response = await fetch(API_URL + "/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "email": email, "password": password }),
      });

      const result: LoginResponse = await response.json();

      if (result.success) {
        handleSuccess(result.message || "Login successful!");
        // Clear any existing cache first
        clearAccessControlCache();
        // Store all user data first
        sessionStorage.setItem("token", result.jwtToken || "");
        sessionStorage.setItem("loggedInUser", result.name || "");
        sessionStorage.setItem("User_Email", result.email || "");
        sessionStorage.setItem("User_id", result.User_id || "");
        sessionStorage.setItem('User_Access_control_ids', result.temp_ids);

        const userAccessLevel = getUserAccessLevel();
        const defaultRoute = getDefaultRouteForAccessLevel(userAccessLevel);
        navigate(defaultRoute);

      } else {
        const errorMsg = result.error?.details?.[0]?.message || result.message || "Login failed";
        handleError(errorMsg);
      }
    } catch (err) {
      handleError(String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoading) {
      handleLogin(email, password);
    }
  };

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
          height: '100vh'
        }}
      >
        <Container maxWidth="sm" >
          <Paper
            elevation={8}
            sx={{
              minHeight: '100%',
              maxHeight: '80vh',
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
                <LockOutlinedIcon sx={{ fontSize: 28 }} />
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
                (पुनर्वसन शाखा)
              </Typography>
            </Box>

            {/* Custom Login form */}
            <Box sx={{ bgcolor: 'white', px: 3, py: 3 }}>
              <form onSubmit={handleSubmit}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  size="small"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  sx={{
                    my: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 12px rgba(26, 82, 118, 0.15)'
                      }
                    }
                  }}
                />
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  size="small"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  sx={{
                    my: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                      },
                      '&.Mui-focused': {
                        boxShadow: '0 4px 12px rgba(26, 82, 118, 0.15)'
                      }
                    }
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      value="remember"
                      color="primary"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      sx={{
                        padding: 0.5,
                        '& .MuiSvgIcon-root': { fontSize: 20 },
                        color: '#1a5276'
                      }}
                    />
                  }
                  label="Remember me"
                  sx={{ my: 2, ml: 1 }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    mt: 1,
                    mb: 2,
                    py: 1.2,
                    bgcolor: '#1a5276',
                    background: 'linear-gradient(135deg, #1a5276 0%, #2874a6 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #154a6a 0%, #216a96 100%)',
                      boxShadow: '0 6px 12px rgba(26, 82, 118, 0.25)'
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #9e9e9e 0%, #bdbdbd 100%)',
                      color: 'rgba(255, 255, 255, 0.7)'
                    },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 10px rgba(26, 82, 118, 0.2)',
                    letterSpacing: '0.5px',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                      <span>Signing In...</span>
                    </Box>
                  ) : (
                    'Sign In'
                  )}
                </Button>

                {/* Sign Up Link */}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                    नवीन खाते तयार करायचे आहे?{' '}
                    <Button
                      onClick={() => navigate('/signup')}
                      sx={{
                        color: '#1a5276',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      येथे नोंदणी करा
                    </Button>
                  </Typography>
                </Box>
              </form>
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

export default Login;
