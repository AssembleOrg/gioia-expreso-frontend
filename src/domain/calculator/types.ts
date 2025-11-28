// Domain types for calculator

export interface Localidad {
  id: number;
  localidad_id: string;
  localidad: string;
  provincia_id: number;
  provincia_nombre: string;
  centroide_lat: string;
  centroide_lon: string;
  cp: string;
  mapa: boolean;
  zoom: number;
  provincia: {
    id: number;
    provincia: string;
    codigoafip: number;
    codigo: string;
  };
}

export interface Bulto {
  cantidad: number;
  peso: number;
  x: number; // largo (cm)
  y: number; // ancho (cm)
  z: number; // alto (cm)
  valor_declarado: number;
}

export interface CotizacionItem {
  id: number;
  descripcion: string;
  precio: number;
  precio_final: number;
  flete: number;
  seguro: number;
}

export interface CotizarRequest {
  acuerdos_id?: number;
  articulos_id?: number;
  opostal: string;
  dpostal: string;
  bultos: Bulto[];
}

export interface SearchLocalidadesParams {
  q: string;
  atendida?: number;
}

export interface LocalidadesResponse {
  status: 'success';
  data: {
    localidades: Localidad[];
  };
}

export interface CotizacionResponse {
  status: 'success';
  data: {
    cotizacion_web: CotizacionItem[];
  };
}

// Predefined package IDs
export const ARTICULOS_IDS = {
  BULTO_PERSONALIZADO: 0,
  PAQUETE_20x32: 4516,
  PAQUETE_30x41: 4517,
  PAQUETE_42x54: 4512,
  PAQUETE_70x80: 4513,
} as const;

// Service type IDs
export const TIPOS_SERVICIO = {
  DOMICILIO_A_DOMICILIO: 1,
  SUCURSAL_A_SUCURSAL: 2,
  DOMICILIO_A_SUCURSAL: 3,
  SUCURSAL_A_DOMICILIO: 4,
} as const;

// Predefined package configurations
export interface PredefinedPackage {
  id: number;
  name: string;
  articulos_id: number;
  dimensions: {
    width: number;
    length: number;
    height: number;
  };
}

export const PREDEFINED_PACKAGES: PredefinedPackage[] = [
  {
    id: 1,
    name: '20 x 32',
    articulos_id: ARTICULOS_IDS.PAQUETE_20x32,
    dimensions: { width: 20, length: 32, height: 0 },
  },
  {
    id: 2,
    name: '30 x 41',
    articulos_id: ARTICULOS_IDS.PAQUETE_30x41,
    dimensions: { width: 30, length: 41, height: 0 },
  },
  {
    id: 3,
    name: '42 x 54',
    articulos_id: ARTICULOS_IDS.PAQUETE_42x54,
    dimensions: { width: 42, length: 54, height: 0 },
  },
  {
    id: 4,
    name: '70 x 80',
    articulos_id: ARTICULOS_IDS.PAQUETE_70x80,
    dimensions: { width: 70, length: 80, height: 0 },
  },
];

