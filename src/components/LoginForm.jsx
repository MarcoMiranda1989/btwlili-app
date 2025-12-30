import React, { useState } from 'react';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Firebase verifica si el usuario existe y la clave es correcta
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Obtenemos un "Token" (una clave secreta temporal) de Firebase
      const token = await user.getIdToken();

      // 3. GUARDAMOS LA COOKIE
      // Aquí creamos el "sello". 'session' es el nombre, token es el valor.
      // max-age=3600 significa que dura 1 hora.
      document.cookie = `user_session=${token}; path=/; max-age=3600; samesite=strict`;
      document.cookie = `user_email=${user.email}; path=/; max-age=3600; samesite=strict`;

      alert("¡Bienvenido!");
      window.location.href = '/nuevo-producto'; // Redirigir
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl mb-4">Iniciar Sesión</h2>
      <input
        type="email"
        placeholder="Correo"
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-2 p-2 border"
      />
      <input
        type="password"
        placeholder="Contraseña"
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        Entrar
      </button>

      {/* --- Enlace para Crear Cuenta --- */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          ¿No tienes una cuenta? {' '}
          <a href="/sign-up" className="text-blue-600 font-semibold hover:underline">
            Regístrate aquí
          </a>
        </p>
      </div>
    </form>
  );
}