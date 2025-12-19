import { create } from 'zustand';
import type { Preorder, PreorderStatus, ContainerStatus } from '@/domain/dispatch/types';
import { PaquetesClient, type PreorderFilters } from '@/infrastructure/api/paquetes-client';
import { RepartosClient } from '@/infrastructure/api/repartos-client';

export type PaquetesTab = 'solicitudes' | 'disponibles' | 'en_reparto' | 'completados';

interface ContainerInfo {
  code: string;
  status: ContainerStatus;
}

interface PaquetesState {
  // Data
  preorders: Preorder[];
  selectedIds: string[];
  selectedPreorder: Preorder | null;

  // Pagination
  page: number;
  limit: number;
  total: number;
  totalPages: number;

  // Filters
  statusFilter: PreorderStatus | null;

  // Tabs - Assignment state
  activeTab: PaquetesTab;
  assignedPreorderIds: Set<string>;
  containerByPreorderId: Map<string, ContainerInfo>;
  isLoadingContainers: boolean;

  // UI State
  isLoading: boolean;
  error: string | null;
  isDownloading: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Actions
  fetchPreorders: (filters?: PreorderFilters) => Promise<void>;
  fetchAssignedPreorders: () => Promise<void>;
  setPage: (page: number) => void;
  setStatusFilter: (status: PreorderStatus | null) => void;
  setActiveTab: (tab: PaquetesTab) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  getSelectedPreorders: () => Preorder[];
  setSelectedPreorder: (preorder: Preorder | null) => void;
  downloadPdf: (id: string, voucherNumber: string) => Promise<void>;
  updatePreorder: (id: string, data: { status?: PreorderStatus; notes?: string }) => Promise<void>;
  deletePreorder: (id: string) => Promise<void>;
  // Bulk Actions
  addScannedId: (id: string) => void;
  removeScannedId: (id: string) => void;
  clearScannedIds: () => void;
  bulkUpdateStatus: (ids: string[], status: PreorderStatus) => Promise<void>;
  scannedIds: string[];
  reset: () => void;
}

const initialState = {
  preorders: [],
  selectedIds: [],
  selectedPreorder: null,
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  statusFilter: null,
  activeTab: 'disponibles' as PaquetesTab,
  assignedPreorderIds: new Set<string>(),
  containerByPreorderId: new Map<string, ContainerInfo>(),
  isLoadingContainers: false,
  isLoading: false,
  error: null,
  isDownloading: false,
  isUpdating: false,
  isDeleting: false,
  scannedIds: [],
};

export const usePaquetesStore = create<PaquetesState>()((set, get) => ({
  ...initialState,

  fetchPreorders: async () => {
    set({ isLoading: true, error: null });

    try {
      // Traer TODOS los preorders (paginación client-side después de filtrar por tab)
      const response = await PaquetesClient.getPreorders({ limit: 1000 });

      set({
        preorders: response.data,
        total: response.data.length,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar paquetes';
      set({
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  setPage: (page) => {
    set({ page });
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status, page: 1, selectedIds: [] });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab, selectedIds: [], page: 1 });
  },

  fetchAssignedPreorders: async () => {
    set({ isLoadingContainers: true });
    try {
      // Fetch all containers (with high limit to get all)
      const response = await RepartosClient.getContainersPaginated({ limit: 1000 });

      const assignedIds = new Set<string>();
      const containerMap = new Map<string, ContainerInfo>();

      // Extract preorder IDs from each container
      for (const container of response.data) {
        if (container.preorders) {
          for (const cp of container.preorders) {
            const preorderId = cp.preorder.id;
            assignedIds.add(preorderId);
            containerMap.set(preorderId, {
              code: container.code,
              status: container.status,
            });
          }
        }
      }

      set({
        assignedPreorderIds: assignedIds,
        containerByPreorderId: containerMap,
        isLoadingContainers: false,
      });
    } catch (error) {
      console.error('Error fetching container assignments:', error);
      set({ isLoadingContainers: false });
    }
  },

  toggleSelection: (id) => {
    const { selectedIds } = get();
    if (selectedIds.includes(id)) {
      set({ selectedIds: selectedIds.filter((selectedId) => selectedId !== id) });
    } else {
      set({ selectedIds: [...selectedIds, id] });
    }
  },

  selectAll: () => {
    const { preorders, selectedIds } = get();
    const allIds = preorders.map((p) => p.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // Deselect all on current page
      set({ selectedIds: selectedIds.filter((id) => !allIds.includes(id)) });
    } else {
      // Select all on current page
      const newSelectedIds = [...new Set([...selectedIds, ...allIds])];
      set({ selectedIds: newSelectedIds });
    }
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  getSelectedPreorders: () => {
    const { preorders, selectedIds } = get();
    return preorders.filter((p) => selectedIds.includes(p.id));
  },

  setSelectedPreorder: (preorder) => {
    set({ selectedPreorder: preorder });
  },

  downloadPdf: async (id, voucherNumber) => {
    set({ isDownloading: true });
    try {
      const blob = await PaquetesClient.downloadPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante-${voucherNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al descargar PDF';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isDownloading: false });
    }
  },

  updatePreorder: async (id, data) => {
    set({ isUpdating: true, error: null });
    try {
      await PaquetesClient.updatePreorder(id, data);
      await get().fetchPreorders();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar preorden';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isUpdating: false });
    }
  },

  deletePreorder: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      await PaquetesClient.deletePreorder(id);
      const { selectedIds } = get();
      set({ selectedIds: selectedIds.filter((selectedId) => selectedId !== id) });
      await get().fetchPreorders();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar preorden';
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ isDeleting: false });
    }
  },

  addScannedId: (id) => {
    const { scannedIds } = get();
    if (!scannedIds.includes(id)) {
      set({ scannedIds: [...scannedIds, id] });
    }
  },

  removeScannedId: (id) => {
    const { scannedIds } = get();
    set({ scannedIds: scannedIds.filter((sid) => sid !== id) });
  },

  clearScannedIds: () => {
    set({ scannedIds: [] });
  },

  bulkUpdateStatus: async (ids, status) => {
    set({ isLoading: true, error: null });
    try {
      // Use PaquetesClient or VoucherClient logic (PaquetesClient doesn't have bulkUpdate yet, need to add it or import VoucherClient)
      // Since we are migrating, we should use VoucherClient or add it to PaquetesClient. 
      // To be clean, let's use VoucherClient here as it has the method already.
      // Wait, we need to import VoucherClient. Or move the method to PaquetesClient.
      // Let's import VoucherClient for now to save time.
      const { VoucherClient } = await import('@/infrastructure/api/voucher-client');
      await VoucherClient.bulkUpdateStatus({ ids, status });
      await get().fetchPreorders();
      set({ scannedIds: [], isLoading: false });
    } catch (error: any) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  reset: () => {
    set(initialState);
  },
}));
