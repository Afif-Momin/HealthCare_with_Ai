# 🚀 Integrated Deployment Guide - Healthcare AI Platform

## 🎯 What Changed?

Your application now uses an **integrated architecture** where:

1. ✅ **Single Service** - Spring Boot serves both API and React frontend
2. ✅ **No CORS Issues** - Frontend and backend on same domain
3. ✅ **Simpler Deployment** - Only 3 services instead of 4
4. ✅ **Better Performance** - No cross-origin requests for API calls
5. ✅ **Lower Cost** - One less service to maintain

### Architecture

```
┌─────────────────────────────────────────┐
│  healthcare-with-ai.onrender.com        │
│  ┌───────────────────────────────────┐  │
│  │   Spring Boot (Port 8080)         │  │
│  │   ├─ /api/*  → REST API           │  │
│  │   └─ /*      → React Frontend     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  healthcare-ai.onrender.com             │
│  FastAPI Medical AI Models              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  healthcare-lungai.onrender.com         │
│  Gradio Lung Cancer Detection           │
└─────────────────────────────────────────┘
```

---

## 📋 Quick Deployment (5 Minutes)

### Step 1: Push Changes
```bash
git add .
git commit -m "Integrate frontend with backend - single service deployment"
git push origin main
```

### Step 2: Deploy to Render

#### Option A: Blueprint (Recommended)
1. Go to https://dashboard.render.com
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Click **"Apply"**

Render will create 3 services:
- `healthcare-with-ai` (Backend + Frontend)
- `healthcare-ai` (AI Models)
- `healthcare-lungai` (Lung Cancer Detection)

#### Option B: Manual Deployment
If blueprint doesn't work:

1. **Create Web Service**
   - Name: `healthcare-with-ai`
   - Runtime: Docker
   - Dockerfile Path: `./Dockerfile.integrated`
   - Docker Context: `.` (root)

2. **Add Environment Variables** (see Step 3)

### Step 3: Set Environment Variables

Go to **healthcare-with-ai** service → **Environment** tab.

#### Required Variables (MUST SET):
```bash
DATABASE_PASSWORD=npg_y4I3oGnubTSJ
GEMINI_API_KEY=AIzaSyD8X8qD4hM7wiD0Be-8JAqkMHj6LrjllNo
ADMIN_EMAIL=ismailmansury9737@gmail.com
ADMIN_PASSWORD=Ismail@786
```

#### Optional Variables (for email features):
```bash
MAIL_USERNAME=bitecodes.global@gmail.com
MAIL_PASSWORD=muqzcxhinqteuqwb
RESEND_API_KEY=re_H43Z7ya7_8EgKHj2beJBjzARyo2xJY3AB
```

Click **"Save Changes"** - service will auto-redeploy.

### Step 4: Update AI Service URL

After `healthcare-ai` is deployed, update the frontend to use the correct AI URL:

1. Go to **healthcare-with-ai** → **Environment**
2. Find `VITE_AI_API_BASE_URL`
3. Update to your actual AI service URL:
   ```
   VITE_AI_API_BASE_URL=https://healthcare-ai-XXXX.onrender.com
   ```
4. Click **"Save Changes"** (triggers rebuild)

### Step 5: Verify Deployment

```bash
# Test backend API
curl https://healthcare-with-ai-XXXX.onrender.com/api/health

# Test frontend (should return HTML)
curl https://healthcare-with-ai-XXXX.onrender.com/

# Test AI service
curl https://healthcare-ai-XXXX.onrender.com/health
```

---

## 🎉 Access Your Application

After deployment, your app will be available at:

```
Main App:  https://healthcare-with-ai.onrender.com
API:       https://healthcare-with-ai.onrender.com/api
AI Models: https://healthcare-ai.onrender.com
LungAI:    https://healthcare-lungai.onrender.com
```

**Note:** Replace with your actual Render URLs from the dashboard.

---

## 🔧 How It Works

### Build Process

1. **Frontend Build** (Stage 1)
   - Node.js builds React app with Vite
   - Output: `dist/` folder with HTML, JS, CSS
   - Environment variables baked into JS bundle

2. **Backend Build** (Stage 2)
   - Maven builds Spring Boot application
   - Frontend `dist/` copied to `src/main/resources/static/`
   - JAR file includes both backend code and frontend files

3. **Runtime** (Stage 3)
   - Spring Boot starts on port from `PORT` env var
   - Serves API endpoints at `/api/*`
   - Serves React frontend at `/*`
   - React Router handled by forwarding to `index.html`

### Request Routing

```
User Request → Spring Boot

/api/health          → HealthController (API)
/api/users           → UserController (API)
/                    → index.html (React)
/dashboard           → index.html (React Router)
/assets/main.js      → Static file (React)
/favicon.ico         → Static file
```

### Why This Is Better

| Aspect | Old (Separate) | New (Integrated) |
|--------|---------------|------------------|
| Services | 4 services | 3 services |
| CORS | Required | Not needed |
| API Calls | Cross-origin | Same-origin |
| Deployment | Complex | Simple |
| Cost | 4 services | 3 services |
| Maintenance | Multiple configs | Single config |

---

## 🔍 Troubleshooting

### Issue: "No static resource ." Error

**Cause:** Frontend files not included in JAR

**Solution:** 
1. Check build logs - frontend should build first
2. Verify `src/main/resources/static/` contains frontend files
3. Rebuild with `docker build -f Dockerfile.integrated .`

