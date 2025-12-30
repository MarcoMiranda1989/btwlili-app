import React, { useState } from 'react';
import { auth } from '../utils/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      // 1. Crear el usuario en Firebase Authentication
      await createUserWithEmailAndPassword(auth, email, password);
      
      alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
      
      // Redirigimos al login para que el usuario entre formalmente
      window.location.href = '/login';
    } catch (error) {
      // Manejo de errores comunes (ej: contraseña muy corta o email ya usado)
      if (error.code === 'auth/email-already-in-use') {
        alert("Este correo ya está registrado.");
      } else if (error.code === 'auth/weak-password') {
        alert("La contraseña debe tener al menos 6 caracteres.");
      } else {
        alert("Error: " + error.message);
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-[#1E293B] rounded-xl shadow-lg border border-slate-700">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Crear Cuenta</h2>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-zinc-400 mb-1">Email</label>
          <input 
            type="email" 
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-[#7DD3FC]"
          />
        </div>
        <div>
          <label className="block text-zinc-400 mb-1">Contraseña</label>
          <input 
            type="password" 
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white focus:outline-none focus:border-[#7DD3FC]"
          />
        </div>
        <button 
          type="submit" 
          disabled={cargando}
          className={`w-full py-2 rounded font-bold transition ${cargando ? 'bg-slate-600' : 'bg-[#7DD3FC] text-[#1E293B] hover:bg-[#7DD3FC]/80'}`}
        >
          {cargando ? 'Registrando...' : 'Registrarme'}
        </button>
      </form>
    </div>
  );
}