import React from 'react';
import { FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import frLocale from 'date-fns/locale/fr';

// Types de prédiction disponibles
export const PREDICTION_TYPES = {
  NEW_CASES: 'new_cases',
  NEW_DEATHS: 'new_deaths',
  COUNTRIES_REPORTING: 'countries_reporting'
};

// Labels pour l'affichage des types de prédiction
export const PREDICTION_TYPE_LABELS = {
  [PREDICTION_TYPES.NEW_CASES]: 'Nouveaux cas',
  [PREDICTION_TYPES.NEW_DEATHS]: 'Nouveaux décès',
  [PREDICTION_TYPES.COUNTRIES_REPORTING]: 'Pays rapportant des cas'
};

const FilterBar = ({ 
  selectedPredictionType,
  onPredictionTypeChange,
  selectedCountry,
  onCountryChange,
  countries,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  return (
    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
      {/* Type de prédiction */}
      <FormControl style={{ minWidth: 200 }}>
        <InputLabel>Type de prédiction</InputLabel>
        <Select
          value={selectedPredictionType}
          onChange={(e) => onPredictionTypeChange(e.target.value)}
          label="Type de prédiction"
        >
          {Object.entries(PREDICTION_TYPE_LABELS).map(([value, label]) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Sélection du pays */}
      <FormControl style={{ minWidth: 200 }}>
        <InputLabel>Pays</InputLabel>
        <Select
          value={selectedCountry || ''}
          onChange={(e) => onCountryChange(e.target.value)}
          label="Pays"
        >
          {countries.map((country) => (
            <MenuItem key={country.location_id} value={country}>
              {country.location_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Sélection des dates */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
        <DatePicker
          label="Date de début"
          value={startDate}
          onChange={onStartDateChange}
          renderInput={(params) => <TextField {...params} />}
        />
        <DatePicker
          label="Date de fin"
          value={endDate}
          onChange={onEndDateChange}
          renderInput={(params) => <TextField {...params} />}
        />
      </LocalizationProvider>
    </div>
  );
};

export default FilterBar; 