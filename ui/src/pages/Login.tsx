import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Google as GoogleIcon, GitHub as GitHubIcon } from '@mui/icons-material';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // TODO: Replace with actual API call
      console.log('Login attempt:', { email, password });
      setLoading(false);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('Google login not yet configured');
  };

  const handleGitHubLogin = () => {
    const state = Math.random().toString(36).substring(7);
    const redirectUri = `${window.location.origin}/auth/github/callback`;

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&state=${state}&scope=user:email`;

    window.location.href = githubAuthUrl;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '700px',
          height: '700px',
          marginTop: '-350px',
          marginLeft: '-350px',
          background: 'radial-gradient(circle at 35% 35%, rgba(155, 92, 255, 0.4) 0%, rgba(79, 209, 255, 0.25) 40%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            width: '100%',
            p: 4,
            backgroundColor: 'rgba(15, 15, 25, 0.6)',
            borderRadius: '16px',
            border: '1px solid rgba(79, 209, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 40px rgba(79, 209, 255, 0.2), inset 0 0 30px rgba(79, 209, 255, 0.05)',
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #4FD1FF 0%, #9B5CFF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold',
              mb: 1,
              textShadow: '0 0 30px rgba(79, 209, 255, 0.3)',
            }}
          >
            Rerender
          </Typography>

          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: '#a0a0b0',
              mb: 4,
              fontSize: '0.95rem',
            }}
          >
            React Machine Coding Interview Prep
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              variant="outlined"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(15, 15, 25, 0.4)',
                  border: '1px solid #4FD1FF',
                  borderRadius: '10px',
                  boxShadow: '0 0 15px rgba(79, 209, 255, 0.2)',
                  '&:hover': {
                    boxShadow: '0 0 25px rgba(79, 209, 255, 0.3)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 35px rgba(79, 209, 255, 0.4), inset 0 0 10px rgba(79, 209, 255, 0.1)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#a0a0b0',
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              variant="outlined"
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(15, 15, 25, 0.4)',
                  border: '1px solid #4FD1FF',
                  borderRadius: '10px',
                  boxShadow: '0 0 15px rgba(79, 209, 255, 0.2)',
                  '&:hover': {
                    boxShadow: '0 0 25px rgba(79, 209, 255, 0.3)',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 35px rgba(79, 209, 255, 0.4), inset 0 0 10px rgba(79, 209, 255, 0.1)',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#a0a0b0',
                },
              }}
            />

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  my: 2,
                  backgroundColor: 'rgba(255, 71, 87, 0.1)',
                  color: '#FF6B7A',
                  border: '1px solid rgba(255, 71, 87, 0.3)',
                  borderRadius: '10px',
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>

          <Divider 
            sx={{ 
              my: 3,
              borderColor: 'rgba(160, 160, 176, 0.2)',
              '& .MuiDivider-wrapper': {
                color: '#a0a0b0',
              },
            }}
          >
            or
          </Divider>

          <Stack spacing={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={!GOOGLE_CLIENT_ID}
              sx={{
                borderColor: '#9B5CFF',
                color: '#9B5CFF',
                borderRadius: '10px',
                py: 1.2,
                fontSize: '0.95rem',
                fontWeight: 600,
                boxShadow: '0 0 20px rgba(155, 92, 255, 0.2)',
                '&:hover': {
                  borderColor: '#9B5CFF',
                  backgroundColor: 'rgba(155, 92, 255, 0.1)',
                  boxShadow: '0 0 35px rgba(155, 92, 255, 0.4)',
                },
              }}
            >
              Continue with Google
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GitHubIcon />}
              onClick={handleGitHubLogin}
              disabled={!GITHUB_CLIENT_ID}
              sx={{
                borderColor: '#4FD1FF',
                color: '#4FD1FF',
                borderRadius: '10px',
                py: 1.2,
                fontSize: '0.95rem',
                fontWeight: 600,
                boxShadow: '0 0 20px rgba(79, 209, 255, 0.2)',
                '&:hover': {
                  borderColor: '#4FD1FF',
                  backgroundColor: 'rgba(79, 209, 255, 0.1)',
                  boxShadow: '0 0 35px rgba(79, 209, 255, 0.4)',
                },
              }}
            >
              Continue with GitHub
            </Button>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              mt: 4,
              color: '#a0a0b0',
            }}
          >
            Don't have an account?{' '}
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <Typography
                component="span"
                sx={{
                  color: '#4FD1FF',
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': { 
                    color: '#7FE1FF',
                    textDecoration: 'underline',
                  },
                }}
              >
                Sign up
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
