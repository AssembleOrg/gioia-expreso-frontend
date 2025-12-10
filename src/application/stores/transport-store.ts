import { create } from 'zustand';
import type { Transport, TransportWithContainers } from '@/domain/dispatch/types';
import {
  TransportClient,
  type TransportFilters,
  type CreateTransportDTO,
  type UpdateTransportDTO,
} from '@/infrastructure/api/transport-client';

interface TransportState {
  // Data
  transports: Transport[];
  selectedTransport: Transport | null;
  transportDetail: TransportWithContainers | null;

  // Pagination
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  // UI State
  isLoading: boolean;
  isLoadingDetail: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Actions
  fetchTransports: (filters?: TransportFilters) => Promise<void>;
  fetchTransportDetail: (id: string) => Promise<TransportWithContainers>;
  createTransport: (data: CreateTransportDTO) => Promise<Transport>;
  updateTransport: (id: string, data: UpdateTransportDTO) => Promise<void>;
  deleteTransport: (id: string) => Promise<void>;
  setSelectedTransport: (transport: Transport | null) => void;
  clearTransportDetail: () => void;
  setPage: (page: number) => void;
  reset: () => void;
}

const initialState = {
  transports: [],
  selectedTransport: null,
  transportDetail: null,
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  isLoading: false,
  isLoadingDetail: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

export const useTransportStore = create<TransportState>()((set, get) => ({
  ...initialState,

  fetchTransports: async (filters?: TransportFilters) => {
    const { page, limit } = get();

    set({ isLoading: true, error: null });

    try {
      const response = await TransportClient.getTransportsPaginated({
        page: filters?.page ?? page,
        limit: filters?.limit ?? limit,
        ...filters,
      });

      set({
        transports: response.data,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        page: response.meta.page,
        limit: response.meta.limit,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar transportes';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  fetchTransportDetail: async (id: string) => {
    set({ isLoadingDetail: true, error: null });

    try {
      const detail = await TransportClient.getTransportById(id);
      set({
        transportDetail: detail,
        isLoadingDetail: false,
      });
      return detail;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar detalle del transporte';
      set({
        isLoadingDetail: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  createTransport: async (data: CreateTransportDTO) => {
    set({ isCreating: true, error: null });

    try {
      const transport = await TransportClient.createTransport(data);
      set({ isCreating: false });
      get().fetchTransports();
      return transport;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear transporte';
      set({
        isCreating: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  updateTransport: async (id: string, data: UpdateTransportDTO) => {
    set({ isUpdating: true, error: null });

    try {
      await TransportClient.updateTransport(id, data);
      set({ isUpdating: false });
      get().fetchTransports();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar transporte';
      set({
        isUpdating: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  deleteTransport: async (id: string) => {
    set({ isDeleting: true, error: null });

    try {
      await TransportClient.deleteTransport(id);
      set({ isDeleting: false });
      get().fetchTransports();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar transporte';
      set({
        isDeleting: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  setSelectedTransport: (transport) => {
    set({ selectedTransport: transport });
  },

  clearTransportDetail: () => {
    set({ transportDetail: null });
  },

  setPage: (page) => {
    set({ page });
    get().fetchTransports({ page });
  },

  reset: () => {
    set(initialState);
  },
}));
