import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cotizacion, Paquete, Persona, PreorderResponse, CreatePreorderDTO, TipoEntrega, DireccionDomicilio } from '@/domain/dispatch/types';
import { DispatchClient } from '@/infrastructure/api/dispatch-client';
import { useAuthStore } from './auth-store';
import { useBranchStore, BRANCH_DATA, type Branch } from './branch-store';

interface DispatchState {
  // Data
  cotizacion: Cotizacion | null;
  paquetes: Paquete[];
  remitente: Persona | null;
  destinatario: Persona | null;

  // Datos de entrega
  tipoEntrega: TipoEntrega;
  sucursalDestinoId: Branch | null;
  direccionDomicilio: DireccionDomicilio | null;
  precioManual: number | null;

  // UI State
  currentStep: number; // 0=Paquetes, 1=Despachante, 2=Confirmación
  isSubmitting: boolean;
  error: string | null;

  // Actions
  selectCotizacion: (cotizacion: Cotizacion) => void;
  updatePaquetes: (paquetes: Paquete[]) => void;
  updateRemitente: (remitente: Persona) => void;
  updateDestinatario: (destinatario: Persona) => void;
  setTipoEntrega: (tipo: TipoEntrega) => void;
  setSucursalDestino: (sucursalId: Branch) => void;
  setDireccionDomicilio: (direccion: DireccionDomicilio) => void;
  setPrecioManual: (precio: number | null) => void;
  getPrecioFinal: () => number;
  submitPreorder: () => Promise<PreorderResponse>;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  cotizacion: null,
  paquetes: [],
  remitente: null,
  destinatario: null,
  tipoEntrega: 'sucursal' as TipoEntrega,
  sucursalDestinoId: null,
  direccionDomicilio: null,
  precioManual: null,
  currentStep: 0,
  isSubmitting: false,
  error: null,
};

