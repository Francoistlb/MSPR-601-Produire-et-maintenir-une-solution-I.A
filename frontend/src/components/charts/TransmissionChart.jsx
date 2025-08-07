import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const colors = [
  '#FF6384', // Rouge pour Brazil
  '#36A2EB', // Bleu pour China
  '#4BC0C0', // Turquoise pour France
  '#FFCE56', // Jaune pour Germany
  '#9966FF'  // Violet pour United States
];

const TransmissionChart = ({
  predictionsData,
  locations,
  isLoading,
  selectedCountries,
  selectedMetric,
  selectedPredictionType,
  selectedHorizon,
  dateRange
}) => {
  if (isLoading || !predictionsData || !locations) {
    return <div>Chargement des données...</div>;
  }

  // Filtrer les prédictions pour 2025 et les nouveaux cas
  const filteredData = predictionsData.filter(pred => {
    const predDate = new Date(pred.date_predite);
    return (
      pred.indicateur === 'new_cases' &&
      predDate.getFullYear() === 2025 &&
      selectedCountries.some(country => country.location_id === pred.location_id)
    );
  });

  // Grouper les données par pays
  const groupedData = {};
  selectedCountries.forEach(country => {
    groupedData[country.location_name] = filteredData
      .filter(pred => pred.location_id === country.location_id)
      .sort((a, b) => new Date(a.date_predite) - new Date(b.date_predite));
  });

  // Préparer les données pour le graphique
  const labels = Array.from(new Set(filteredData.map(pred => 
    format(new Date(pred.date_predite), 'MMM yyyy', { locale: fr })
  ))).sort((a, b) => new Date(a) - new Date(b));

  const datasets = selectedCountries.map((country, index) => ({
    label: country.location_name,
    data: groupedData[country.location_name].map(pred => pred.valeur_predite),
    borderColor: colors[index % colors.length],
    backgroundColor: colors[index % colors.length] + '40',
    tension: 0.4,
    pointRadius: 2,
    borderWidth: 2,
    fill: false
  }));

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Évolution des nouveaux cas par pays en 2025',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 20,
          bottom: 20
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString('fr-FR')} cas`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f0f0f0'
        },
        ticks: {
          font: {
            size: 12
          },
          callback: function(value) {
            return value.toLocaleString('fr-FR');
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px',
      height: '500px'
    }}>
      <Line data={{ labels, datasets }} options={options} />
    </div>
  );
};

export default TransmissionChart; 