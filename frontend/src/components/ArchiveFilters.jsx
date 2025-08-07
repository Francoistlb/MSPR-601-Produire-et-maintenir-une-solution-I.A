import React, { useState, useEffect } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Box, 
  FormControl, 
  FormLabel, 
  FormControlLabel, 
  Radio, 
  RadioGroup, 
  Chip, 
  Autocomplete, 
  TextField,
  Typography,
  Button
} from '@mui/material';
import { fetchLocations } from '../../services/api';

const ArchiveFilters = ({ onFiltersChange, initialFilters = {} }) => {
  const [selectedCountries, setSelectedCountries] = useState(initialFilters.countries || []);
  const [selectedMetric, setSelectedMetric] = useState(initialFilters.metric || 'new_cases');
  const [startDate, setStartDate] = useState(initialFilters.startDate || new Date('2020-01-01'));
  const [endDate, setEndDate] = useState(initialFilters.endDate || new Date('2024-08-14'));
  const [availableCountries, setAvailableCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger la liste des pays disponibles
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        const countries = await fetchLocations();
        setAvailableCountries(countries);
      } catch (error) {
        console.error('Erreur lors du chargement des pays:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  // Déclencher le callback quand les filtres changent
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange({
        countries: selectedCountries,
        metric: selectedMetric,
        startDate,
        endDate
      });
    }
  }, [selectedCountries, selectedMetric, startDate, endDate, onFiltersChange]);

  const handleCountryChange = (event, newValue) => {
    setSelectedCountries(newValue);
  };

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  const clearFilters = () => {
    setSelectedCountries([]);
    setSelectedMetric('new_cases');
    setStartDate(new Date('2020-01-01'));
    setEndDate(new Date('2024-08-14'));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, mb: 3 }}>
        {/* Sélection des pays */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Sélectionner des pays:
          </Typography>
          <Autocomplete
            multiple
            options={availableCountries}
            getOptionLabel={(option) => option.location_name}
            value={selectedCountries}
            onChange={handleCountryChange}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={selectedCountries.length === 0 ? "Choisir des pays..." : ""}
                variant="outlined"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.location_id}
                  label={option.location_name}
                  color="primary"
                  variant="outlined"
                />
              ))
            }
            isOptionEqualToValue={(option, value) => option.location_id === value.location_id}
            sx={{ mb: 2 }}
          />
        </Box>

        {/* Sélection de la métrique */}
        <Box sx={{ mb: 3 }}>
          <FormControl>
            <FormLabel component="legend">
              <Typography variant="h6">Sélectionner une métrique:</Typography>
            </FormLabel>
            <RadioGroup
              row
              value={selectedMetric}
              onChange={handleMetricChange}
              sx={{ mt: 1 }}
            >
              <FormControlLabel 
                value="total_cases" 
                control={<Radio />} 
                label="Cas totaux" 
              />
              <FormControlLabel 
                value="new_cases" 
                control={<Radio />} 
                label="Nouveaux cas" 
              />
              <FormControlLabel 
                value="total_deaths" 
                control={<Radio />} 
                label="Décès totaux" 
              />
              <FormControlLabel 
                value="new_deaths" 
                control={<Radio />} 
                label="Nouveaux décès" 
              />
              <FormControlLabel 
                value="hosp_patients" 
                control={<Radio />} 
                label="Hospitalisations" 
              />
            </RadioGroup>
          </FormControl>
        </Box>

        {/* Plage de dates */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Plage de dates:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <DatePicker
              label="Date de début"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => <TextField {...params} />}
              maxDate={endDate}
            />
            <Typography>→</Typography>
            <DatePicker
              label="Date de fin"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              renderInput={(params) => <TextField {...params} />}
              minDate={startDate}
            />
          </Box>
        </Box>

        {/* Bouton pour vider les filtres */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={clearFilters}>
            Réinitialiser les filtres
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default ArchiveFilters;
