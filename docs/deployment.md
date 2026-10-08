# RapidPath Deployment Guide

## 1. Backend Deployment (Render)

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your Git repository.
3. Configure settings:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Set Environment Variables in Render Dashboard:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/rapidpath`
   - `GEMINI_API_KEY=<your_gemini_api_key>`
   - `GEMINI_MODEL=gemini-1.5-flash`
   - `GOOGLE_MAPS_SERVER_API_KEY=<your_google_maps_backend_key>`
   - `FRONTEND_URL=https://your-rapidpath-client.vercel.app`
5. Set Health Check path: `/api/health`.

---

## 2. Frontend Deployment (Vercel)

1. Create a new project on [Vercel](https://vercel.com).
2. Import your Git repository.
3. Configure project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Set Environment Variables:
   - `VITE_API_BASE_URL=https://your-rapidpath-server.onrender.com/api`
   - `VITE_GOOGLE_MAPS_BROWSER_API_KEY=<restricted_maps_js_api_key>`

---

## 3. MongoDB Atlas Setup

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write access.
3. Add `0.0.0.0/0` or Render outbound IP to Network Access.
4. Copy the connection string into `MONGODB_URI`.
