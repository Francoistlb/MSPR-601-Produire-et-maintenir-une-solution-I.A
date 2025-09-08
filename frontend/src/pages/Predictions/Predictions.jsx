import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/ConfigContext';
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

// ------------------------------ CONSTANTES UI ------------------------------
const COUNTRY_COLORS = {
  Afghanistan: 'rgb(255, 99, 132)',
  Albania: 'rgb(54, 162, 235)',
  Algeria: 'rgb(255, 206, 86)',
  Andorra: 'rgb(75, 192, 192)',
  Angola: 'rgb(153, 102, 255)',
  Argentina: 'rgb(255, 159, 64)',
  Australia: 'rgb(199, 199, 199)',
  Austria: 'rgb(83, 102, 255)',
  Brazil: 'rgb(255, 99, 132)',
  China: 'rgb(255, 159, 64)',
  France: 'rgb(75, 192, 192)',
  Germany: 'rgb(153, 102, 255)',
  'United States': 'rgb(255, 99, 132)'
};

const CONTINENTS = {
  Europe: ['France', 'Albania', 'Germany', 'Italy', 'Spain', 'United Kingdom', 'Switzerland', 'Belgium', 'Netherlands'],
  Asie: ['Afghanistan', 'China', 'Japan', 'South Korea', 'India', 'Vietnam', 'Thailand', 'Indonesia'],
  Amérique: ['United States', 'Canada', 'Brazil', 'Mexico', 'Argentina', 'Chile'],
  Afrique: ['South Africa', 'Egypt', 'Morocco', 'Nigeria', 'Kenya', 'Ethiopia'],
  Océanie: ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea']
};

const getContinent = (country) =>
  Object.entries(CONTINENTS).find(([_, list]) => list.includes(country))?.[0] || 'Autre';

