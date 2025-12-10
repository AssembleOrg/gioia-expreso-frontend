// Domain types for dispatch/preorder flow

export interface Dimensiones {
  alto: number;
  ancho: number;
  largo: number;
}

export interface Paquete {
  descripcion: string;
  peso: number;
  valor_declarado: number;
  dimensiones: Dimensiones;
}

export interface Persona {
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
}

export interface Localidad {
  id: string;
  nombre: string;
  provincia?: string;
  codigo_postal?: string;
}

export interface Bulto {
  peso: number;
  valor_declarado: number;
  dimensiones?: Dimensiones | null;
}

export interface Cotizacion {
  id: string;
  origen: Localidad;
  destino: Localidad;
  bultos: Bulto[];
  precio: number;
  servicio: 'SUCURSAL' | 'DOMICILIO';
  tiempo_estimado?: string;
}

// DTO types matching backend API contract
export interface PackageItemDTO {
  packageType: string;
  quantity: number;
  weight: number;
  height?: number;
  width?: number;
  depth?: number;
  declaredValue?: number;
}

export interface ClientDataDTO {
  fullname: string;
  phone: string;
  email: string;
  cuit?: string;
  address: string;
}

export interface CreatePreorderDTO {
  clientId?: string;
  clientData?: ClientDataDTO;
  origin: string;
  originPostal: string;
  destination: string;
  destinationPostal: string;
  price: number;
  packages: PackageItemDTO[];
  notes?: string;
}

// Types for listing preorders
export type PreorderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface PreorderClient {
  id: string;
  fullname: string;
  email: string;
  phone: string;
}

export interface PackageType {
  id: string;
  name: string;
  type: string;
  height: number;
  width: number;
  depth: number;
  weight: number;
  isCustom: boolean;
}

export interface PreorderPackage {
  id: string;
  packageTypeId: string;
  quantity: number;
  weight: number;
  height: number | null;
  width: number | null;
  depth: number | null;
  declaredValue: number;
  packageType: PackageType;
}

export interface PreorderResponse {
  id: string;
  voucherNumber: string;
  clientId: string;
  origin: string;
  originPostal: string;
  destination: string;
  destinationPostal: string;
  price: number;
  status: PreorderStatus;
  notes: string | null;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
  client: PreorderClient;
  packages: PreorderPackage[];
}

export interface Preorder {
  id: string;
  voucherNumber: string;
  clientId: string;
  origin: string;
  originPostal: string;
  destination: string;
  destinationPostal: string;
  price: number;
  status: PreorderStatus;
  notes: string | null;
  pdfUrl: string | null;
  createdAt: string;
  updatedAt: string;
  client: PreorderClient;
  packages: PreorderPackage[];
}

export interface PreorderListResponse {
  data: Preorder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Container/Reparto types
export type ContainerStatus = 'ON_LOAD' | 'TRAVELLING' | 'ARRIVED';

export interface Transport {
  id: string;
  name: string;
  licensePlate: string;
  available: boolean;
  _count?: {
    containers: number;
  };
}

// Transport con containers incluidos (para GET /transports/:id)
export interface TransportWithContainers extends Transport {
  containers: Container[];
}

export interface Container {
  id: string;
  code: string;
  transportId: string | null;
  status: ContainerStatus;
  origin: string;
  destination: string;
  notes: string | null;
  createdAt: string;
  transport: Transport | null;
  preorders?: { preorder: Preorder }[];
  _count?: { preorders: number };
}

export interface CreateContainerDTO {
  origin: string;
  destination: string;
  transportId?: string;
  notes?: string;
  preorderIds: string[];
}

export interface ContainerListResponse {
  data: Container[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Tipos para entrega (Sucursal vs Domicilio)
export type TipoEntrega = 'sucursal' | 'domicilio';

export interface DireccionDomicilio {
  direccion: string;
  provincia?: string;
  localidad?: string;
  barrio?: string;
  calle?: string;
  altura?: string;
  codigoPostal?: string;
  pisoDepto?: string;
  referencias?: string;
}

export interface DatosEntrega {
  tipoEntrega: TipoEntrega;
  sucursalDestinoId?: string;
  direccionDomicilio?: DireccionDomicilio;
}
