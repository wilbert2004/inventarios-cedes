import { defineConfig } from 'vite';
import path from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';

// Función para copiar directorios recursivamente
function copyDir(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  const entries = readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      formats: ['cjs'],
      fileName: () => 'main.js',
    },
    outDir: path.resolve(__dirname, '.vite/main'),
    emptyOutDir: false,
    rollupOptions: {
      // Externalizar TODOS los módulos - no empaquetar nada
      // Esto preserva la estructura de archivos y las rutas relativas
      external: () => true,
    },
  },
  plugins: [
    {
      name: 'copy-main-files',
      closeBundle() {
        // Copiar todos los archivos del main process preservando la estructura
        const srcMainDir = path.resolve(__dirname, 'src/main');
        const outMainDir = path.resolve(__dirname, '.vite/main/main');
        
        if (existsSync(srcMainDir)) {
          try {
            copyDir(srcMainDir, outMainDir);
            console.log('✓ Copied main directory structure (including utils)');
          } catch (error) {
            console.warn('Could not copy main files:', error.message);
          }
        }
      },
    },
  ],
});
