import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

const ReactCompilerConfig = { /* ... */ };

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [react({
    babel: {
      plugins: [
        ["babel-plugin-react-compiler", ReactCompilerConfig],
      ],
    },
  }), tsconfigPaths(), tailwindcss()],
});
