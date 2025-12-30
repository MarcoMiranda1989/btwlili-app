// src/components/ProductForm.jsx

import React, { useState } from 'react';
// Importamos la función que se conecta a Firestore
import { crearNuevoProducto } from '../utils/createProduct';

// Opciones predefinidas para la categoría (ayuda a mantener la consistencia en la DB)
const CATEGORIAS = ['electronica', 'oficina', 'accesorios', 'muebles', 'otro'];

export default function ProductForm() {

  // 1. Estado para almacenar los datos de los inputs del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '', // Usamos string para el input
    categoria: CATEGORIAS[0], // Usamos la primera categoría por defecto
    url_imagen: '',
    stock: 0,
  });

  // Estado para la interfaz (manejo de carga y errores)
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  // 2. Función genérica para manejar los cambios en cualquier input
  const handleChange = (e) => {
    // Usamos el atributo 'name' del input para actualizar el campo correspondiente
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null); // Limpiar errores al escribir
  };

  // 3. Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    try {
      // a) Preparamos los datos
      const dataToSend = {
        ...formData,
        // b) Convertimos el precio a número (es esencial para el filtrado en Firestore)
        precio: Number(formData.precio),
        stock: Number(formData.stock),
        // c) Aseguramos que la imagen sea un string vacío si está vacía
        url_imagen: formData.url_imagen || null,
      };

      // 4. Llamamos a la función de Firebase para guardar el producto
      const newId = await crearNuevoProducto(dataToSend);

      console.log(`Producto creado con éxito, ID: ${newId}`);

      // 5. Redirección después del éxito (Navegación de Astro)
      // Esto llevará al usuario a la página de listado
      alert("¡Producto creado con éxito!");
      window.location.href = '/';

    } catch (err) {
      console.error("Fallo al crear el producto:", err);
      // Mostrar el error en la interfaz
      setError(err.message || "Error desconocido al guardar el producto.");
      setCargando(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">

      {error && (
        <p className="p-3 mb-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          Error: {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Campo Nombre */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Producto *</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* Campo Precio */}
        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-gray-700">Precio ($) *</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* Campo Categoría (Select/Dropdown) */}
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoría *</label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Campo Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          ></textarea>
        </div>

        {/* Campo URL de Imagen (Temporal) */}
        <div>
          <label htmlFor="url_imagen" className="block text-sm font-medium text-gray-700">URL de Imagen (Temporal)</label>
          <input
            type="text"
            id="url_imagen"
            name="url_imagen"
            value={formData.url_imagen}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">Más adelante implementaremos la subida directa del archivo.</p>
        </div>

        {/* Campo Stock / Existencias */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Existencias (Stock) *</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* Botón de Envío */}
        <button
          type="submit"
          disabled={cargando}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-150 ${cargando ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {cargando ? 'Guardando...' : 'Crear Producto'}
        </button>
      </form>
    </div>
  );
}