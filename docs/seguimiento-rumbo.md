# Seguimiento de envíos con Rumbo

Rumbo (Pistech) es el seguimiento: los estados que ve el cliente, el QR, el link y el mensaje de WhatsApp. Gioia sigue siendo el dueño de los datos (preórdenes y repartos en su backend); esta app los lleva a Rumbo.

## Cómo funciona

- **Panel → Rumbo.** Después de cada acción (alta de preorden, aprobar/rechazar, cambio de estado, borrar, armar o mover un reparto, sacar un paquete), los clientes de `src/infrastructure/api` llaman a `avisarSeguimiento()`. Eso pega a `POST /api/rumbo/sync` con la sesión del usuario; el servidor lee Gioia y calcula el estado (nunca usa uno que mande el navegador). Si Rumbo falla, la operación en Gioia ya quedó hecha y se avisa con una notificación.
- **Página pública** `/tracking/[id]` (id de la preorden, lo que ya llevan los QR y etiquetas): muestra los datos de Rumbo con la marca de Gioia. Si la preorden todavía no está en Rumbo (anterior a la integración), se carga en el momento. Sin Rumbo configurado o caído, se ve la vista anterior.
- **QR** `/api/rumbo/qr/[id]`: abre `/tracking/[id]` y lo sigue leyendo el escáner de repartos (lleva el id).
- La clave (`RUMBO_API_KEY`) vive sólo en el servidor (`src/infrastructure/rumbo/*.server.ts`).

## Estados

| Gioia | Rumbo (lo que ve el cliente) |
| --- | --- |
| Preorden creada / pendiente / confirmada | En depósito |
| Reparto en carga (`ON_LOAD`) | En preparación |
| Reparto viajando (`TRAVELLING`) | En camino |
| Reparto llegó (`ARRIVED`) | En camino + novedad "Llegó a la sucursal de destino" |
| Preorden completada | Entregado |
| Preorden cancelada o borrada | Cancelado |

Si en Gioia se corrige un estado hacia atrás, Rumbo deshace pasos para quedar igual.

## Configuración

Variables (ver `.env.example`): `RUMBO_API_URL`, `RUMBO_API_KEY`. En Rumbo, la logística "Transportes Gioia" tiene el link propio `https://transportegioia.com.ar/tracking/{ref}` (Ajustes → Seguimiento en tu web), así el QR, WhatsApp y los rótulos llevan a esta web.
