import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/alumno": {
        target: "http://34.195.71.215:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/alumno/, "/alumno"),
      },
      "/api/beca": {
        target: "http://34.195.71.215:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/beca/, "/beca"),
      },
      "/api/carrera": {
        target: "http://34.195.71.215:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/carrera/, "/carrera"),
      },
      "/api/pago": {
        target: "http://34.195.71.215:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/pago/, "/pago"),
      },
      "/api/login": {
        target: "http://34.195.71.215:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/login/, "/login"),
      },
      "/api/administrador": {
        target: "http://34.195.71.215:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) =>
          path.replace(/^\/api\/administrador/, "/administrador"),
      },
    },
  },
});
