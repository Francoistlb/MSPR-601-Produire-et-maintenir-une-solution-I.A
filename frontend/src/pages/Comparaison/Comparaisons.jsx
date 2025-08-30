import React from 'react';
import { Container, Alert, Typography, Paper, Grid } from '@mui/material';
import { useConfig } from '../../context/ConfigContext';

const Comparaisons = () => {
  const { hasDatavizFeature } = useConfig();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Comparaisons COVID-19
      </Typography>

      <Grid container spacing={3}>
        {/* Section Graphiques d'évolution */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Évolution des cas COVID-19
            </Typography>
            
            {!hasDatavizFeature ? (
              <Alert severity="info">
                Cette fonctionnalité n'est pas disponible dans votre pays. Seules les prédictions sont accessibles.
              </Alert>
            ) : (
              <Typography>
                [Graphique d'évolution à venir]
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Section Comparaisons par pays */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Comparaisons par pays
            </Typography>
            
            {!hasDatavizFeature ? (
              <Alert severity="info">
                Cette fonctionnalité n'est pas disponible dans votre pays. Seules les prédictions sont accessibles.
              </Alert>
            ) : (
              <Typography>
                [Graphique de comparaison à venir]
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Comparaisons;