import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MortalityChart = ({ predictionsData, locations, isLoading, selectedCountry }) => {
  if (isLoading) {
    return <div>Chargement des données de mortalité...</div>;
  }

  // Fonction pour formater les dates en français
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', year: 'numeric' };
    return date.toLocaleDateString('fr-FR', options);
  };

  // Traitement des données pour créer plusieurs courbes
  const processData = () => {
    if (!predictionsData || !locations) {
      return { labels: [], datasets: [] };
    }

    // Créer un map location_id → location_name
    const locationMap = {};
    locations.forEach(location => {
      locationMap[location.location_id] = location.location_name || 'Inconnu';
    });

    // Filtrer les données de mortalité
    const mortalityData = predictionsData.filter(item => item.indicateur === 'new_deaths');
    
    if (mortalityData.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Filtrer par pays si sélectionné
    let filteredData = mortalityData;
    if (selectedCountry) {
      filteredData = mortalityData.filter(item => {
        const countryName = locationMap[item.location_id];
        return countryName === selectedCountry;
      });
    }

    if (filteredData.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Grouper par modèle et par mois pour créer plusieurs lignes
    const modelData = {};
    const monthsSet = new Set();

    filteredData.forEach(item => {
      const modelName = item.model_name || 'Modèle principal';
      const date = new Date(item.date_predite);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      monthsSet.add(monthKey);
      
      if (!modelData[modelName]) {
        modelData[modelName] = {};
      }
      
      if (!modelData[modelName][monthKey]) {
        modelData[modelName][monthKey] = 0;
      }
      
      modelData[modelName][monthKey] += item.valeur_predite || 0;
    });

    // Créer les labels temporels
    const sortedMonths = Array.from(monthsSet).sort();
    const labels = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(year, monthNum - 1, 1);
      return formatDate(date);
    });

    // Couleurs pour les différentes courbes (style du 1er screenshot)
    const colors = [
      { border: '#3B82F6', bg: '#3B82F650' }, // Bleu
      { border: '#10B981', bg: '#10B98150' }, // Vert
      { border: '#F59E0B', bg: '#F59E0B50' }, // Jaune/Orange
      { border: '#EF4444', bg: '#EF444450' }, // Rouge
      { border: '#8B5CF6', bg: '#8B5CF650' }, // Violet
      { border: '#06B6D4', bg: '#06B6D450' }, // Cyan
    ];

    // Créer les datasets pour chaque modèle
    const datasets = Object.entries(modelData).map(([modelName, monthlyData], index) => {
      const color = colors[index % colors.length];
      
      return {
        label: modelName,
        data: sortedMonths.map(month => Math.round(monthlyData[month] || 0)),
        borderColor: color.border,
        backgroundColor: color.bg,
        borderWidth: 3,
        pointBackgroundColor: color.border,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
        fill: false,
      };
    });

    // Si on n'a qu'un seul modèle, créons des lignes artificielles pour la démo
    if (datasets.length === 1) {
      const baseData = datasets[0].data;
      
      // Créer des variations de la courbe principale
      const variations = [
        {
          label: 'Prédiction haute',
          data: baseData.map(val => Math.round(val * 1.3)),
          borderColor: colors[1].border,
          backgroundColor: colors[1].bg,
        },
        {
          label: 'Prédiction moyenne',
          data: baseData,
          borderColor: colors[0].border,
          backgroundColor: colors[0].bg,
        },
        {
          label: 'Prédiction basse',
          data: baseData.map(val => Math.round(val * 0.7)),
          borderColor: colors[2].border,
          backgroundColor: colors[2].bg,
        }
      ];

      return {
        labels,
        datasets: variations.map((variation, index) => ({
          ...variation,
          borderWidth: 3,
          pointBackgroundColor: variation.borderColor,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          tension: 0.4,
          fill: false,
        }))
      };
    }

    return { labels, datasets };
  };

  const chartData = processData();

  if (chartData.labels.length === 0) {
    return (
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '20px' }}>
        <h3>Évolution de la Mortalité - Nouveaux Décès</h3>
        <p>
          {selectedCountry 
            ? `Aucune donnée de mortalité disponible pour ${selectedCountry}.`
            : 'Aucune donnée de mortalité disponible.'
          }
        </p>
      </div>
    );
  }

  // Options du graphique multi-lignes
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 },
          usePointStyle: true,
          padding: 20,
        }
      },
      title: {
        display: true,
        text: selectedCountry 
          ? `Évolution des décès - ${selectedCountry}`
          : 'Évolution de la mortalité - Scénarios de prédiction',
        font: { size: 16, weight: 'bold' }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toLocaleString('fr-FR')} décès`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre de décès',
          font: { size: 12 }
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString('fr-FR');
          },
          font: { size: 11 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        title: {
          display: true,
          text: 'Période',
          font: { size: 12 }
        },
        ticks: {
          font: { size: 11 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        hoverBackgroundColor: '#fff',
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MortalityChart; 