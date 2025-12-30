// src/utils/createProduct.js

import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase'; // Asegúrate de que la ruta a tu firebase.js sea correcta

/**
 * Función para añadir un nuevo documento a la colección 'productos'.
 * * @param {object} productoData - Objeto con los datos del nuevo producto.
 * @returns {string} El ID del documento creado si tiene éxito.
 */
export const crearNuevoProducto = async (productoData) => {
  try {
    // 1. Validaciones básicas antes de enviar (opcional, pero recomendado)
    if (!productoData.nombre || !productoData.precio || !productoData.categoria) {
      throw new Error("Faltan campos obligatorios: nombre, precio y categoría.");
    }
    
    // 2. Referencia a la colección 'productos'
    const productosCollection = collection(db, "productos");
    
    // 3. Ejecutar la función addDoc para añadir el documento
    const docRef = await addDoc(productosCollection, productoData);
    
    console.log("Nuevo producto creado con ID: ", docRef.id);
    
    // Devolvemos el ID generado por Firestore
    return docRef.id; 

  } catch (error) {
    console.error("Error al crear el nuevo producto:", error);
    // Relanzar el error para que el componente de React lo pueda manejar y mostrar al usuario
    throw new Error(`Fallo en la creación del producto: ${error.message}`);
  }
};