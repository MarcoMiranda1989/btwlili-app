// src/components/CartView.jsx
import React, { useState, useEffect } from 'react';

export default function CartView() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(false); // Estado para bloquear el botón mientras se envía

  useEffect(() => {
    // Leer los productos al cargar
    const guardados = JSON.parse(localStorage.getItem('carrito')) || [];
    setItems(guardados);
  }, []);

  const eliminarDelCarrito = (id) => {
    const nuevosItems = items.filter(item => item.id !== id);
    setItems(nuevosItems);
    localStorage.setItem('carrito', JSON.stringify(nuevosItems));
  };

  const total = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const finalizarPedido = async () => {
    // 1. Obtener email de la cookie de forma segura
    const cookies = document.cookie.split('; ');
    const emailCookie = cookies.find(row => row.startsWith('user_email='));
    const usuarioEmail = emailCookie ? decodeURIComponent(emailCookie.split('=')[1]) : "Desconocido";

    if (!items.length) return alert("El carrito está vacío");

    setCargando(true); // Desactivamos el botón

    try {
      const response = await fetch('/api/enviar-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productos: items,
          total: total.toFixed(2),
          usuarioEmail: usuarioEmail
        })
      });

      // 2. IMPORTANTE: Extraemos el JSON antes de preguntar si la respuesta es OK
      const resultado = await response.json();

      if (response.ok) {
        alert("¡Pedido enviado correctamente! El stock ha sido actualizado.");
        localStorage.removeItem('carrito'); // Limpiamos el carrito
        window.location.href = '/';
      } else {
        // 3. Ahora 'resultado' sí existe aquí y podemos leer sus detalles
        throw new Error(resultado.details || resultado.error || "Error al procesar el pedido");
      }
    } catch (error) {
      // 4. Capturamos cualquier error (de red o lanzado por nosotros arriba)
      alert("⚠️ Hubo un problema: " + error.message);
    } finally {
      setCargando(false); // Reactivamos el botón
    }
  };

  if (items.length === 0) return <p className="text-white text-center">El carrito está vacío.</p>;

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 border-b pb-2">Resumen de Compra</h2>
      
      {items.map(item => (
        <div key={item.id} className="flex justify-between border-b py-2">
          <div>
            <p className="font-bold">{item.nombre} (x{item.cantidad})</p>
            <p className="text-sm text-gray-500">${item.precio} c/u</p>
            {/* Validación visual opcional: si cantidad > stock guardado en el item */}
            {item.stock && item.cantidad > item.stock && (
              <p className="text-red-500 text-xs font-bold">⚠️ Supera el stock disponible</p>
            )}
          </div>
          <div className="flex items-center">
            <span className="mr-4 font-bold">${(item.precio * item.cantidad).toFixed(2)}</span>
            <button 
              onClick={() => eliminarDelCarrito(item.id)}
              className="text-red-500 text-xs hover:underline"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}

      <div className="mt-6 text-right">
        <p className="text-2xl font-bold">Total: ${total.toFixed(2)}</p>
        
        <button 
          onClick={finalizarPedido} 
          disabled={cargando}
          className={`mt-4 px-6 py-2 rounded font-bold text-white transition-colors ${
            cargando 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {cargando ? 'Procesando...' : 'Finalizar Pedido'}
        </button>
      </div>
    </div>
  );
}