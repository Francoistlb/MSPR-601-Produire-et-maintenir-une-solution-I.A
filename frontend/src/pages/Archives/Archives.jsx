import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/ConfigContext';
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
  const { isDatavizEnabled, isTechnicalApiEnabled, countryName } = useConfig();
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
    if (!isTechnicalApiEnabled) {
      return;
    }
    if (selectedCountries.length > 0) {
      loadCovidData();
    } else {
      setCovidData({});
    }
  }, [selectedCountries, startDate, endDate, isTechnicalApiEnabled]);

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
      if (err.message.includes('pas disponible dans votre pays')) {
        setError('Cette fonctionnalité n\'est pas disponible dans votre pays.');
      } else {
        setError('Erreur lors du chargement des données COVID-19');
      }
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
  if (!isTechnicalApiEnabled) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="info">
          L'accès aux données brutes n'est pas disponible dans votre pays. Seules les prédictions sont accessibles.
        </Alert>
      </Container>
    );
  }


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
          <>
            {/* Affichage conditionnel selon le pays */}
            {isDatavizEnabled ? (
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
            ) : (
              /* Pour la Suisse : Affichage des données sous forme de tableau */
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Données COVID-19 - {countryName}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Visualisations graphiques non disponibles pour ce pays.
                  Données disponibles sous forme tabulaire.
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {Object.entries(covidData).map(([country, data]) => (
                    <Box key={country} sx={{ mb: 3 }}>
                      <Typography variant="h6">{country}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {data.length} entrées de données disponibles
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}
          </>
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
