import React from 'react';
import { useAuth } from '../../context';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea,
  Grid,
  Box,
  Button
} from '@mui/material';
import { FaFlag, FaSignOutAlt } from 'react-icons/fa';

const CountrySelector = () => {
  const { selectCountry, logout, user } = useAuth();

  const countries = [
    {
      code: 'FR',
      name: 'France',
      flag: '🇫🇷',
      description: 'Données et prédictions pour la France'
    },
    {
      code: 'CH',
      name: 'Suisse',
      flag: '🇨🇭',
      description: 'Données et prédictions pour la Suisse'
    },
    {
      code: 'US',
      name: 'États-Unis',
      flag: '🇺🇸',
      description: 'Données et prédictions pour les États-Unis'
    }
  ];

  const handleCountrySelect = (countryCode) => {
    selectCountry(countryCode);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 0'
    }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
            Bienvenue, {user?.email}
          </Typography>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
            Choisissez votre région d'analyse
          </Typography>
          <Button
            onClick={logout}
            startIcon={<FaSignOutAlt />}
            sx={{ 
              color: 'white', 
              borderColor: 'white',
              '&:hover': { borderColor: 'rgba(255,255,255,0.7)' }
            }}
            variant="outlined"
          >
            Se déconnecter
          </Button>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {countries.map((country) => (
            <Grid item xs={12} sm={6} md={4} key={country.code}>
              <Card 
                elevation={8}
                sx={{ 
                  height: '100%',
                  background: 'rgba(255,255,255,0.95)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => handleCountrySelect(country.code)}
                  sx={{ height: '100%', p: 2 }}
                >
                  <CardContent sx={{ textAlign: 'center', height: '100%' }}>
                    <Box sx={{ fontSize: '4rem', mb: 2 }}>
                      {country.flag}
                    </Box>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {country.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {country.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 'auto' }}>
                      <FaFlag style={{ marginRight: 8, color: '#667eea' }} />
                      <Typography variant="button" sx={{ color: '#667eea', fontWeight: 'bold' }}>
                        Sélectionner
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" mt={4}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Vous pourrez changer de région à tout moment depuis le menu de navigation
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default CountrySelector;
