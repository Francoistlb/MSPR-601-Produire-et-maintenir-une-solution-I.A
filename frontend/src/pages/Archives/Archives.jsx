import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Alert, 
  CircularProgress,
  Paper,
  Grid
} from '@mui/material';
import CovidArchiveFilter from '../../components/CovidArchiveFilter';
import CovidArchiveChart from '../../components/charts/CovidArchiveChart';
import { fetchCovidData, fetchLocations } from '../../services/api';

const Archives = () => {
  const [covidData, setCovidData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [startDate, setStartDate] = useState(new Date('2020-01-01'));
  const [endDate, setEndDate] = useState(new Date('2023-12-31'));

  // Charger la liste des pays au montage du composant
  useEffect(() => {
    loadCountries();
  }, []);

  // Charger les données quand les filtres changent
  useEffect(() => {
    if (selectedCountries.length > 0) {
      loadCovidData();
    } else {
      setCovidData({});
    }
  }, [selectedCountries, startDate, endDate]);

  const loadCountries = async () => {
    try {
      const data = await fetchLocations();
      
      // Trier les pays par ordre alphabétique
      const sortedCountries = data.sort((a, b) => 
        a.location_name.localeCompare(b.location_name, 'fr', { sensitivity: 'base' })
      );
      
      console.log('🔤 Premiers pays triés:', sortedCountries.slice(0, 10));
      console.log('🔤 Derniers pays triés:', sortedCountries.slice(-10));
      
      setCountries(sortedCountries);
      
      // Pré-sélectionner les 4 pays demandés
      const defaultCountries = ['France', 'China', 'Germany', 'Belgium'];
      
      const preSelectedCountries = sortedCountries.filter(country => 
        defaultCountries.includes(country.location_name)
      );
      
      if (preSelectedCountries.length > 0) {
        setSelectedCountries(preSelectedCountries);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des pays:', err);
      setError('Erreur lors du chargement de la liste des pays');
    }
  };

  const loadCovidData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchCovidData({
        countries: selectedCountries,
        startDate: startDate,
        endDate: endDate
      });
      
      setCovidData(data);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données COVID-19');
    } finally {
      setLoading(false);
    }
  };

  const handleCountriesChange = (newCountries) => {
    setSelectedCountries(newCountries);
  };

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
  };

  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
  };
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Données Archives COVID-19
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Explorez les données historiques COVID-19 avec des filtres personnalisables 
        pour analyser l'évolution de la pandémie par pays et par métrique.
        <br />
        <em>4 pays sont pré-sélectionnés pour commencer : France, Chine, Allemagne et Belgique.</em>
      </Typography>

      {/* Filtres */}
      <CovidArchiveFilter 
        selectedCountries={selectedCountries}
        onCountriesChange={handleCountriesChange}
        countries={countries}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />

      {/* Zone d'affichage des graphiques */}
      <Box sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} data-testid="error-message">
            {error}
          </Alert>
        )}

        {loading && (
          <Paper sx={{ p: 3, textAlign: 'center' }} data-testid="loading-spinner">
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>
              Chargement des données...
            </Typography>
          </Paper>
        )}

        {!loading && !error && selectedCountries.length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center' }} data-testid="no-countries-message">
            <Typography variant="h6" color="text.secondary">
              Sélectionnez un ou plusieurs pays pour afficher les données
            </Typography>
          </Paper>
        )}

        {!loading && !error && selectedCountries.length > 0 && Object.keys(covidData).length > 0 && (
          <Grid container spacing={4}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, height: '500px' }} data-testid="chart-new_cases">
                <CovidArchiveChart 
                  data={covidData}
                  metric="new_cases"
                  title="Nouveaux cas COVID-19"
                />
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, height: '500px' }} data-testid="chart-new_deaths">
                <CovidArchiveChart 
                  data={covidData}
                  metric="new_deaths"
                  title="Nouveaux décès COVID-19"
                />
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, height: '500px' }} data-testid="chart-total_cases">
                <CovidArchiveChart 
                  data={covidData}
                  metric="total_cases"
                  title="Cas totaux COVID-19 (cumulés)"
                />
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, height: '500px' }} data-testid="chart-hosp_patients">
                <CovidArchiveChart 
                  data={covidData}
                  metric="hosp_patients"
                  title="Patients hospitalisés"
                />
              </Paper>
            </Grid>
          </Grid>
        )}

        {!loading && !error && selectedCountries.length > 0 && Object.keys(covidData).length === 0 && (
          <Paper sx={{ p: 3, textAlign: 'center' }} data-testid="no-data-message">
            <Typography variant="h6" color="text.secondary">
              Aucune donnée disponible pour les filtres sélectionnés
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Archives;
