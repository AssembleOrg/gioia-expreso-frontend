'use client';

import { Autocomplete, Loader } from '@mantine/core';
import type { Localidad } from '@/domain/calculator/types';
import { useEffect, useRef } from 'react';

interface LocalidadAutocompleteProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (localidad: Localidad) => void;
  onClear?: () => void;
  searchResults: Localidad[];
  isLoading: boolean;
  selectedLocalidad: Localidad | null;
  error?: string;
  required?: boolean;
  hasSearched?: boolean;
  disabled?: boolean;
}

export function LocalidadAutocomplete({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  onClear,
  searchResults,
  isLoading,
  selectedLocalidad,
  error,
  required = false,
  hasSearched = false,
  disabled = false,
}: LocalidadAutocompleteProps) {
  const previousValueRef = useRef<string>('');
  const wasSelectedRef = useRef<boolean>(false);
  
  // Calculate showNoResults based on current state (avoid setState in effect)
  const showNoResults = 
    hasSearched &&
    !isLoading &&
    value.length >= 2 &&
    searchResults.length === 0 &&
    !selectedLocalidad;

  // Track when a location is selected
  useEffect(() => {
    if (selectedLocalidad) {
      wasSelectedRef.current = true;
      previousValueRef.current = value;
    } else {
      wasSelectedRef.current = false;
    }
  }, [selectedLocalidad, value]);

  const data = searchResults.map((localidad) => ({
    value: `${localidad.localidad}, ${localidad.provincia_nombre} (${localidad.cp})`,
    localidad,
  }));

  const handleChange = (newValue: string) => {
    // If a location was selected and user is deleting characters, clear everything
    if (wasSelectedRef.current && selectedLocalidad && newValue.length < previousValueRef.current.length) {
      // Clear the selection
      onChange('');
      // Reset selection state
      wasSelectedRef.current = false;
      previousValueRef.current = '';
      // Clear the selected location
      if (onClear) {
        onClear();
      }
      return;
    }
    
    // If the new value matches a selected option (includes CP), keep it as is
    // This happens when an option is selected from the dropdown
    const matchesSelectedOption = data.some(item => item.value === newValue);
    if (matchesSelectedOption) {
      previousValueRef.current = newValue;
      onChange(newValue);
      return;
    }
    
    // Extract only the localidad and provincia name (remove CP if present) for search
    // Format: "Localidad, Provincia (CP)" -> "Localidad, Provincia"
    // Only remove the CP part at the end, don't trim the whole string to preserve spaces
    // This is for when the user is typing manually
    const cleanValue = newValue.replace(/\s*\([^)]*\)\s*$/, '');
    
    previousValueRef.current = newValue;
    onChange(cleanValue);
  };

  const handleOptionSubmit = (optionValue: string) => {
    const selected = data.find((item) => item.value === optionValue);
    if (selected) {
      // Set the value with CP when selecting
      wasSelectedRef.current = true;
      previousValueRef.current = optionValue;
      onChange(optionValue);
      onSelect(selected.localidad);
    }
  };

  return (
    <div>
      <Autocomplete
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        data={data}
        rightSection={isLoading ? <Loader size={16} /> : null}
        onOptionSubmit={handleOptionSubmit}
        error={
          error ||
          (showNoResults && !isLoading && value.length >= 2 && !selectedLocalidad
            ? 'No se encontraron resultados'
            : undefined)
        }
        required={required}
        disabled={disabled}
        styles={{
          option: {
            color: 'var(--mantine-color-dark-7)',
            '&[data-hovered]': {
              backgroundColor: 'var(--mantine-color-magenta-1)',
            },
            '&[data-selected]': {
              backgroundColor: 'var(--mantine-color-magenta-6)',
              color: 'white',
            },
          },
        }}
      />
    </div>
  );
}
