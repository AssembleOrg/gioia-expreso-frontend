'use client';

import { TextInput, TextInputProps } from '@mantine/core';
import { useState, useEffect, useRef } from 'react';

interface CurrencyInputProps extends Omit<TextInputProps, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

export function CurrencyInput({ value, onChange, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('');
  const isInternalUpdateRef = useRef(false);

  // Format number to ARS format: 1.234,56 (dot for thousands, comma for decimals)
  const formatARS = (num: number): string => {
    if (isNaN(num) || num === null || num === undefined || num === 0) return '';
    
    const parts = num.toFixed(2).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Add thousands separators (dots)
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formattedInteger},${decimalPart}`;
  };

  // Parse input string to number
  const parseInput = (str: string): number => {
    if (!str || str.trim() === '') return 0;
    
    // Remove all dots (thousands separators)
    let cleaned = str.replace(/\./g, '');
    
    // Handle comma as decimal separator
    if (cleaned.includes(',')) {
      cleaned = cleaned.replace(',', '.');
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Initialize display value from prop value
  useEffect(() => {
    if (!isInternalUpdateRef.current) {
      if (value > 0) {
        setDisplayValue(formatARS(value));
      } else {
        setDisplayValue('');
      }
    }
    isInternalUpdateRef.current = false;
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    
    // Remove all non-digit characters except comma
    let cleaned = inputValue.replace(/[^\d,]/g, '');
    
    // Handle decimal separator - only allow one comma
    const commaCount = (cleaned.match(/,/g) || []).length;
    if (commaCount > 1) {
      // Keep only the first comma
      const firstCommaIndex = cleaned.indexOf(',');
      cleaned = cleaned.substring(0, firstCommaIndex + 1) + cleaned.substring(firstCommaIndex + 1).replace(/,/g, '');
    }
    
    // Limit decimal places to 2 if comma exists
    if (cleaned.includes(',')) {
      const parts = cleaned.split(',');
      if (parts.length > 1 && parts[1].length > 2) {
        cleaned = `${parts[0]},${parts[1].substring(0, 2)}`;
      }
    }
    
    // Format the integer part with thousands separators
    let formatted = cleaned;
    if (cleaned.includes(',')) {
      const [integerPart, decimalPart] = cleaned.split(',');
      // Remove any existing dots from integer part
      const cleanInteger = integerPart.replace(/\./g, '');
      // Add thousands separators
      const formattedInteger = cleanInteger.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      formatted = `${formattedInteger},${decimalPart || ''}`;
    } else {
      // No decimal part, just format integer with thousands separators
      const cleanInteger = cleaned.replace(/\./g, '');
      if (cleanInteger) {
        formatted = cleanInteger.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      }
    }
    
    isInternalUpdateRef.current = true;
    setDisplayValue(formatted);
    const numValue = parseInput(formatted);
    onChange(numValue);
  };

  const handleBlur = () => {
    // On blur, ensure proper formatting with 2 decimals
    const numValue = parseInput(displayValue);
    isInternalUpdateRef.current = true;
    
    if (numValue > 0) {
      onChange(numValue);
      setDisplayValue(formatARS(numValue));
    } else {
      setDisplayValue('');
      onChange(0);
    }
  };

  return (
    <TextInput
      {...props}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={props.placeholder || '0,00'}
    />
  );
}
