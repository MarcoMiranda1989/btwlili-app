// src/components/ProductList.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, query, getDocs } from 'firebase/firestore';

export default function ProductList() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const productosRef = collection(db, 'productos');
        const q = query(productosRef);
        const querySnapshot = await getDocs(q);

        const productosArray = [];
        querySnapshot.forEach((doc) => {
          productosArray.push({ id: doc.id, ...doc.data() });
        });

        setProductos(productosArray);
        setCargando(false);
      } catch (error) {
        console.error("Error al obtener productos:", error);
        setCargando(false);
      }
    };

    fetchProductos();
  }, []);

  const agregarAlCarrito = (producto) => {
    // 1. Verificación de sesión
    const cookies = document.cookie.split('; ');
    const sessionActive = cookies.find(row => row.startsWith('user_session='));

    if (!sessionActive) {
      alert("Tu sesión ha expirado o no has iniciado sesión. Redirigiendo...");
      window.location.href = '/login';
      return;
    }

    // 2. Obtener carrito de localStorage
    const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];

    // 3. BUSCAR SI YA EXISTE EN EL CARRITO PARA COMPROBAR EL STOCK
    const existe = carritoActual.find(item => item.id === producto.id);

    // --- NUEVA LÓGICA DE COMPROBACIÓN DE STOCK ---
    if (existe) {
      // Si ya está en el carrito, verificamos si al sumar 1 superamos el stock disponible
      if (existe.cantidad >= producto.stock) {
        alert(`Lo sentimos, solo hay ${producto.stock} unidades disponibles de este producto y ya las tienes en tu carrito.`);
        return; // Detenemos la ejecución aquí
      }
    } else {
      // Si no está en el carrito, verificamos si al menos hay 1 en stock (aunque el botón ya debería estar deshabilitado)
      if (producto.stock <= 0) {
        alert("Este producto se encuentra agotado.");
        return;
      }
    }
    // --- FIN DE LÓGICA DE COMPROBACIÓN ---

    let carritoActualizado;

    if (existe) {
      // Si existe y pasó la validación, sumamos 1
      carritoActualizado = carritoActual.map(item =>
        item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
      );
    } else {
      // Si no existe, lo agregamos con cantidad inicial de 1
      carritoActualizado = [...carritoActual, { ...producto, cantidad: 1 }];
    }

    // 4. Guardar y notificar
    localStorage.setItem('carrito', JSON.stringify(carritoActualizado));
    alert(`${producto.nombre} añadido al carrito.`);
  };

  if (cargando) {
    return <p className="text-center p-4 text-white">Cargando inventario...</p>;
  }

  if (productos.length === 0) {
    return <p className="text-center p-4 text-red-500">No se encontraron artículos.</p>;
  }

  return (
    <ul className="grid gap-6 p-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {productos.map((producto) => (
        <li key={producto.id} className="bg-[#1E293B] shadow-lg rounded-lg overflow-hidden border border-slate-700 flex flex-col">

          {producto.url_imagen && (
            <img
              src={producto.url_imagen}
              alt={producto.nombre}
              className="w-full h-70 object-cover"
            />
          )}

          <div className="p-4 flex flex-col grow">
            <h2 className="text-xl font-bold text-zinc-200">{producto.nombre}</h2>
            <p className="text-2xl font-semibold text-[#7DD3FC] mt-1">${producto.precio}</p>
            <p className="text-xs font-medium text-zinc-400 uppercase mt-2 tracking-wider">
              {producto.categoria}
            </p>

            {/* Muestra visual de stock */}
            <p className={`text-sm font-bold mt-2 ${producto.stock > 0 ? 'text-green-400' : 'text-red-500'}`}>
              {producto.stock > 0 ? `Disponibles: ${producto.stock} pzs` : 'Agotado'}
            </p>

            <button
              onClick={() => agregarAlCarrito(producto)}
              disabled={producto.stock <= 0}
              className={`mt-2 w-full py-2 px-4 rounded font-bold transition ${producto.stock > 0
                  ? 'bg-[#7DD3FC] text-[#1E293B] hover:bg-[#7DD3FC]/80'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              {producto.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
            </button>

            <p className="text-sm text-zinc-300 mt-2 line-clamp-3 grow">
              {producto.descripcion}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}