import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  MenuItem, 
  Select, 
  TextField, 
  Checkbox, 
  ListItemText, 
  OutlinedInput,
  Chip,
  Box,
  Typography
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import frLocale from 'date-fns/locale/fr';

const CovidArchiveFilter = ({ 
  selectedCountries,
  onCountriesChange,
  countries,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  const handleCountryChange = (event) => {
    const value = event.target.value;
    onCountriesChange(typeof value === 'string' ? value.split(',') : value);
  };

  const handleDeleteCountry = (countryToDelete) => {
    onCountriesChange(selectedCountries.filter(country => country.location_id !== countryToDelete.location_id));
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Sélection multiple des pays */}
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Sélectionner des pays (A-Z)</InputLabel>
          <Select
            multiple
            value={selectedCountries}
            onChange={handleCountryChange}
            input={<OutlinedInput label="Sélectionner des pays (A-Z)" />}
            renderValue={() => `${selectedCountries.length} pays sélectionnés`}
            data-testid="country-filter"
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                  width: 350,
                },
              },
            }}
          >
            {countries.map((country) => (
              <MenuItem key={country.location_id} value={country} data-testid={`country-option-${country.location_name}`}>
                <Checkbox checked={selectedCountries.some(c => c.location_id === country.location_id)} />
                <ListItemText primary={country.location_name} />
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
            renderInput={(params) => <TextField {...params} sx={{ minWidth: 150 }} />}
          />
          <DatePicker
            label="Date de fin"
            value={endDate}
            onChange={onEndDateChange}
            renderInput={(params) => <TextField {...params} sx={{ minWidth: 150 }} />}
          />
        </LocalizationProvider>
      </Box>

      {/* Affichage des pays sélectionnés */}
      {selectedCountries.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Pays sélectionnés ({selectedCountries.length}) :
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedCountries.map((country) => (
              <Chip
                key={country.location_id}
                label={country.location_name}
                onDelete={() => handleDeleteCountry(country)}
                color="primary"
                variant="outlined"
                size="small"
                data-testid={`selected-country-${country.location_name}`}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CovidArchiveFilter;
