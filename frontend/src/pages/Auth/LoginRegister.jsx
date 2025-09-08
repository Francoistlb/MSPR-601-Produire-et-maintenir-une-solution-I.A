import React, { useState } from 'react';
import { useAuth } from '../../context';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  Tab,
  Tabs
} from '@mui/material';
import { FaUser, FaLock, FaAt } from 'react-icons/fa';
import './auth.css';

const LoginRegister = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const { t } = useTranslation();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setMessage('');
    setError('');
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validation côté client
    if (!email || !password) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    if (activeTab === 1) {
      // Validations pour l'inscription
      if (!username) {
        setError('Le nom d\'utilisateur est obligatoire');
        setLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        setLoading(false);
        return;
      }
    }

    try {
      if (activeTab === 0) {
        // Login
        console.log('🔐 Attempting login...');
        const result = await login(email, password);
        if (!result.success) {
          setError(result.error);
          console.error('🔐 Login failed:', result.error);
        } else {
          console.log('🔐 Login successful!');
          // La redirection sera gérée par le AuthContext et ProtectedRoutes
        }
      } else {
        // Register
        console.log('📝 Attempting registration...');
        const result = await register(email, password, username);
        if (result.success) {
          setMessage(result.message || 'Inscription réussie ! Vous pouvez maintenant vous connecter.');
          setActiveTab(0);
          setEmail('');
          setUsername('');
          setPassword('');
          setConfirmPassword('');
          console.log('📝 Registration successful!');
        } else {
          setError(result.error);
          console.error('📝 Registration failed:', result.error);
        }
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err);
      setError('Une erreur inattendue s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <Container maxWidth="sm">
        <Paper elevation={10} sx={{ p: 4, borderRadius: 3 }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" component="h1" gutterBottom>
              Analyze IT 2
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Tableau de bord COVID-19
            </Typography>
          </Box>

          <Tabs value={activeTab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label="Connexion" />
            <Tab label="Inscription" />
          </Tabs>

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
              <FaAt style={{ color: '#666', marginRight: 8, marginBottom: 8 }} />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="standard"
              />
            </Box>

            {activeTab === 1 && (
              <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
                <FaUser style={{ color: '#666', marginRight: 8, marginBottom: 8 }} />
                <TextField
                  fullWidth
                  label="Nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  variant="standard"
                  helperText="3-50 caractères, lettres, chiffres, _ et - uniquement"
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
              <FaLock style={{ color: '#666', marginRight: 8, marginBottom: 8 }} />
              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="standard"
                helperText={activeTab === 1 ? "Au moins 6 caractères avec chiffres et lettres" : ""}
              />
            </Box>

            {activeTab === 1 && (
              <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 2 }}>
                <FaLock style={{ color: '#666', marginRight: 8, marginBottom: 8 }} />
                <TextField
                  fullWidth
                  label="Confirmer le mot de passe"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  variant="standard"
                />
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 3, 
                py: 1.5,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                }
              }}
            >
              {loading ? t('Chargement...') : (activeTab === 0 ? 'Se connecter' : 'S\'inscrire')}
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default LoginRegister;
