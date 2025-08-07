import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, Typography, Paper } from '@mui/material';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const CovidChart = ({ data, metric, title }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Aucune donnée à afficher</Typography>
      </Paper>
    );
  }

  // Définir les couleurs pour chaque pays
  const colors = [
    'rgb(255, 99, 132)',
    'rgb(54, 162, 235)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)',
    'rgb(199, 199, 199)',
    'rgb(83, 102, 147)',
  ];

  // Préparer les datasets pour Chart.js
  const datasets = Object.keys(data).map((country, index) => {
    const countryData = data[country];
    const color = colors[index % colors.length];

    return {
      label: country,
      data: countryData.map(item => ({
        x: item.date,
        y: item[metric] || 0
      })),
      borderColor: color,
      backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.2)'),
      tension: 0.1,
      fill: false,
    };
  });

  // Configuration du graphique
  const chartData = {
    datasets: datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'dd/MM/yyyy'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: getYAxisLabel(metric)
        },
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ height: '400px' }}>
        <Line data={chartData} options={options} />
      </Box>
    </Paper>
  );
};

// Fonction utilitaire pour obtenir le label de l'axe Y
const getYAxisLabel = (metric) => {
  const labels = {
    total_cases: 'Cas totaux',
    new_cases: 'Nouveaux cas',
    total_deaths: 'Décès totaux',
    new_deaths: 'Nouveaux décès',
    hosp_patients: 'Patients hospitalisés'
  };
  return labels[metric] || 'Valeur';
};

export default CovidChart;
