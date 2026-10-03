// Tipos de la API de Rumbo que usa Gioia (seguimiento de envíos).

export type RumboStatus =
  | 'EN_DEPOSITO'
  | 'EN_PREPARACION'
  | 'EN_DISTRIBUCION'
  | 'ENTREGADO'
  | 'NO_ENTREGADO'
  | 'CANCELADO';

export interface RumboEvent {
  id?: string;
  status: RumboStatus;
  label?: string;
  note: string | null;
  location: string | null;
  occurredAt: string;
}

/** Lo que ve el comprador (sin teléfono, correo ni dirección completa). */
export interface RumboTracking {
  code: string;
  codeDisplay: string;
  carrier: { name: string; phone: string | null; whatsapp: string | null; email: string | null };
  senderName: string | null;
  recipient: string;
  destination: string;
  itemsSummary: string | null;
  packages: number;
  estimatedDelivery: string | null;
  status: RumboStatus;
  statusLabel: string;
  headline: string;
  detail: string;
  next: string | null;
  deliveredTo: string | null;
  updatedAt: string;
  events: RumboEvent[];
}

/** El envío completo, como lo ve la logística. */
export interface RumboShipment {
  id: string;
  code: string;
  codeDisplay: string;
  externalRef: string | null;
  status: RumboStatus;
  statusLabel: string;
  trackingUrl: string;
  qrUrl: string;
  whatsapp: { message: string; url: string | null };
  recipientName: string;
  city: string;
  itemsSummary: string | null;
  packages: number;
  updatedAt: string;
  events?: (RumboEvent & { id: string })[];
}

/** Página del listado de envíos (GET /api/envios). */
export interface RumboListado {
  items: RumboShipment[];
  total: number;
  limit: number;
  offset: number;
  counts: Record<RumboStatus, number>;
}
