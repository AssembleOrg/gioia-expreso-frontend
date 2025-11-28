'use client';

import { Autocomplete, Loader, Text } from '@mantine/core';
import type { Localidad } from '@/domain/calculator/types';
import { useState, useEffect, useRef } from 'react';

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
}: LocalidadAutocompleteProps) {
  const [showNoResults, setShowNoResults] = useState(false);
  const previousValueRef = useRef<string>('');
  const wasSelectedRef = useRef<boolean>(false);

  useEffect(() => {
    // Only show "no results" if:
    // - has searched
    // - not loading
    // - value length >= 2
    // - no search results
    // - AND no localidad is selected
    if (
      hasSearched &&
      !isLoading &&
      value.length >= 2 &&
      searchResults.length === 0 &&
      !selectedLocalidad
    ) {
      setShowNoResults(true);
    } else {
      setShowNoResults(false);
    }
  }, [hasSearched, isLoading, value, searchResults.length, selectedLocalidad]);

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
    
    previousValueRef.current = newValue;
    onChange(newValue);
  };

  const handleOptionSubmit = (optionValue: string) => {
    const selected = data.find((item) => item.value === optionValue);
    if (selected) {
      onSelect(selected.localidad);
      setShowNoResults(false);
      wasSelectedRef.current = true;
      previousValueRef.current = optionValue;
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
