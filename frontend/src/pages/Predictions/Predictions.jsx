import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Alert, 
  Box,
  Autocomplete,
  TextField,
  Chip,
  Grid
} from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchCountries, fetchPredictions } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Couleurs pour les pays
const COUNTRY_COLORS = {
  'Afghanistan': 'rgb(255, 99, 132)',   // Rouge
  'Albania': 'rgb(54, 162, 235)',       // Bleu
  'Algeria': 'rgb(255, 206, 86)',       // Jaune
  'Andorra': 'rgb(75, 192, 192)',       // Vert turquoise
  'Angola': 'rgb(153, 102, 255)',       // Violet
  'Argentina': 'rgb(255, 159, 64)',     // Orange
  'Australia': 'rgb(199, 199, 199)',    // Gris
  'Austria': 'rgb(83, 102, 255)',       // Bleu foncé
  'Brazil': 'rgb(255, 99, 132)',        // Rouge
  'China': 'rgb(255, 159, 64)',         // Orange
  'France': 'rgb(75, 192, 192)',        // Vert
  'Germany': 'rgb(153, 102, 255)',      // Violet
  'United States': 'rgb(255, 99, 132)'  // Rouge
};

// Mapping des pays par continent
const CONTINENTS = {
  'Europe': ['France', 'Germany', 'Italy', 'Spain', 'United Kingdom', 'Switzerland', 'Belgium', 'Netherlands'],
  'Asie': ['China', 'Japan', 'South Korea', 'India', 'Vietnam', 'Thailand', 'Indonesia'],
  'Amérique': ['United States', 'Canada', 'Brazil', 'Mexico', 'Argentina', 'Chile'],
  'Afrique': ['South Africa', 'Egypt', 'Morocco', 'Nigeria', 'Kenya', 'Ethiopia'],
  'Océanie': ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea']
};

// Fonction utilitaire pour trouver le continent d'un pays
const getContinent = (country) => {
  return Object.entries(CONTINENTS).find(([continent, countries]) => 
    countries.includes(country)
  )?.[0] || 'Autre';
};

