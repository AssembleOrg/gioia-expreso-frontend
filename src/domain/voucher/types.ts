export type PreorderStatus = 'CREATED' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Preorder {
  id: string;
  voucherNumber: string;
  clientId: string;
  client?: {
    id: string;
    fullname: string;
    email: string;
  };
  origin: string;
  originPostal: string;
  destination: string;
  destinationPostal: string;
  price: number;
  status: PreorderStatus;
  notes?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BulkUpdatePreorderDto {
  ids: string[];
  status: PreorderStatus;
}

export interface CreatePreorderDto {
  origin: string;
  originPostal: string;
  destination: string;
  destinationPostal: string;
  packages: Array<{
    packageTypeId: string;
    quantity: number;
    weight: number;
    height?: number;
    width?: number;
    depth?: number;
    declaredValue: number;
  }>;
  clientId?: string; // Optional if created by user for themselves
  notes?: string;
}

export interface VoucherStats {
  created: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  total: number;
}
