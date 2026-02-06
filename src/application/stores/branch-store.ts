import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Branch = 'BUENOS_AIRES' | 'ENTRE_RIOS';

export interface BranchData {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  cobertura: number; // ID de la filial
}

export const BRANCH_DATA: Record<Branch, BranchData> = {
  BUENOS_AIRES: {
    name: 'Buenos Aires',
    address: 'Mendoza 2765',
    city: 'Lanús',
    province: 'Buenos Aires',
    postalCode: '1824',
    cobertura: 67,
  },
  ENTRE_RIOS: {
    name: 'Entre Ríos',
    address: 'Maipú 1672',
    city: 'San José',
    province: 'Entre Ríos',
    postalCode: '3283',
    cobertura: 62,
  },
};

interface BranchState {
  selectedBranch: Branch | null;
  selectBranch: (branch: Branch) => void;
  clearBranch: () => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      selectedBranch: null,
      selectBranch: (branch) => set({ selectedBranch: branch }),
      clearBranch: () => set({ selectedBranch: null }),
    }),
    {
      name: 'gioia-branch-storage',
    }
  )
);