const Predictions = () => {
  const [availableCountries, setAvailableCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [casesData, setCasesData] = useState(null);
  const [deathsData, setDeathsData] = useState(null);
  const [spreadData, setSpreadData] = useState(null);

  // Charger la liste des pays au montage du composant
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Chargement des pays...');
        
        const countries = await fetchCountries();
        console.log('Pays reçus:', countries);
        
        setAvailableCountries(countries);
        setSelectedCountries([]);
      } catch (error) {
        console.error('Erreur:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  // Charger les prédictions quand les pays sélectionnés changent
  useEffect(() => {
    const loadPredictions = async () => {
      if (selectedCountries.length === 0) {
        setCasesData(null);
        setDeathsData(null);
        setSpreadData(null);
        return;
      }

      try {
        setLoading(true);
        const predictionsData = await fetchPredictions(2025);
        console.log('Données brutes reçues:', predictionsData);
        
        // Initialiser les structures de données pour le calcul des moyennes
        const monthlyCases = {};
        const monthlyDeaths = {};
        const monthlySpread = {};
        const monthCounts = {};

        // Initialiser les structures pour chaque pays
        selectedCountries.forEach(country => {
          monthlyCases[country] = Array(12).fill(0);
          monthlyDeaths[country] = Array(12).fill(0);
          monthlySpread[country] = Array(12).fill(0);
          monthCounts[country] = Array(12).fill(0);
        });

        // Pour chaque pays sélectionné, traiter ses prédictions
        selectedCountries.forEach(country => {
          if (predictionsData[country]) {
            // Grouper les prédictions par mois
            const monthlyData = {};
            predictionsData[country].forEach(pred => {
              const date = new Date(pred.date);
              const month = date.getMonth();
              
              if (!monthlyData[month]) {
                monthlyData[month] = {
                  totalCases: 0,
                  totalDeaths: 0,
                  totalSpread: 0,
                  count: 0
                };
              }
              
              monthlyData[month].totalCases += parseFloat(pred.nouveaux_cas || 0);
              monthlyData[month].totalDeaths += parseFloat(pred.deces || 0);
              monthlyData[month].totalSpread += parseFloat(pred.countries_reporting_pred || 0);
              monthlyData[month].count++;
            });

            // Calculer les moyennes mensuelles
            Object.entries(monthlyData).forEach(([month, data]) => {
              const monthIndex = parseInt(month);
              monthlyCases[country][monthIndex] = data.totalCases / data.count;
              monthlyDeaths[country][monthIndex] = data.totalDeaths / data.count;
              monthlySpread[country][monthIndex] = data.totalSpread / data.count;
            });
          }
        });

        // Afficher les moyennes pour debug
        selectedCountries.forEach(country => {
          console.log(`Moyennes mensuelles des cas pour ${country}:`, monthlyCases[country]);
          console.log(`Moyennes mensuelles des décès pour ${country}:`, monthlyDeaths[country]);
        });

        const commonLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        
        setCasesData({
          labels: commonLabels,
          datasets: selectedCountries.map(country => ({
            label: country,
            data: monthlyCases[country],
            borderColor: COUNTRY_COLORS[country] || '#' + Math.floor(Math.random()*16777215).toString(16),
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 2
          }))
        });

        setDeathsData({
          labels: commonLabels,
          datasets: selectedCountries.map(country => ({
            label: country,
            data: monthlyDeaths[country],
            borderColor: COUNTRY_COLORS[country] || '#' + Math.floor(Math.random()*16777215).toString(16),
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 2
          }))
        });

        // Préparer les données de propagation par continent
        const spreadByContinent = {};
        
        // Initialiser les continents
        Object.keys(CONTINENTS).forEach(continent => {
          spreadByContinent[continent] = {
            totalSpread: 0,
            countries: new Set(),
            countryData: {}
          };
        });

        // Regrouper les données par continent
        selectedCountries.forEach(country => {
          const continent = getContinent(country);
          if (continent && monthlySpread[country]) {
            const maxSpread = Math.max(...monthlySpread[country]);
            if (maxSpread > 0) {
              spreadByContinent[continent].totalSpread += maxSpread;
              spreadByContinent[continent].countries.add(country);
              spreadByContinent[continent].countryData[country] = maxSpread;
            }
          }
        });

        // Créer le dataset pour le graphique de propagation
        setSpreadData({
          labels: Object.keys(spreadByContinent).filter(continent => 
            spreadByContinent[continent].countries.size > 0
          ),
          datasets: [{
            label: 'Propagation par continent',
            data: Object.entries(spreadByContinent)
              .filter(([_, data]) => data.countries.size > 0)
              .map(([continent, data]) => ({
                x: data.totalSpread,
                y: continent,
                countries: Array.from(data.countries).join(', ')
              })),
            backgroundColor: Object.values(COUNTRY_COLORS).slice(0, Object.keys(spreadByContinent).length),
            barThickness: 30
          }]
        });

      } catch (error) {
        console.error('Erreur lors du chargement des prédictions:', error);
        setError('Erreur lors du chargement des prédictions');
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, [selectedCountries]);

  const createChartOptions = (title, yAxisLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
      },
      title: {
        display: true,
        text: title
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} ${yAxisLabel}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yAxisLabel
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mois'
        }
      }
    }
  });

  const casesOptions = createChartOptions(
    'Moyenne mensuelle des nouveaux cas COVID-19 prédits pour 2025',
    'nouveaux cas par jour en moyenne'
  );

  const deathsOptions = createChartOptions(
    'Moyenne mensuelle des décès COVID-19 prédits pour 2025',
    'décès par jour en moyenne'
  );

  const spreadOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Propagation géographique prédite par continent en 2025'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.x;
            const continent = context.parsed.y;
            const countries = context.raw.countries;
            return [
              `${continent}: ${value.toFixed(0)} pays touchés`,
              `Pays inclus: ${countries}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Nombre de pays touchés'
        },
        beginAtZero: true
      },
      y: {
        title: {
          display: true,
          text: 'Continents'
        }
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Prédictions COVID-19
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filtres */}
      <Box sx={{ mb: 3 }}>
        <Autocomplete
          multiple
          options={availableCountries}
          value={selectedCountries}
          onChange={(event, newValue) => {
            if (newValue.length <= 5) {
              setSelectedCountries(newValue);
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Sélectionner les pays (max 5)"
              placeholder={selectedCountries.length >= 5 ? "" : "Chercher un pays..."}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const props = getTagProps({ index });
              const { key, ...otherProps } = props;
              return (
                <Chip
                  key={key}
                  label={option}
                  {...otherProps}
                  style={{
                    backgroundColor: COUNTRY_COLORS[option] || '#e0e0e0',
                    color: 'white'
                  }}
                />
              );
            })
          }
          loading={loading}
          disabled={loading}
          sx={{ width: '100%' }}
        />
      </Box>

      {loading ? (
        <Typography>Chargement des données...</Typography>
      ) : (
        <>
          <Typography>
            {availableCountries.length} pays disponibles
          </Typography>
          
          {/* Graphiques */}
          <Grid container spacing={3}>
            {/* Graphique des cas */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: '500px' }}>
                {casesData && <Line data={casesData} options={casesOptions} />}
              </Paper>
            </Grid>
            
            {/* Graphique des décès */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: '500px' }}>
                {deathsData && <Line data={deathsData} options={deathsOptions} />}
              </Paper>
            </Grid>

            {/* Graphique de propagation géographique */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: '600px' }}>
                {spreadData && <Bar data={spreadData} options={spreadOptions} />}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Predictions; 