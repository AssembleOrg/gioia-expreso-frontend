// Mantine theme configuration with brand colors
// Based on logo: grey (#808080 range) and deep magenta/maroon (#8B1A3D range)

import { createTheme, MantineColorsTuple } from '@mantine/core';

// Deep magenta/maroon color (from logo "G")
const magenta: MantineColorsTuple = [
  '#ffe5f0',
  '#ffcce0',
  '#ff99c1',
  '#ff66a2',
  '#ff3383',
  '#ff0064',
  '#cc0050',
  '#99003c',
  '#8B1A3D', // Primary brand color
  '#660028',
];

// Grey color (from logo "T")
const grey: MantineColorsTuple = [
  '#f5f5f5',
  '#e8e8e8',
  '#d1d1d1',
  '#b4b4b4',
  '#9a9a9a',
  '#808080', // Primary grey
  '#666666',
  '#4d4d4d',
  '#333333',
  '#1a1a1a',
];

export const theme = createTheme({
  primaryColor: 'magenta',
  colors: {
    magenta,
    grey,
  },
  fontFamily: 'Poppins, system-ui, sans-serif',
  headings: {
    fontFamily: 'Poppins, system-ui, sans-serif',
    fontWeight: '900',
    sizes: {
      h1: { fontSize: '2.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', lineHeight: '1.3' },
      h3: { fontSize: '1.5rem', lineHeight: '1.4' },
      h4: { fontSize: '1.25rem', lineHeight: '1.5' },
    },
  },
  defaultRadius: 'md',
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05)',
    sm: '0 2px 4px rgba(0, 0, 0, 0.08)',
    md: '0 4px 8px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.2)',
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
          transition: 'all 0.2s ease',
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
    },
    Autocomplete: {
      defaultProps: {
        radius: 'md',
        size: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        size: 'xl',
      },
      styles: {
        content: {
          backgroundColor: 'white',
        },
        title: {
          fontSize: '1.5rem',
          fontWeight: 900,
          color: 'var(--mantine-color-dark-9)',
        },
        body: {
          color: 'var(--mantine-color-dark-7)',
        },
      },
    },
    Alert: {
      styles: {
        message: {
          color: 'var(--mantine-color-dark-7)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
        },
        title: {
          fontWeight: 900,
          color: 'var(--mantine-color-dark-9)',
        },
      },
    },
  },
});
