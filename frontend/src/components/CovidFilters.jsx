import React, { useState, useEffect } from 'react';
import { fetchLocations } from '../../services/api';

const CovidFilters = ({ onFiltersChange, loading = false }) => {
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [loadingCountries, setLoadingCountries] = useState(true);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true);
        const data = await fetchLocations();
        setCountries(data);
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
      } finally {
        setLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  const handleCountryChange = (countryId, countryName, checked) => {
    let newSelection;
    if (checked) {
      newSelection = [...selectedCountries, { location_id: countryId, location_name: countryName }];
    } else {
      newSelection = selectedCountries.filter(c => c.location_id !== countryId);
    }
    
    setSelectedCountries(newSelection);
    onFiltersChange({
      countries: newSelection,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
  };

  const handleDateChange = (field, value) => {
    if (field === 'start') {
      setStartDate(value);
      onFiltersChange({
        countries: selectedCountries,
        startDate: new Date(value),
        endDate: new Date(endDate)
      });
    } else {
      setEndDate(value);
      onFiltersChange({
        countries: selectedCountries,
        startDate: new Date(startDate),
        endDate: new Date(value)
      });
    }
  };

  const selectAllEU = () => {
    const euCountries = [
      'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium', 
      'Austria', 'Portugal', 'Greece', 'Czech Republic', 'Hungary', 
      'Sweden', 'Poland', 'Denmark', 'Finland', 'Slovakia', 'Ireland',
      'Croatia', 'Lithuania', 'Slovenia', 'Latvia', 'Estonia', 'Luxembourg',
      'Malta', 'Cyprus', 'Bulgaria', 'Romania'
    ];
    
    const euSelection = countries.filter(country => 
      euCountries.includes(country.location_name)
    ).map(country => ({
      location_id: country.location_id,
      location_name: country.location_name
    }));
    
    setSelectedCountries(euSelection);
    onFiltersChange({
      countries: euSelection,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
  };

  const clearSelection = () => {
    setSelectedCountries([]);
    onFiltersChange({
      countries: [],
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
  };

  return (
    <div className="covid-filters">
      <div className="filters-container">
        <h3>Filtres pour les données COVID-19</h3>
        
        {/* Filtres de dates */}
        <div className="date-filters">
          <div className="date-input">
            <label htmlFor="start-date">Date de début:</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange('start', e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="date-input">
            <label htmlFor="end-date">Date de fin:</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange('end', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Boutons de sélection rapide */}
        <div className="quick-select">
          <button onClick={selectAllEU} disabled={loading || loadingCountries}>
            Sélectionner UE
          </button>
          <button onClick={clearSelection} disabled={loading}>
            Tout désélectionner
          </button>
        </div>

        {/* Sélection des pays */}
        <div className="country-selection">
          <h4>Pays sélectionnés ({selectedCountries.length})</h4>
          
          {loadingCountries ? (
            <p>Chargement des pays...</p>
          ) : (
            <div className="countries-grid">
              {countries.slice(0, 50).map((country) => (
                <label key={country.location_id} className="country-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCountries.some(c => c.location_id === country.location_id)}
                    onChange={(e) => handleCountryChange(
                      country.location_id, 
                      country.location_name, 
                      e.target.checked
                    )}
                    disabled={loading}
                  />
                  <span>{country.location_name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .covid-filters {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .filters-container h3 {
          margin-top: 0;
          color: #333;
        }
        
        .date-filters {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .date-input {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .date-input label {
          font-weight: 500;
          color: #555;
        }
        
        .date-input input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .quick-select {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .quick-select button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .quick-select button:hover:not(:disabled) {
          background: #0056b3;
        }
        
        .quick-select button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .country-selection h4 {
          margin-bottom: 15px;
          color: #333;
        }
        
        .countries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          max-height: 300px;
          overflow-y: auto;
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 4px;
        }
        
        .country-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
        }
        
        .country-checkbox:hover {
          background: #f5f5f5;
        }
        
        .country-checkbox input[type="checkbox"] {
          cursor: pointer;
        }
        
        .country-checkbox span {
          font-size: 14px;
          color: #333;
        }
        
        .country-checkbox:has(input:checked) {
          background: #e3f2fd;
        }
      `}</style>
    </div>
  );
};

export default CovidFilters;
