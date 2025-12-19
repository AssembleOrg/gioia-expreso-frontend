import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cotizacion, Paquete, Persona, PreorderResponse, CreatePreorderDTO, TipoEntrega, DireccionDomicilio } from '@/domain/dispatch/types';
import { DispatchClient } from '@/infrastructure/api/dispatch-client';
import { useAuthStore } from './auth-store';
import { useBranchStore, BRANCH_DATA, type Branch } from './branch-store';
import { PREDEFINED_PACKAGES } from '@/domain/calculator/types';

interface DispatchState {
  // Data
  cotizacion: Cotizacion | null;
  paquetes: Paquete[];
  remitente: Persona | null;
  destinatario: Persona | null;
  clientType: 'PARTICULAR' | 'EMPRESA';

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
  selectCotizacion: (cotizacion: Cotizacion, defaultDescription?: string, quantity?: number, packageType?: string) => void;
  updatePaquetes: (paquetes: Paquete[]) => void;
  updateRemitente: (remitente: Persona) => void;
  updateDestinatario: (destinatario: Persona) => void;
  setClientType: (type: 'PARTICULAR' | 'EMPRESA') => void;
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
  clientType: 'PARTICULAR' as 'PARTICULAR' | 'EMPRESA',
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

      selectCotizacion: (cotizacion, defaultDescription = '', quantity = 1, packageType = 'BULTO') => {
        // If the backend returns 1 bulto but user selected quantity > 1, we replicate it
        // If the backend already returns N bultos, we use them
        const baseBultos = cotizacion.bultos.length === 1 && quantity > 1
          ? Array(quantity).fill(cotizacion.bultos[0])
          : cotizacion.bultos;

        set({
          cotizacion,
          currentStep: 0,
          error: null,
          // Initialize paquetes with data from bultos
          paquetes: baseBultos.map((bulto) => {
            let dims = bulto.dimensiones || { alto: 0, ancho: 0, largo: 0 };
            
            // Logic to force-set dimensions if it is a predefined package type
            if (packageType && packageType !== 'BULTO' && packageType !== 'custom') {
               // Try to match BAG_WWxLL pattern first if not found in PREDEFINED_PACKAGES
               const match = packageType.match(/(\d+)X(\d+)/);
               if (match) {
                 dims = {
                   alto: 0, // Bags usually have negligible height
                   ancho: parseInt(match[1]),
                   largo: parseInt(match[2])
                 };
               }
            }

            return {
              descripcion: defaultDescription,
              peso: bulto.peso,
              valor_declarado: bulto.valor_declarado,
              // Always initialize with object, never null
              dimensiones: dims,
              packageType: packageType,
            };
          }),
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

      setClientType: (type) => {
        set({ clientType: type });
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
        const { user } = useAuthStore.getState();

        console.log('=== DISPATCH SUBMIT DEBUG ===');
        console.log('User role:', user?.role);
        console.log('Auth token present:', !!authToken);
        console.log('Cotizacion:', cotizacion);
        console.log('Paquetes:', paquetes);
        console.log('Remitente:', remitente);
        console.log('Client type:', get().clientType);

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

          // Preparar CUIT - SIMPLIFICADO PARA USER ROLE
          let cuitValue: string | undefined;
          const dniLimpio = remitente.dni.replace(/\D/g, '');
          
          console.log('DNI original:', remitente.dni);
          console.log('DNI limpio:', dniLimpio);
          
          if (user?.role === 'USER') {
            // Para USER: Si el DNI tiene 11 dígitos, formatear como CUIT
            // Si tiene 8 dígitos, enviar sin formato (el backend debe manejarlo)
            if (dniLimpio.length === 11) {
              cuitValue = `${dniLimpio.slice(0, 2)}-${dniLimpio.slice(2, 10)}-${dniLimpio.slice(10)}`;
            } else if (dniLimpio.length === 8) {
              // Para DNI de 8 dígitos, no enviar CUIT para evitar error de formato
              cuitValue = undefined;
            } else {
              // Para otros formatos, no enviar CUIT
              cuitValue = undefined;
            }
          } else {
            // Para ADMIN: intentar formatear siempre
            if (dniLimpio.length === 11) {
              cuitValue = `${dniLimpio.slice(0, 2)}-${dniLimpio.slice(2, 10)}-${dniLimpio.slice(10)}`;
            } else {
              cuitValue = dniLimpio; // Enviar como está para ADMIN
            }
          }
          
          console.log('CUIT final:', cuitValue);

          // Build DTO matching backend API contract
          const dto: CreatePreorderDTO = {
            // Client data from remitente
            // Note: We deliberately do NOT send clientId even if logged in,
            // because User ID != Client ID. We rely on the backend finding the client by email
            // or creating a new one from clientData.
            clientData: {
              fullname: remitente.nombre,
              phone: remitente.telefono,
              email: remitente.email,
              cuit: cuitValue,
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

            // Packages: map to PackageItemDTO format con VALIDACIÓN PARA USER
            packages: paquetes.map((p, index) => {
              console.log(`Procesando paquete ${index}:`, p);
              
              // Check if package is predefined
              const isPredefined = p.packageType && p.packageType !== 'BULTO' && p.packageType !== 'custom';
              
              console.log(`Paquete ${index} - Tipo: ${p.packageType}, Es predefinido: ${isPredefined}`);

              let finalHeight: number | undefined;
              let finalWidth: number | undefined;
              let finalDepth: number | undefined;

              // CRÍTICO: Para USER role, NUNCA enviar dimensiones para paquetes predefinidos
              if (user?.role === 'USER' && isPredefined) {
                console.log(`Paquete ${index} USER predefinido: sin dimensiones`);
                finalHeight = undefined;
                finalWidth = undefined;
                finalDepth = undefined;
              } else if (!isPredefined) {
                // Solo enviar dimensiones para bultos personalizados
                const h = p.dimensiones?.alto;
                const w = p.dimensiones?.ancho;
                const d = p.dimensiones?.largo;
                
                finalHeight = (h && h >= 1) ? h : undefined;
                finalWidth = (w && w >= 1) ? w : undefined;
                finalDepth = (d && d >= 1) ? d : undefined;
                
                console.log(`Paquete ${index} bulto personalizado - Dimensiones:`, { finalHeight, finalWidth, finalDepth });
              }

              const packageDto = {
                packageType: p.packageType || 'BULTO',
                quantity: 1,
                weight: p.peso,
                height: finalHeight,
                width: finalWidth,
                depth: finalDepth,
                declaredValue: p.valor_declarado,
              };
              
              console.log(`Paquete ${index} DTO final:`, packageDto);
              return packageDto;
            }),

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

          console.log('=== DTO FINAL PARA BACKEND ===');
          console.log('DTO completo:', JSON.stringify(dto, null, 2));
          console.log('Role del usuario:', user?.role);
          console.log('Total paquetes:', dto.packages.length);
          dto.packages.forEach((pkg, i) => {
            console.log(`Paquete ${i}:`, pkg);
          });

          const result = await DispatchClient.createPreorder(dto, authToken);

          console.log('=== RESPUESTA DEL BACKEND ===');
          console.log('Resultado:', result);

          set({ isSubmitting: false });
          return result;
        } catch (error) {
          console.error('=== ERROR EN SUBMIT ===');
          console.error('Error completo:', error);
          console.error('Tipo de error:', error instanceof Error ? error.constructor.name : typeof error);
          if (error instanceof Error) {
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
          }
          
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
        clientType: state.clientType,
        tipoEntrega: state.tipoEntrega,
        sucursalDestinoId: state.sucursalDestinoId,
        direccionDomicilio: state.direccionDomicilio,
        precioManual: state.precioManual,
      }),
    }
  )
);
