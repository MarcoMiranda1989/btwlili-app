// astro.config.mjs
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react'; // 1. Asegúrate de que esta dependencia esté importada

// https://astro.build/config
export default defineConfig({
    output: 'server',
    // 2. Aquí es donde van las integraciones de Astro
    integrations: [
        react(), // <-- SOLUCIÓN para habilitar el renderer de .jsx
    ],
    
    // 3. Mantienes tu configuración de Vite/Tailwind
    vite: {
        plugins: [tailwindcss()]
    }
});