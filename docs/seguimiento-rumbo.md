# Seguimiento de envíos con Rumbo

Rumbo (Pistech) es el seguimiento: los estados que ve el comprador, el QR, el link y el mensaje de WhatsApp. Gioia sigue siendo el dueño de los datos (preórdenes y repartos en su backend).

Es un feature aparte: **no cambia nada de lo que ya existía**. `/tracking/[id]`, el QR de Paquetes, el escáner de Paquetes y los clientes de la API quedan como estaban.

## Cómo funciona

- **Backend → Rumbo (webhook).** Disparadores de Postgres en `preorders`, `containers` y `container_preorders` anotan cada cambio en `rumbo_outbox` y avisan por `NOTIFY`. El módulo `rumbo` del backend lo procesa al instante y lleva a Rumbo el estado que corresponde (con reintentos si Rumbo falla). Esta app no sincroniza nada.
- **Sección del panel** `/seguimientos`: lista de envíos con el estado que ve el comprador, filtros, búsqueda, QR, WhatsApp y un escáner propio (confirmar recepción, agregar a un reparto, entregado, pendiente, cancelar). El escáner aplica la acción en Gioia; el webhook hace el resto.
- **Página pública** `/seguimiento/[id]` (id de la preorden): los datos de Rumbo con la marca de Gioia. Si el envío todavía no está en Rumbo, lo dice y ofrece la vista anterior (`/tracking/[id]`).
- **QR** `/api/rumbo/qr/[id]`: abre `/seguimiento/[id]` (lleva el id, lo lee el escáner de Seguimiento).
- La clave (`RUMBO_API_KEY`) vive sólo en el servidor (`src/infrastructure/rumbo/*.server.ts`).

## Estados

| Gioia | Rumbo (lo que ve el comprador) |
| --- | --- |
| Preorden creada / pendiente / confirmada | En depósito |
| En un reparto en carga (`ON_LOAD`) | En preparación |
| Reparto viajando (`TRAVELLING`) | En camino |
| Reparto llegó (`ARRIVED`) | En camino + novedad "Llegó a la sucursal de destino" |
| Preorden completada | Entregado |
| Preorden cancelada o borrada | Cancelado |

Si en Gioia se corrige un estado hacia atrás o se saca un paquete de un reparto, Rumbo deshace pasos para quedar igual.

## Configuración

- Frontend: `RUMBO_API_URL`, `RUMBO_API_KEY` (ver `.env.example`).
- Backend: las mismas dos variables; sin ellas el módulo no hace nada y los cambios quedan anotados en `rumbo_outbox`.
- En Rumbo, la logística "Transportes Gioia" tiene el link propio `https://transportegioia.com.ar/seguimiento/{ref}` (Ajustes → Seguimiento en tu web).
