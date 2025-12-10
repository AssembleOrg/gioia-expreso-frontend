import { create } from 'zustand';
import type { Container, Transport, CreateContainerDTO, ContainerStatus } from '@/domain/dispatch/types';
import { RepartosClient, type ContainerFilters } from '@/infrastructure/api/repartos-client';

interface RepartosState {
  // Data
  containers: Container[];
  transports: Transport[];

  // Pagination
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  // UI State
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;

  // Actions
  fetchContainers: (filters?: ContainerFilters) => Promise<void>;
  fetchTransports: () => Promise<void>;
  createContainer: (data: CreateContainerDTO) => Promise<Container>;
  changeStatus: (containerId: string, status: ContainerStatus) => Promise<void>;
  removePreorderFromContainer: (containerId: string, preorderId: string) => Promise<void>;
  setPage: (page: number) => void;
  reset: () => void;
}

const initialState = {
  containers: [],
  transports: [],
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  isLoading: false,
  isCreating: false,
  error: null,
};

export const useRepartosStore = create<RepartosState>()((set, get) => ({
  ...initialState,

  fetchContainers: async (filters?: ContainerFilters) => {
    const { page, limit } = get();

    set({ isLoading: true, error: null });

    try {
      const response = await RepartosClient.getContainersPaginated({
        page: filters?.page ?? page,
        limit: filters?.limit ?? limit,
        ...filters,
      });

      set({
        containers: response.data,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        page: response.meta.page,
        limit: response.meta.limit,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar repartos';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  fetchTransports: async () => {
    try {
      const result = await RepartosClient.getTransports(true);
      // Asegurar que siempre sea array
      set({ transports: Array.isArray(result) ? result : [] });
    } catch (error) {
      console.error('Error fetching transports:', error);
      set({ transports: [] }); // Fallback explícito
    }
  },

  createContainer: async (data: CreateContainerDTO) => {
    set({ isCreating: true, error: null });

    try {
      const container = await RepartosClient.createContainer(data);
      set({ isCreating: false });
      // Refresh the list
      get().fetchContainers();
      return container;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear reparto';
      set({
        isCreating: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  changeStatus: async (containerId: string, status: ContainerStatus) => {
    try {
      await RepartosClient.changeContainerStatus(containerId, status);
      // Refresh the list
      get().fetchContainers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar estado';
      set({ error: errorMessage });
      throw error;
    }
  },

  removePreorderFromContainer: async (containerId: string, preorderId: string) => {
    try {
      await RepartosClient.removePreorderFromContainer(containerId, preorderId);
      // Refresh the list
      get().fetchContainers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al quitar paquete';
      set({ error: errorMessage });
      throw error;
    }
  },

  setPage: (page) => {
    set({ page });
    get().fetchContainers({ page });
  },

  reset: () => {
    set(initialState);
  },
}));
