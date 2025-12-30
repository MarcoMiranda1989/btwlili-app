import { Resend } from 'resend';
import { db } from '../../utils/firebase'; 
import { doc, runTransaction, increment } from 'firebase/firestore';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST = async ({ request }) => {
  const data = await request.json();
  const { productos, total, usuarioEmail } = data;

  try {
    // --- 1. LÓGICA DE ACTUALIZACIÓN DE STOCK EN FIREBASE ---
    await runTransaction(db, async (transaction) => {
      
      // Iteramos sobre cada producto del carrito
      for (const item of productos) {
        
        if (!item.id) {
          throw new Error("El ID del producto no llegó a la API");
        }

        // Definimos la referencia al documento dentro del bucle
        const productRef = doc(db, 'productos', item.id);
        
        // Obtenemos los datos actuales del producto directamente de la DB
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists()) {
          throw new Error(`El producto ${item.nombre} ya no existe en la base de datos.`);
        }

        const currentStock = productDoc.data().stock || 0;

        // --- VALIDACIÓN DE STOCK ---
        if (currentStock < item.cantidad) {
          throw new Error(`Lo sentimos, solo quedan ${currentStock} unidades de ${item.nombre}.`);
        }

        // Si hay stock suficiente, preparamos la actualización
        transaction.update(productRef, {
          stock: increment(-item.cantidad)
        });
      }
    });

    // --- 2. ENVÍO DE CORREO (Solo si la transacción fue exitosa) ---
    const listaProductosHTML = productos.map(p =>
      `<li>${p.nombre} (x${p.cantidad}) - $${(p.precio * p.cantidad).toFixed(2)}</li>`
    ).join('');

    await resend.emails.send({
      from: 'Inventario <onboarding@resend.dev>',
      to: 'marck.cena1@gmail.com',
      subject: `🚨 Pedido Confirmado - Stock Actualizado`,
      html: `
        <div style="font-family: sans-serif;">
          <h1>Nuevo Pedido Recibido</h1>
          <p><strong>Usuario:</strong> ${usuarioEmail}</p>
          <ul>${listaProductosHTML}</ul>
          <p><strong>Total:</strong> $${total}</p>
          <hr>
          <p style="color: green;"><em>El inventario se ha actualizado automáticamente en Firebase.</em></p>
        </div>
      `
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Error en el proceso:", error);
    // Enviamos el mensaje de error específico (como el de stock) al Frontend
    return new Response(JSON.stringify({
      error: "No se pudo procesar el pedido.",
      details: error.message
    }), { status: 500 });
  }
};