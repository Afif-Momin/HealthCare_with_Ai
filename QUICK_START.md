# 🚀 Quick Start - Deploy to Render in 5 Minutes

## TL;DR - What Was Wrong & What's Fixed

**Problem:** Backend wasn't binding to the correct port and address on Render.

**Fix:** Backend now uses `PORT` environment variable and binds to `0.0.0.0`.

---

## 5-Minute Deployment

### 1. Push Changes (30 seconds)
```bash
git add .
git commit -m "Fix Render deployment"
git push origin main
```

### 2. Deploy on Render (1 minute)
1. Go to https://dashboard.render.com
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repo
4. Click **"Apply"**

Render will create all 4 services automatically.

### 3. Set Secrets (2 minutes)

Go to **healthcare-backend** service → **Environment** tab.

Add these 4 REQUIRED variables:

```
DATABASE_PASSWORD = npg_y4I3oGnubTSJ
GEMINI_API_KEY = AIzaSyD8X8qD4hM7wiD0Be-8JAqkMHj6LrjllNo
ADMIN_EMAIL = ismailmansury9737@gmail.com
ADMIN_PASSWORD = Ismail@786
```

Click **"Save Changes"** (service auto-redeploys).

### 4. Update Frontend URLs (1 minute)

Go to **healthcare-frontend** service → **Environment** tab.

Update these 2 variables with your actual backend URLs:

```
VITE_API_BASE_URL = https://healthcare-backend-XXXX.onrender.com/api
VITE_AI_API_BASE_URL = https://healthcare-ai-XXXX.onrender.com
```

Replace `XXXX` with your actual service URL from the dashboard.

Click **"Save Changes"**.

### 5. Test (30 seconds)

```bash
curl https://healthcare-backend-XXXX.onrender.com/api/health
```

Should return:
```json
{"status":"UP","service":"Medical AI Backend","timestamp":"..."}
```

---

## ✅ Done!

Your services are now live at:
- Backend: `https://healthcare-backend-XXXX.onrender.com`
- AI API: `https://healthcare-ai-XXXX.onrender.com`
- LungAI: `https://healthcare-lungai-XXXX.onrender.com`
- Frontend: `https://healthcare-frontend-XXXX.onrender.com`

---

## 🐛 Troubleshooting

### Backend shows "Service Unavailable"
**Wait 2-3 minutes** - First deployment takes time.

Still not working? Check:
1. Did you set `DATABASE_PASSWORD`?
2. Did you set `GEMINI_API_KEY`?
3. Check logs: Dashboard → Service → Logs

### Frontend can't reach backend
Update `VITE_API_BASE_URL` in frontend environment variables.

### Need more help?
See `RENDER_DEPLOYMENT_GUIDE.md` for detailed troubleshooting.

---

## 🔒 Security Note

**IMPORTANT:** After deployment, change these default credentials:
- Database password
- Gemini API key
- Admin password

Never commit real credentials to Git!

---

## 💰 Cost

All services are on **FREE tier**:
- Backend: Free (spins down after 15 min inactivity)
- AI Services: Free (spins down after 15 min inactivity)
- Frontend: Free (never spins down, CDN-served)

**Upgrade to always-on:** $7/month for backend only.

---

## 📚 More Info

- **Full Guide:** `RENDER_DEPLOYMENT_GUIDE.md`
- **What Changed:** `FIXES_APPLIED.md`
- **Environment Variables:** `.env.example`
- **Health Check Script:** `./test-backend-health.sh`

---

**That's it! Your app is now live on Render. 🎉**
