import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GeographicSpreadChart = ({ predictionsData, locations, isLoading, selectedCountry }) => {
  if (isLoading) {
    return <div>Chargement des données géographiques...</div>;
  }

  // Mapping pays → continent
  const getContinent = (countryName) => {
    const continentMap = {
      // Afrique
      'Afghanistan': 'Asie', 'Africa': 'Afrique', 'Algeria': 'Afrique', 'Angola': 'Afrique', 
      'Benin': 'Afrique', 'Botswana': 'Afrique', 'Burkina Faso': 'Afrique', 'Burundi': 'Afrique',
      'Cameroon': 'Afrique', 'Cape Verde': 'Afrique', 'Central African Republic': 'Afrique',
      'Chad': 'Afrique', 'Comoros': 'Afrique', 'Congo': 'Afrique', 'Cote d\'Ivoire': 'Afrique',
      'Democratic Republic of Congo': 'Afrique', 'Djibouti': 'Afrique', 'Egypt': 'Afrique',
      'Equatorial Guinea': 'Afrique', 'Eritrea': 'Afrique', 'Eswatini': 'Afrique', 'Ethiopia': 'Afrique',
      'Gabon': 'Afrique', 'Gambia': 'Afrique', 'Ghana': 'Afrique', 'Guinea': 'Afrique',
      'Guinea-Bissau': 'Afrique', 'Kenya': 'Afrique', 'Lesotho': 'Afrique', 'Liberia': 'Afrique',
      'Libya': 'Afrique', 'Madagascar': 'Afrique', 'Malawi': 'Afrique', 'Mali': 'Afrique',
      'Mauritania': 'Afrique', 'Mauritius': 'Afrique', 'Morocco': 'Afrique', 'Mozambique': 'Afrique',
      'Namibia': 'Afrique', 'Niger': 'Afrique', 'Nigeria': 'Afrique', 'Rwanda': 'Afrique',
      'Sao Tome and Principe': 'Afrique', 'Senegal': 'Afrique', 'Seychelles': 'Afrique',
      'Sierra Leone': 'Afrique', 'Somalia': 'Afrique', 'South Africa': 'Afrique', 'South Sudan': 'Afrique',
      'Sudan': 'Afrique', 'Tanzania': 'Afrique', 'Togo': 'Afrique', 'Tunisia': 'Afrique',
      'Uganda': 'Afrique', 'Zambia': 'Afrique', 'Zimbabwe': 'Afrique',
      
      // Asie
      'China': 'Asie', 'India': 'Asie', 'Japan': 'Asie', 'South Korea': 'Asie', 'Thailand': 'Asie',
      'Vietnam': 'Asie', 'Philippines': 'Asie', 'Indonesia': 'Asie', 'Malaysia': 'Asie', 'Singapore': 'Asie',
      'Bangladesh': 'Asie', 'Pakistan': 'Asie', 'Iran': 'Asie', 'Iraq': 'Asie', 'Saudi Arabia': 'Asie',
      'Turkey': 'Asie', 'Kazakhstan': 'Asie', 'Uzbekistan': 'Asie', 'Mongolia': 'Asie',
      'Nepal': 'Asie', 'Sri Lanka': 'Asie', 'Myanmar': 'Asie', 'Cambodia': 'Asie', 'Laos': 'Asie',
      
      // Europe
      'Albania': 'Europe', 'Armenia': 'Europe', 'Austria': 'Europe', 'Belarus': 'Europe', 'Belgium': 'Europe',
      'Bosnia and Herzegovina': 'Europe', 'Bulgaria': 'Europe', 'Croatia': 'Europe', 'Cyprus': 'Europe',
      'Czech Republic': 'Europe', 'Denmark': 'Europe', 'Estonia': 'Europe', 'Finland': 'Europe',
      'France': 'Europe', 'Germany': 'Europe', 'Greece': 'Europe', 'Hungary': 'Europe', 'Iceland': 'Europe',
      'Ireland': 'Europe', 'Italy': 'Europe', 'Latvia': 'Europe', 'Lithuania': 'Europe', 'Luxembourg': 'Europe',
      'Malta': 'Europe', 'Moldova': 'Europe', 'Montenegro': 'Europe', 'Netherlands': 'Europe',
      'North Macedonia': 'Europe', 'Norway': 'Europe', 'Poland': 'Europe', 'Portugal': 'Europe',
      'Romania': 'Europe', 'Russia': 'Europe', 'Serbia': 'Europe', 'Slovakia': 'Europe', 'Slovenia': 'Europe',
      'Spain': 'Europe', 'Sweden': 'Europe', 'Switzerland': 'Europe', 'Ukraine': 'Europe', 'United Kingdom': 'Europe',
      
      // Amérique du Nord
      'United States': 'Amérique du Nord', 'Canada': 'Amérique du Nord', 'Mexico': 'Amérique du Nord',
      
      // Amérique du Sud
      'Argentina': 'Amérique du Sud', 'Bolivia': 'Amérique du Sud', 'Brazil': 'Amérique du Sud',
      'Chile': 'Amérique du Sud', 'Colombia': 'Amérique du Sud', 'Ecuador': 'Amérique du Sud',
      'Guyana': 'Amérique du Sud', 'Paraguay': 'Amérique du Sud', 'Peru': 'Amérique du Sud',
      'Suriname': 'Amérique du Sud', 'Uruguay': 'Amérique du Sud', 'Venezuela': 'Amérique du Sud',
      
      // Océanie
      'Australia': 'Océanie', 'New Zealand': 'Océanie', 'Fiji': 'Océanie', 'Papua New Guinea': 'Océanie'
    };
    
    return continentMap[countryName] || 'Autre';
  };

  // Traitement des données pour compter les pays par continent
  const processData = () => {
    if (!predictionsData || !locations) {
      return { labels: [], datasets: [] };
    }

    // Créer un map location_id → location_name
    const locationMap = {};
    locations.forEach(location => {
      locationMap[location.location_id] = location.location_name || 'Inconnu';
    });

    // Filtrer les données de propagation géographique
    const geoData = predictionsData.filter(item => item.indicateur === 'countries_reporting');
    
    if (geoData.length === 0) {
      return { labels: [], datasets: [] };
    }

    // Compter les pays uniques rapportant des cas par continent
    const countriesReporting = new Set();
    geoData.forEach(item => {
      if (item.valeur_predite > 0) {
        countriesReporting.add(item.location_id);
      }
    });

    // Grouper par continent
    const continentCounts = {};
    countriesReporting.forEach(locationId => {
      const countryName = locationMap[locationId];
      const continent = getContinent(countryName);
      
      if (!continentCounts[continent]) {
        continentCounts[continent] = 0;
      }
      continentCounts[continent]++;
    });

    // Trier par nombre de pays (décroissant)
    const sortedContinents = Object.entries(continentCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6); // Top 6 continents

    const labels = sortedContinents.map(([continent]) => continent);
    const data = sortedContinents.map(([, count]) => count);

    // Couleurs style graphique horizontal
    const backgroundColors = [
      'rgba(54, 162, 235, 0.8)',   // Bleu
      'rgba(34, 197, 94, 0.8)',    // Vert
      'rgba(255, 193, 7, 0.8)',    // Jaune
      'rgba(255, 99, 132, 0.8)',   // Rouge
      'rgba(153, 102, 255, 0.8)',  // Violet
      'rgba(255, 159, 64, 0.8)',   // Orange
    ];

    return {
      labels,
      datasets: [
        {
          label: 'Nombre de pays touchés',
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartData = processData();

  if (chartData.labels.length === 0) {
    return (
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '20px' }}>
        <h3>Propagation Géographique par Continent</h3>
        <p>Aucune donnée de propagation géographique disponible.</p>
      </div>
    );
  }

  // Options pour graphique horizontal
  const options = {
    indexAxis: 'y', // Barres horizontales
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Masquer la légende
      },
      title: {
        display: true,
        text: 'Nombre de pays touchés par continent',
        font: { size: 16 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.x} pays touchés`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 12 }
        }
      },
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 12 }
        },
        title: {
          display: true,
          text: 'Nombre de pays'
        }
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '400px', marginBottom: '20px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default GeographicSpreadChart; 