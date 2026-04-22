# FDUSD Tracker

App de portfolio crypto con precios en tiempo real (Binance WebSocket) y monitor de ratio BTC/ETH.

## Deploy en Vercel (3 pasos)

### Opción A — GitHub + Vercel (recomendado)

1. Sube esta carpeta a un repositorio de GitHub
2. Entra a [vercel.com](https://vercel.com) → New Project → importa tu repo
3. Vercel detecta Vite automáticamente → Deploy ✅

### Opción B — Vercel CLI

```bash
npm install -g vercel
npm install
vercel
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Instalar como app en el celular (PWA)

1. Abre la URL de Vercel en Chrome/Safari
2. En el menú del navegador: "Agregar a pantalla de inicio"
3. Se instala como app nativa 📱

## Características

- ⚡ Precios en tiempo real via WebSocket (Binance)
- 📊 Monitor de ratio BTC/ETH con zonas neutral/señal
- 🎯 Metas por unidades con alertas de sonido
- 📱 PWA instalable en celular
- 💾 Datos guardados en localStorage
- 🔔 Alertas sonoras automáticas