// ---------------------------------------------------------------------------
const Predictions = () => {
  // Les prédictions sont indépendantes des configurations par pays

  // ------------------------------- STATES ----------------------------------
  const [availableCountries, setAvailableCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [casesData, setCasesData] = useState(null);
  const [deathsData, setDeathsData] = useState(null);
  const [spreadData, setSpreadData] = useState(null);

  // -------------------------- CHARGEMENT PAYS ------------------------------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const countries = await fetchCountries();
        setAvailableCountries(countries);
        setSelectedCountries([]);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ------------------------ CHARGEMENT PRÉDICTIONS -------------------------
  useEffect(() => {
    if (selectedCountries.length === 0) {
      setCasesData(null);
      setDeathsData(null);
      setSpreadData(null);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const raw = await fetchPredictions(2025);

        // ---- 1. Remap : fusionner les 3 indicateurs par (pays + date)
        const dataByCountry = {};
        selectedCountries.forEach((country) => {
          const rows = raw[country];
          if (!rows) return; 
          const byDate = {};
          rows.forEach((r) => {
            const d = r.date || r.date_predite;
            if (!byDate[d]) byDate[d] = { date: d };
            if (r.indicateur === 'new_cases' || r.nouveaux_cas !== undefined)
              byDate[d].nouveaux_cas = r.nouveaux_cas ?? r.valeur_predite ?? 0;
            if (r.indicateur === 'new_deaths' || r.deces !== undefined)
              byDate[d].deces = r.deces ?? r.valeur_predite ?? 0;
            if (r.indicateur === 'countries_reporting' || r.countries_reporting_pred !== undefined)
              byDate[d].countries_reporting_pred =
                r.countries_reporting_pred ?? r.valeur_predite ?? 0;
          });
          dataByCountry[country] = Object.values(byDate);
        });

        // ---- 2. Structures mensuelles -------------------------------------
        const monthlyCases = {};
        const monthlyDeaths = {};
        const monthlySpread = {};

        selectedCountries.forEach((c) => {
          monthlyCases[c] = Array(12).fill(0);
          monthlyDeaths[c] = Array(12).fill(0);
          monthlySpread[c] = Array(12).fill(0);
        });

        selectedCountries.forEach((country) => {
          const rows = dataByCountry[country] || [];
          const temp = {};
          rows.forEach((r) => {
            const month = new Date(r.date).getMonth();
            if (!temp[month])
              temp[month] = { totalCases: 0, totalDeaths: 0, totalSpread: 0, count: 0 };
            temp[month].totalCases += Number(r.nouveaux_cas || 0);
            temp[month].totalDeaths += Number(r.deces || 0);
            temp[month].totalSpread += Number(r.countries_reporting_pred || 0);
            temp[month].count += 1;
          });
          Object.entries(temp).forEach(([m, d]) => {
            monthlyCases[country][m] = Math.round(d.totalCases);
            monthlyDeaths[country][m] = Math.round(d.totalDeaths);
            monthlySpread[country][m] = Math.round(d.totalSpread);
          });
        });

        // ---- 3. Préparation datasets Chart.js ------------------------------
        const labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const colorOf = (c) => COUNTRY_COLORS[c] || `#${Math.floor(Math.random() * 0xffffff).toString(16)}`;

        setCasesData({
          labels,
          datasets: selectedCountries.map((c) => ({
            label: c,
            data: monthlyCases[c],
            borderColor: colorOf(c),
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 2
          }))
        });

        setDeathsData({
          labels,
          datasets: selectedCountries.map((c) => ({
            label: c,
            data: monthlyDeaths[c],
            borderColor: colorOf(c),
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 2
          }))
        });

        // ---- 4. Agrégation par continent ----------------------------------
        const spreadByContinent = {};
        Object.keys(CONTINENTS).forEach((cont) => {
          spreadByContinent[cont] = { total: 0, countries: [] };
        });
        spreadByContinent['Autre'] = { total: 0, countries: [] }; // Ajout pour les pays hors liste

        selectedCountries.forEach((c) => {
          const cont = getContinent(c);
          const spreadArr = monthlySpread[c];
          if (!spreadArr) return;
          const max = Math.max(...spreadArr);
          if (max > 0) {
            spreadByContinent[cont].total += max;
            spreadByContinent[cont].countries.push(c);
          }
        });

        setSpreadData({
          labels: Object.keys(spreadByContinent).filter((k) => spreadByContinent[k].countries.length),
          datasets: [
            {
              label: 'Propagation par continent',
              data: Object.values(spreadByContinent)
                .filter((v) => v.countries.length)
                .map((v) => ({ x: v.total, y: v.countries.join(', '), countries: v.countries.join(', ') })),
              backgroundColor: Object.values(COUNTRY_COLORS).slice(0, 5),
              barThickness: 30
            }
          ]
        });
      } catch (e) {
        console.error(e);
        setError('Erreur lors du chargement des prédictions');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCountries]);

  // ------------------------------ OPTIONS ----------------------------------
  const mkOptions = (title, label) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { usePointStyle: true, pointStyle: 'circle', padding: 20 } },
      title: { display: true, text: title },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} ${label}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: label } },
      x: { title: { display: true, text: 'Mois' } }
    }
  });

  const casesOpts = mkOptions('Nombre de nouveaux cas COVID‑19 prédits par mois (2025)', 'nouveaux cas');
  const deathsOpts = mkOptions('Nombre de décès COVID‑19 prédits par mois (2025)', 'décès');

  const spreadOpts = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Propagation géographique prédite par continent (2025)' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.x;
            const countries = ctx.raw.countries;
            return [`${v.toFixed(0)} pays touchés`, `Pays inclus : ${countries}`];
          }
        }
      }
    },
    scales: {
      x: { beginAtZero: true, title: { display: true, text: 'Nombre de pays touchés' } },
      y: { title: { display: true, text: 'Continents' } }
    }
  };

  // ------------------------------ RENDER ------------------------------------
  // Les prédictions sont toujours disponibles, indépendamment de isDatavizEnabled et isTechnicalEnabled

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Prédictions COVID‑19
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Sélecteur de pays */}
      <Box sx={{ mb: 3 }}>
        <Autocomplete
          multiple
          options={availableCountries}
          value={selectedCountries}
          onChange={(_, v) => v.length <= 5 && setSelectedCountries(v)}
          renderInput={(params) => (
            <TextField {...params} label="Sélectionner les pays (max 5)" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((opt, idx) => {
              const { key, ...rest } = getTagProps({ index: idx });
              return (
                <Chip
                  key={key}
                  label={opt}
                  {...rest}
                  style={{ backgroundColor: COUNTRY_COLORS[opt] || '#888', color: '#fff' }}
                />
              );
            })
          }
          loading={loading}
        />
      </Box>

      {loading ? (
        <Typography>Chargement…</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 500 }}>{casesData && <Line data={casesData} options={casesOpts} />}</Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 500 }}>{deathsData && <Line data={deathsData} options={deathsOpts} />}</Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, height: 600 }}>{spreadData && <Bar data={spreadData} options={spreadOpts} />}</Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default Predictions;
