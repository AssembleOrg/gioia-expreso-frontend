// Application layer - Zustand store for calculator

import { create } from 'zustand';
import type {
  Localidad,
  CotizacionItem,
  Bulto,
  CotizarRequest,
  FilialPublic,
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

  // Filiales
  origenFilial: FilialPublic | null;
  destinoFilial: FilialPublic | null;
  isLoadingFilial: boolean;

  // Actions
  setOrigenSearchTerm: (term: string) => void;
  setDestinoSearchTerm: (term: string) => void;
  searchOrigen: (term: string) => Promise<void>;
  searchDestino: (term: string) => Promise<void>;
  selectOrigen: (localidad: Localidad) => Promise<void>;
  selectDestino: (localidad: Localidad) => Promise<void>;
  clearOrigen: () => void;
  clearDestino: () => void;
  setSelectedPackageType: (type: 'custom' | number) => void;
  updateBulto: (updates: Partial<Bulto>) => void;
  cotizar: () => Promise<void>;
  getFilial: (coberturaId: number, type: 'origen' | 'destino') => Promise<void>;
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
  origenFilial: null,
  destinoFilial: null,
  isLoadingFilial: false,
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

    // Clean the term: remove CP if present (format: "Localidad, Provincia (CP)" -> "Localidad, Provincia")
    const cleanTerm = term.replace(/\s*\([^)]*\)\s*$/, '').trim();

    set({ isSearchingOrigen: true });
    try {
      const response = await calculatorClient.searchLocalidades({
        q: cleanTerm,
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

    // Clean the term: remove CP if present (format: "Localidad, Provincia (CP)" -> "Localidad, Provincia")
    const cleanTerm = term.replace(/\s*\([^)]*\)\s*$/, '').trim();

    set({ isSearchingDestino: true });
    try {
      const response = await calculatorClient.searchLocalidades({
        q: cleanTerm,
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

  selectOrigen: async (localidad: Localidad) => {
    set({
      origenLocalidad: localidad,
      origenSearchTerm: `${localidad.localidad}, ${localidad.provincia_nombre} (${localidad.cp})`,
      origenSearchResults: [],
      hasSearchedOrigen: false,
      isSearchingOrigen: false,
    });

    // Get filial if cobertura is available
    if (localidad.cobertura) {
      await get().getFilial(localidad.cobertura, 'origen');
    }
  },

  selectDestino: async (localidad: Localidad) => {
    set({
      destinoLocalidad: localidad,
      destinoSearchTerm: `${localidad.localidad}, ${localidad.provincia_nombre} (${localidad.cp})`,
      destinoSearchResults: [],
      hasSearchedDestino: false,
      isSearchingDestino: false,
    });

    // Get filial if cobertura is available
    if (localidad.cobertura) {
      await get().getFilial(localidad.cobertura, 'destino');
    }
  },

  clearOrigen: () => {
    set({
      origenLocalidad: null,
      origenSearchTerm: '',
      origenSearchResults: [],
      hasSearchedOrigen: false,
      isSearchingOrigen: false,
      origenFilial: null,
    });
  },

  clearDestino: () => {
    set({
      destinoLocalidad: null,
      destinoSearchTerm: '',
      destinoSearchResults: [],
      hasSearchedDestino: false,
      isSearchingDestino: false,
      destinoFilial: null,
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

  getFilial: async (coberturaId: number, type: 'origen' | 'destino') => {
    set({ isLoadingFilial: true });
    try {
      const response = await calculatorClient.getFilialPublic(coberturaId);
      if (type === 'origen') {
        set({ origenFilial: response.data.filial_public });
      } else {
        set({ destinoFilial: response.data.filial_public });
      }
    } catch (error) {
      console.error(`Error getting filial for ${type}:`, error);
      // Don't set error state, just log it
    } finally {
      set({ isLoadingFilial: false });
    }
  },

  cotizar: async () => {
    const { 
      origenLocalidad, 
      destinoLocalidad, 
      bulto, 
      selectedPackageType,
      origenFilial,
      destinoFilial,
    } = get();

    if (!origenLocalidad || !destinoLocalidad) {
      set({ error: 'Debes seleccionar origen y destino' });
      return;
    }

    // Get filiales IDs from filiales or cobertura
    const ofilialesId = origenFilial?.id || origenLocalidad.cobertura;
    const dfilialesId = destinoFilial?.id || destinoLocalidad.cobertura;

    if (!ofilialesId || !dfilialesId) {
      set({ error: 'No se pudo obtener la información de las filiales. Por favor, intenta nuevamente.' });
      return;
    }

    set({ isLoadingCotizacion: true, error: null });

    try {
      // Always use articulos_id 119
      const articulosId = 119;

      const request: CotizarRequest = {
        cotizacion: [
          {
            ofiliales_id: ofilialesId,
            dfiliales_id: dfilialesId,
            localidades_id: destinoLocalidad.id,
            articulos_id: articulosId,
            precios_id: 1,
            peso: bulto.peso,
            x: bulto.x,
            y: bulto.y,
            z: bulto.z,
            volumen: 0,
            cantidad: 0, // Forzado a 0
            valor_declarado: 0, // Forzado a 0
            remitentes_id: 0,
          },
        ],
      };

      const response = await calculatorClient.cotizar(request);
      
      // Map precios response to CotizacionItem format
      const precios = response.data.precios;
      const cotizaciones: CotizacionItem[] = [
        {
          id: 1,
          descripcion: 'Sucursal a Sucursal',
          precio: precios.SUC_SUC,
          precio_final: precios.SUC_SUC,
          flete: precios.SUC_SUC,
          seguro: 0,
        },
        {
          id: 2,
          descripcion: 'Sucursal a Domicilio',
          precio: precios.SUC_DOM,
          precio_final: precios.SUC_DOM,
          flete: precios.SUC_DOM,
          seguro: 0,
        },
        {
          id: 3,
          descripcion: 'Domicilio a Sucursal',
          precio: precios.DOM_SUC,
          precio_final: precios.DOM_SUC,
          flete: precios.DOM_SUC,
          seguro: 0,
        },
        {
          id: 4,
          descripcion: 'Domicilio a Domicilio',
          precio: precios.DOM_DOM,
          precio_final: precios.DOM_DOM,
          flete: precios.DOM_DOM,
          seguro: 0,
        },
      ];

      set({ cotizaciones });
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