export const useDispatchStore = create<DispatchState>()(
  persist(
    (set, get) => ({
      ...initialState,

      selectCotizacion: (cotizacion) => {
        set({
          cotizacion,
          currentStep: 0,
          error: null,
          // Initialize paquetes with data from bultos
          paquetes: cotizacion.bultos.map((bulto) => ({
            descripcion: '',
            peso: bulto.peso,
            valor_declarado: bulto.valor_declarado,
            // Always initialize with object, never null
            dimensiones: bulto.dimensiones || { alto: 0, ancho: 0, largo: 0 },
          })),
        });
      },

      updatePaquetes: (paquetes) => {
        set({ paquetes });
      },

      updateRemitente: (remitente) => {
        set({ remitente });
      },

      updateDestinatario: (destinatario) => {
        set({ destinatario });
      },

      setTipoEntrega: (tipo) => {
        set({ tipoEntrega: tipo });
      },

      setSucursalDestino: (sucursalId) => {
        set({ sucursalDestinoId: sucursalId });
      },

      setDireccionDomicilio: (direccion) => {
        set({ direccionDomicilio: direccion });
      },

      setPrecioManual: (precio) => {
        set({ precioManual: precio });
      },

      getPrecioFinal: () => {
        const { precioManual, cotizacion } = get();
        return precioManual ?? cotizacion?.precio ?? 0;
      },

      setCurrentStep: (step) => {
        set({ currentStep: step });
      },

      submitPreorder: async () => {
        const { cotizacion, paquetes, remitente, destinatario, tipoEntrega, sucursalDestinoId, direccionDomicilio, precioManual } = get();
        const authToken = useAuthStore.getState().accessToken;
        const { selectedBranch } = useBranchStore.getState();

        if (!cotizacion) {
          throw new Error('No hay cotización seleccionada');
        }

        if (!remitente || !destinatario) {
          throw new Error('Faltan datos de remitente o destinatario');
        }

        if (!authToken) {
          throw new Error('No estás autenticado');
        }

        set({ isSubmitting: true, error: null });

        try {
          // Calcular destino según tipo de entrega
          let destinationAddress: string;
          let destinationPostal: string;

          if (tipoEntrega === 'sucursal' && sucursalDestinoId) {
            // Si es a sucursal, usar la dirección de la sucursal destino
            const sucursalData = BRANCH_DATA[sucursalDestinoId];
            destinationAddress = `${sucursalData.address}, ${sucursalData.city}, ${sucursalData.province}`;
            destinationPostal = sucursalData.postalCode;
          } else if (tipoEntrega === 'domicilio' && direccionDomicilio) {
            // Si es a domicilio, construir la dirección completa
            const partes = [
              direccionDomicilio.calle && direccionDomicilio.altura
                ? `${direccionDomicilio.calle} ${direccionDomicilio.altura}`
                : direccionDomicilio.direccion,
              direccionDomicilio.pisoDepto,
              direccionDomicilio.barrio,
              direccionDomicilio.localidad,
              direccionDomicilio.provincia,
            ].filter(Boolean);
            destinationAddress = partes.join(', ');
            destinationPostal = direccionDomicilio.codigoPostal || cotizacion.destino.codigo_postal || '0000';
          } else {
            // Fallback al comportamiento anterior
            destinationAddress = `${destinatario.direccion}, ${cotizacion.destino.nombre}${cotizacion.destino.provincia ? `, ${cotizacion.destino.provincia}` : ''}`;
            destinationPostal = cotizacion.destino.codigo_postal || '0000';
          }

          // Usar precio manual si existe, sino el de la cotización
          const precioFinal = precioManual ?? cotizacion.precio;

          // Build DTO matching backend API contract
          const dto: CreatePreorderDTO = {
            // Client data from remitente
            clientData: {
              fullname: remitente.nombre,
              phone: remitente.telefono,
              email: remitente.email,
              cuit: remitente.dni,
              address: remitente.direccion,
            },

            // Origin: localidad name + provincia
            origin: `${remitente.direccion}, ${cotizacion.origen.nombre}${cotizacion.origen.provincia ? `, ${cotizacion.origen.provincia}` : ''}`,
            originPostal: cotizacion.origen.codigo_postal || '0000',

            // Destination: calculado según tipo de entrega
            destination: destinationAddress,
            destinationPostal: destinationPostal,

            // Price: manual o cotización
            price: precioFinal,

            // Packages: map to PackageItemDTO format
            packages: paquetes.map((p) => ({
              packageType: 'BULTO',
              quantity: 1,
              weight: p.peso,
              // Only include dimensions if they exist and are > 0
              height: p.dimensiones?.alto > 0 ? p.dimensiones.alto : undefined,
              width: p.dimensiones?.ancho > 0 ? p.dimensiones.ancho : undefined,
              depth: p.dimensiones?.largo > 0 ? p.dimensiones.largo : undefined,
              declaredValue: p.valor_declarado,
            })),

            // Notes with branch, service and delivery type info
            notes: [
              selectedBranch ? `Sucursal origen: ${selectedBranch}` : null,
              `Servicio: ${cotizacion.servicio}`,
              `Tipo entrega: ${tipoEntrega === 'sucursal' ? 'Retira en Sucursal' : 'Envío a Domicilio'}`,
              tipoEntrega === 'sucursal' && sucursalDestinoId ? `Sucursal destino: ${BRANCH_DATA[sucursalDestinoId].name}` : null,
              direccionDomicilio?.referencias ? `Referencias: ${direccionDomicilio.referencias}` : null,
              `Destinatario: ${destinatario.nombre} - DNI: ${destinatario.dni} - Tel: ${destinatario.telefono}`,
            ].filter(Boolean).join(' | '),
          };

          const result = await DispatchClient.createPreorder(dto, authToken);

          set({ isSubmitting: false });
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear la preorden';
          set({
            isSubmitting: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'dispatch-storage',
      partialize: (state) => ({
        cotizacion: state.cotizacion,
        paquetes: state.paquetes,
        remitente: state.remitente,
        destinatario: state.destinatario,
        tipoEntrega: state.tipoEntrega,
        sucursalDestinoId: state.sucursalDestinoId,
        direccionDomicilio: state.direccionDomicilio,
        precioManual: state.precioManual,
      }),
    }
  )
);
