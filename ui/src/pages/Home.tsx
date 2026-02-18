import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { SiPreact } from 'react-icons/si';

interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export default function Home() {
  const navigate = useNavigate();

  // TODO: Replace with API call to fetch problems
  const problems: Problem[] = [
    {
      id: '1',
      title: 'Build a Counter Component',
      difficulty: 'easy',
      category: 'State Management',
    },
    {
      id: '2',
      title: 'Todo List App',
      difficulty: 'medium',
      category: 'Forms & Lists',
    },
    {
      id: '3',
      title: 'Advanced Search with Debouncing',
      difficulty: 'hard',
      category: 'Performance',
    },
    {
      id: '4',
      title: 'Form Validation',
      difficulty: 'medium',
      category: 'Forms & Lists',
    },
    {
      id: '5',
      title: 'Build a Modal Component',
      difficulty: 'easy',
      category: 'Components',
    },
    {
      id: '6',
      title: 'Real-time Collaborative Editor',
      difficulty: 'hard',
      category: 'Advanced',
    },
  ];

  const handleProblemClick = (problemId: string) => {
    navigate(`/problem/${problemId}`);
  };

  const handleLogout = () => {
    // TODO: Call logout API
    navigate('/login');
  };

  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #4FD1FF 0%, #9B5CFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: '2rem',
              }}
            >
              <SiPreact />
            </Box>
            <Typography
              variant="h5"
              component="div"
              sx={{ fontWeight: 'bold' }}
            >
              Rerender
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            component="h2"
            sx={{ mb: 2, fontWeight: 'bold' }}
          >
            Welcome to Rerender
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Practice React machine-coding interview problems
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            component="h3"
            sx={{ mb: 3, fontWeight: 'bold' }}
          >
            Available Problems
          </Typography>

          <Grid container spacing={3}>
            {problems.map((problem) => (
              <Grid xs={12} sm={6} md={4} key={problem.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => handleProblemClick(problem.id)}
                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={2} sx={{ height: '100%' }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1}
                        >
                          <Typography
                            variant="h6"
                            component="h4"
                            sx={{
                              fontWeight: 600,
                              flex: 1,
                            }}
                          >
                            {problem.title}
                          </Typography>
                          <Chip
                            label={problem.difficulty.toUpperCase()}
                            color={getDifficultyColor(problem.difficulty)}
                            size="small"
                            variant="filled"
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              minWidth: '70px',
                              textAlign: 'center',
                              ...(getDifficultyColor(problem.difficulty) === 'success' && {
                                backgroundColor: '#48BB78',
                                color: '#fff',
                              }),
                              ...(getDifficultyColor(problem.difficulty) === 'error' && {
                                backgroundColor: '#E74C3C',
                                color: '#fff',
                              }),
                              ...(getDifficultyColor(problem.difficulty) === 'warning' && {
                                backgroundColor: '#E67E22',
                                color: '#fff',
                              }),
                            }}
                          />
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          {problem.category}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
          </Box>
        </Container>
    </Box>
  );
}
