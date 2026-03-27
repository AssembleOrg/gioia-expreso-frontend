// Domain types for Deposit Receipts

export interface DepositReceiptData {
  id?: string;
  firstName: string;
  lastName: string;
  cuit?: string;
  dni?: string;
  email: string;
  description: string;
  timeEstimated: string; // ISO date string
  valueAprox?: number | null;
  price: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CreateDepositReceiptPayload {
  firstName: string;
  lastName: string;
  cuit?: string;
  dni?: string;
  email: string;
  description: string;
  timeEstimated: string; // ISO date string
  valueAprox?: number;
  price: number;
}

export interface DepositReceiptFilters {
  page?: number;
  limit?: number;
  dni?: string;
  cuit?: string;
  startDate?: string; // ISO date string
  endDate?: string;   // ISO date string
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedDepositReceiptResponse {
  data: DepositReceiptData[];
  meta: PaginatedMeta;
}
