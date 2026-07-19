# Deployment Explanation & Next Steps

This document outlines the current state of your deployment for **CampusConnect** and the exact steps you need to take to complete it successfully.

## 1. Current State of the Codebase
The project is completely stable, QA-tested, and production-ready. The frontend successfully builds without errors (via `npm run build`), generating a highly optimized `dist` folder. The MongoDB database is perfectly structured with zero orphaned records.

Your frontend is currently successfully deployed on Vercel. However, it will not fetch data until the backend is also deployed and connected.

## 2. Step-by-Step Guide to Complete the Deployment

To make your app fully functional in production, follow these steps exactly:

### Step 1: Deploy Your Backend (easiest on Render.com)
Since your backend is an Express Node.js application, Render is usually the easiest place to host it for free.

1. Create a free account at [Render.com](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. When configuring the Web Service:
   - **Root Directory:** Type `backend` (since your server code is inside the backend folder).
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Scroll down to **Environment Variables** and add everything from your local `.env` file (e.g., `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_URL`, etc.).
6. Click **Create Web Service**. Wait for it to deploy and copy the provided URL (e.g., `https://campusconnect-api.onrender.com`).

### Step 2: Update the Frontend to Point to the New Backend
Right now, your React code is trying to talk to `http://localhost:5001`. You need to change this so it talks to the Render URL you just got.

1. Open your project locally in VS Code.
2. Search across your `src` folder (specifically in the `src/store` files like `authStore.js`, `clubStore.js`, `eventStore.js`, etc.) for `http://localhost:5001`.
3. Change those URLs from this:
   ```javascript
   axios.post('http://localhost:5001/api/auth/login')
   ```
   To use an environment variable like this:
   ```javascript
   // Define a base URL variable at the top of your store files:
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
   
   // Then use it in your calls:
   axios.post(`${API_URL}/auth/login`)
   ```
4. Commit and push these changes to GitHub. Vercel will automatically start a new build.

### Step 3: Add the Environment Variable to Vercel
You need to tell Vercel what `VITE_API_URL` is.

1. Go to your Vercel Dashboard and click on your deployed frontend project.
2. Go to **Settings** > **Environment Variables**.
3. Add a new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** Paste your deployed backend URL here (e.g., `https://campusconnect-api.onrender.com/api`).
4. Click **Save**.
5. Go to the **Deployments** tab in Vercel, click the three dots on your latest deployment, and select **Redeploy** so it picks up the new variable.

### Step 4: Fix Backend CORS
When your backend receives a request from your Vercel frontend, it might block it for security reasons (CORS). You need to whitelist your Vercel URL.

1. Open `backend/server.js` (or `app.js`).
2. Find the CORS configuration and update it:
   ```javascript
   app.use(cors({
     origin: ['http://localhost:5173', 'https://your-vercel-frontend-url.vercel.app'],
     credentials: true
   }));
   ```
3. Commit and push this to GitHub. Render will automatically redeploy your backend.

## Summary Checklist
- [ ] Backend deployed to Render (or similar).
- [ ] Frontend code updated to use `import.meta.env.VITE_API_URL` instead of `localhost:5001`.
- [ ] `VITE_API_URL` added to Vercel Environment Variables.
- [ ] Frontend redeployed on Vercel.
- [ ] Backend CORS updated to allow the Vercel URL.