### Issue: React Routes Return 404

**Cause:** Spring Boot not forwarding to index.html

**Solution:** Already fixed with `WebConfig.java` - all non-API routes forward to index.html

### Issue: API Calls Fail from Frontend

**Cause:** Frontend using wrong API URL

**Solution:** 
- Check `VITE_API_BASE_URL=/api` in build logs
- Verify frontend is making requests to `/api/*` (relative URLs)
- Check browser console for errors

### Issue: Service Won't Start

**Cause:** Missing environment variables

**Solution:**
1. Check logs: Dashboard → Service → Logs
2. Verify `DATABASE_PASSWORD` is set
3. Verify `GEMINI_API_KEY` is set
4. Check database connection (Neon might be paused)

### Issue: Out of Memory Error

**Cause:** Exceeding 512MB RAM limit

**Solution:** Already optimized with:
- Heap limited to 256MB
- Serial GC
- Lazy initialization
- Small connection pool

If still failing, upgrade to Starter plan ($7/month for 2GB RAM)

---

## 📊 Service Status Check

### Check All Services

```bash
# Main app (Backend + Frontend)
curl https://healthcare-with-ai.onrender.com/api/health

# AI service
curl https://healthcare-ai.onrender.com/health

# LungAI service
curl https://healthcare-lungai.onrender.com/
```

### Expected Responses

**Main App:**
```json
{
  "status": "UP",
  "service": "Medical AI Backend",
  "timestamp": "2026-04-23T..."
}
```

**AI Service:**
```json
{
  "status": "healthy",
  "message": "Medical AI API is running",
  "version": "2.1.0"
}
```

---

## 🔐 Security Checklist

- [ ] All secrets set as environment variables
- [ ] No credentials in Git repository
- [ ] Database password changed from default
- [ ] Gemini API key is valid
- [ ] Admin password is strong
- [ ] CORS properly configured
- [ ] HTTPS enforced (automatic on Render)

---

## 💰 Cost Breakdown

### Free Tier (Current Setup)
- `healthcare-with-ai`: Free (512MB, spins down after 15 min)
- `healthcare-ai`: Free (512MB, spins down after 15 min)
- `healthcare-lungai`: Free (512MB, spins down after 15 min)

**Total: $0/month**

### Recommended Upgrade (Always-On)
- `healthcare-with-ai`: Starter ($7/month, 2GB RAM, no spin down)
- `healthcare-ai`: Free (less critical)
- `healthcare-lungai`: Free (less critical)

**Total: $7/month**

---

## 🚀 Performance Tips

### Reduce Cold Start Time
1. Use UptimeRobot to ping every 14 minutes
2. Upgrade to paid tier for always-on
3. Optimize Spring Boot startup (already done)

### Improve Response Time
1. Enable HTTP/2 (automatic on Render)
2. Use CDN for static assets (automatic)
3. Optimize database queries
4. Add Redis caching (requires paid tier)

---

## 📝 Environment Variables Reference

### Main Service (healthcare-with-ai)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | Auto | 8080 | Server port (set by Render) |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `DATABASE_USERNAME` | Yes | - | Database username |
| `DATABASE_PASSWORD` | Yes | - | Database password |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key |
| `GEMINI_API_URL` | No | v1 | Gemini API base URL |
| `GEMINI_API_MODEL` | No | flash-lite | Gemini model name |
| `ADMIN_EMAIL` | Yes | - | Admin login email |
| `ADMIN_PASSWORD` | Yes | - | Admin login password |
| `MAIL_USERNAME` | No | - | SMTP username |
| `MAIL_PASSWORD` | No | - | SMTP password |
| `RESEND_API_KEY` | No | - | Resend email API key |
| `VITE_API_BASE_URL` | No | /api | Frontend API URL |
| `VITE_AI_API_BASE_URL` | No | - | AI service URL |

---

## 🆘 Getting Help

### Check Logs
```bash
# Real-time logs
render logs healthcare-with-ai --tail

# Or in dashboard
Services → healthcare-with-ai → Logs
```

### Common Log Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Bind to 0.0.0.0:8080 failed` | PORT issue | Auto-set by Render |
| `Connection to database failed` | Missing PASSWORD | Set in dashboard |
| `OutOfMemoryError` | RAM limit | Already optimized |
| `Health check failed` | Service not starting | Check logs |
| `No static resource` | Frontend not built | Check build logs |

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Blueprint deployed on Render
- [ ] All 3 services show "Live" status
- [ ] Environment variables set
- [ ] Health endpoints return 200 OK
- [ ] Frontend loads in browser
- [ ] API calls work from frontend
- [ ] AI service accessible
- [ ] No errors in logs
- [ ] Database connection working

---

## 🎯 Success Indicators

Your deployment is successful when:

1. ✅ Main app URL loads React frontend
2. ✅ `/api/health` returns JSON response
3. ✅ Frontend can make API calls
4. ✅ Login/signup works
5. ✅ AI predictions work
6. ✅ No CORS errors in browser console
7. ✅ All services show "Live" in dashboard

---

## 📚 Additional Resources

- **Render Docs:** https://render.com/docs
- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **React Router:** https://reactrouter.com
- **Vite Docs:** https://vitejs.dev

---

**Your integrated application is now ready for production! 🎉**

All services are properly configured, frontend is integrated with backend, and everything should work seamlessly on Render.
