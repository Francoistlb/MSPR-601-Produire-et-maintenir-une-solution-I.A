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

const CovidArchiveChart = ({ data, metric, title }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <p>Aucune donnée disponible pour ce graphique</p>
      </div>
    );
  }

  // Couleurs simples et distinctes
  const colors = [
    '#2563eb', // Bleu
    '#dc2626', // Rouge
    '#16a34a', // Vert
    '#ea580c', // Orange
    '#7c3aed', // Violet
    '#f59e0b', // Jaune
    '#06b6d4', // Cyan
    '#ec4899', // Rose
  ];

  // Créer les datasets de manière simple et robuste
  const datasets = Object.keys(data).map((country, index) => {
    const color = colors[index % colors.length];
    
    // Traitement simple des données avec nettoyage agressif
    const processedData = data[country]
      .filter(item => {
        // Filtrer plus strictement
        return item && 
               item.date && 
               item[metric] !== null && 
               item[metric] !== undefined && 
               !isNaN(Number(item[metric])) &&
               Number(item[metric]) >= 0; // Éviter les valeurs négatives
      })
      .map(item => ({
        x: item.date,
        y: Number(item[metric])
      }));

    return {
      label: country,
      data: processedData,
      borderColor: color,
      backgroundColor: color + '15', // Transparence très légère
      borderWidth: 3, // Lignes plus épaisses pour la visibilité
      pointRadius: 0, // Pas de points pour un rendu plus propre
      pointHoverRadius: 5, // Points visibles au hover
      pointBackgroundColor: color,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      fill: false,
      tension: 0.0, // Lignes droites, pas de courbes
      spanGaps: true // Connecter les gaps pour éviter les pointillés
    };
  });

  const chartData = {
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            size: 12,
            weight: 'bold'
          },
          boxWidth: 12,
          boxHeight: 12
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: 15
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 13,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toLocaleString('fr-FR')}`;
          },
          title: function(tooltipItems) {
            if (tooltipItems.length > 0) {
              const date = new Date(tooltipItems[0].parsed.x);
              return date.toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: {
            month: 'MMM yyyy'
          }
        },
        title: {
          display: true,
          text: 'Période',
          font: {
            size: 13,
            weight: 'bold'
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          maxRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: getYAxisLabel(metric),
          font: {
            size: 13,
            weight: 'bold'
          }
        },
        ticks: {
          callback: function(value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'k';
            }
            return value.toLocaleString('fr-FR');
          },
          font: {
            size: 11
          }
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: {
        borderWidth: 3 // S'assurer que les lignes sont épaisses
      },
      point: {
        radius: 0,
        hoverRadius: 5
      }
    }
  };

  return (
    <div style={{ height: '450px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

// Fonction utilitaire pour obtenir le label de l'axe Y selon la métrique
const getYAxisLabel = (metric) => {
  switch (metric) {
    case 'new_cases':
      return 'Nouveaux cas par jour';
    case 'new_deaths':
      return 'Nouveaux décès par jour';
    case 'total_cases':
      return 'Cas totaux cumulés';
    case 'total_deaths':
      return 'Décès totaux cumulés';
    case 'hosp_patients':
      return 'Patients hospitalisés';
    default:
      return 'Valeur';
  }
};

export default CovidArchiveChart;
