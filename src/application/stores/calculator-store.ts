// Application layer - Zustand store for calculator

import { create } from 'zustand';
import type {
  Localidad,
  CotizacionItem,
  Bulto,
  CotizarRequest,
} from '@/domain/calculator/types';
import { PREDEFINED_PACKAGES } from '@/domain/calculator/types';
import { calculatorClient } from '@/infrastructure/api/calculator-client';

interface CalculatorState {
  // Origin and destination
  origenLocalidad: Localidad | null;
  destinoLocalidad: Localidad | null;
  origenSearchTerm: string;
  destinoSearchTerm: string;
  origenSearchResults: Localidad[];
  destinoSearchResults: Localidad[];
  isSearchingOrigen: boolean;
  isSearchingDestino: boolean;
  hasSearchedOrigen: boolean;
  hasSearchedDestino: boolean;

  // Package selection
  selectedPackageType: 'custom' | number; // 'custom' or predefined package ID
  bulto: Bulto;

  // Results
  cotizaciones: CotizacionItem[];
  isLoadingCotizacion: boolean;
  error: string | null;

  // Actions
  setOrigenSearchTerm: (term: string) => void;
  setDestinoSearchTerm: (term: string) => void;
  searchOrigen: (term: string) => Promise<void>;
  searchDestino: (term: string) => Promise<void>;
  selectOrigen: (localidad: Localidad) => void;
  selectDestino: (localidad: Localidad) => void;
  clearOrigen: () => void;
  clearDestino: () => void;
  setSelectedPackageType: (type: 'custom' | number) => void;
  updateBulto: (updates: Partial<Bulto>) => void;
  cotizar: () => Promise<void>;
  reset: () => void;
}

const initialBulto: Bulto = {
  cantidad: 1,
  peso: 0,
  x: 0,
  y: 0,
  z: 0,
  valor_declarado: 0,
};

const initialState = {
  origenLocalidad: null,
  destinoLocalidad: null,
  origenSearchTerm: '',
  destinoSearchTerm: '',
  origenSearchResults: [],
  destinoSearchResults: [],
  isSearchingOrigen: false,
  isSearchingDestino: false,
  hasSearchedOrigen: false,
  hasSearchedDestino: false,
  selectedPackageType: 'custom' as const,
  bulto: initialBulto,
  cotizaciones: [],
  isLoadingCotizacion: false,
  error: null,
};

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  ...initialState,

  setOrigenSearchTerm: (term: string) => {
    set({ origenSearchTerm: term });
  },

  setDestinoSearchTerm: (term: string) => {
    set({ destinoSearchTerm: term });
  },

  searchOrigen: async (term: string) => {
    if (!term || term.length < 2) {
      set({ origenSearchResults: [], isSearchingOrigen: false, hasSearchedOrigen: false });
      return;
    }

    set({ isSearchingOrigen: true });
    try {
      const response = await calculatorClient.searchLocalidades({
        q: term,
        atendida: 1,
      });
      set({ 
        origenSearchResults: response.data.localidades || [],
        hasSearchedOrigen: true,
      });
    } catch (error) {
      console.error('Error searching origen:', error);
      set({ 
        origenSearchResults: [], 
        error: 'Error al buscar localidad',
        hasSearchedOrigen: true,
      });
    } finally {
      set({ isSearchingOrigen: false });
    }
  },

  searchDestino: async (term: string) => {
    if (!term || term.length < 2) {
      set({ destinoSearchResults: [], isSearchingDestino: false, hasSearchedDestino: false });
      return;
    }

    set({ isSearchingDestino: true });
    try {
      const response = await calculatorClient.searchLocalidades({
        q: term,
        atendida: 1,
      });
      set({ 
        destinoSearchResults: response.data.localidades || [],
        hasSearchedDestino: true,
      });
    } catch (error) {
      console.error('Error searching destino:', error);
      set({ 
        destinoSearchResults: [], 
        error: 'Error al buscar localidad',
        hasSearchedDestino: true,
      });
    } finally {
      set({ isSearchingDestino: false });
    }
  },

  selectOrigen: (localidad: Localidad) => {
    set({
      origenLocalidad: localidad,
      origenSearchTerm: localidad.localidad,
      origenSearchResults: [],
      hasSearchedOrigen: false,
      isSearchingOrigen: false,
    });
  },

  selectDestino: (localidad: Localidad) => {
    set({
      destinoLocalidad: localidad,
      destinoSearchTerm: localidad.localidad,
      destinoSearchResults: [],
      hasSearchedDestino: false,
      isSearchingDestino: false,
    });
  },

  clearOrigen: () => {
    set({
      origenLocalidad: null,
      origenSearchTerm: '',
      origenSearchResults: [],
      hasSearchedOrigen: false,
      isSearchingOrigen: false,
    });
  },

  clearDestino: () => {
    set({
      destinoLocalidad: null,
      destinoSearchTerm: '',
      destinoSearchResults: [],
      hasSearchedDestino: false,
      isSearchingDestino: false,
    });
  },

  setSelectedPackageType: (type: 'custom' | number) => {
    set({ selectedPackageType: type });
    if (type !== 'custom') {
      // Reset dimensions when selecting predefined package
      set({
        bulto: {
          ...get().bulto,
          peso: 0,
          x: 0,
          y: 0,
          z: 0,
        },
      });
    }
  },

  updateBulto: (updates: Partial<Bulto>) => {
    set({
      bulto: {
        ...get().bulto,
        ...updates,
      },
    });
  },

  cotizar: async () => {
    const { origenLocalidad, destinoLocalidad, bulto, selectedPackageType } =
      get();

    if (!origenLocalidad || !destinoLocalidad) {
      set({ error: 'Debes seleccionar origen y destino' });
      return;
    }

    if (bulto.cantidad < 1) {
      set({ error: 'La cantidad debe ser al menos 1' });
      return;
    }

    set({ isLoadingCotizacion: true, error: null });

    try {
      // Map package ID to articulos_id
      let articulosId = 0;
      if (selectedPackageType !== 'custom') {
        const selectedPackage = PREDEFINED_PACKAGES.find(
          (pkg) => pkg.id === selectedPackageType
        );
        articulosId = selectedPackage?.articulos_id || 0;
      }

      const request: CotizarRequest = {
        opostal: origenLocalidad.cp,
        dpostal: destinoLocalidad.cp,
        articulos_id: articulosId,
        bultos: [bulto],
      };

      const response = await calculatorClient.cotizar(request);
      set({ cotizaciones: response.data.cotizacion_web });
    } catch (error) {
      console.error('Error al cotizar:', error);
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Error al obtener la cotización',
        cotizaciones: [],
      });
    } finally {
      set({ isLoadingCotizacion: false });
    }
  },

  reset: () => {
    set(initialState);
  },
}));

