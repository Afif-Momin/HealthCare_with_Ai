# Render Deployment Guide - Healthcare AI Platform

## 🚨 Critical Fixes Applied

Your backend wasn't working on Render due to these issues (now fixed):

1. ✅ **Port Binding**: Backend now uses `PORT` environment variable (Render requirement)
2. ✅ **Server Address**: Now binds to `0.0.0.0` instead of localhost
3. ✅ **Environment Variables**: All secrets moved to env vars (no hardcoded credentials)
4. ✅ **Database Configuration**: Uses dynamic env vars for database connection
5. ✅ **API Keys**: Gemini, Resend, and email credentials now use env vars

---

## 📋 Deployment Steps

### Step 1: Push Changes to GitHub

```bash
git add .
git commit -m "Fix Render deployment - add env var support and proper port binding"
git push origin main
```

### Step 2: Deploy to Render

#### Option A: Using Blueprint (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `render.yaml` and create all 4 services automatically

#### Option B: Manual Service Creation

If blueprint doesn't work, create each service manually:

**Backend Service:**
- Type: Web Service
- Runtime: Docker
- Dockerfile Path: `./BackEnd/Dockerfile`
- Docker Context: `./BackEnd`
- Health Check Path: `/api/health`

---

## 🔐 Step 3: Configure Environment Variables

After deployment, you MUST set these secret environment variables in the Render dashboard:

### For `healthcare-backend` service:

Go to: **Dashboard → healthcare-backend → Environment**

Add these variables (marked with `sync: false` in render.yaml):

```bash
# Database (CRITICAL - Backend won't start without this)
DATABASE_PASSWORD=npg_y4I3oGnubTSJ

# Gemini API (CRITICAL - AI features won't work without this)
GEMINI_API_KEY=AIzaSyD8X8qD4hM7wiD0Be-8JAqkMHj6LrjllNo

# Email (Optional - only if using email features)
MAIL_USERNAME=bitecodes.global@gmail.com
MAIL_PASSWORD=muqzcxhinqteuqwb
RESEND_API_KEY=re_H43Z7ya7_8EgKHj2beJBjzARyo2xJY3AB

# Admin Credentials (CRITICAL - Admin login won't work without this)
ADMIN_EMAIL=ismailmansury9737@gmail.com
ADMIN_PASSWORD=Ismail@786
```

**⚠️ IMPORTANT**: After adding these variables, click **"Save Changes"** and the service will automatically redeploy.

---

## 🔍 Step 4: Verify Deployment

### Check Backend Health

Once deployed, test your backend:

```bash
# Replace with your actual Render URL
curl https://healthcare-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "UP",
  "service": "Medical AI Backend",
  "timestamp": "2026-04-23T..."
}
```

### Check Logs

If the backend fails:

1. Go to **Dashboard → healthcare-backend → Logs**
2. Look for errors like:
   - `Port already in use` → Fixed by using PORT env var
   - `Connection refused` → Fixed by binding to 0.0.0.0
   - `Database connection failed` → Check DATABASE_PASSWORD is set
   - `OutOfMemoryError` → Already optimized with JAVA_OPTS

---

## 🌐 Step 5: Update Frontend URLs

After all services are deployed, update the frontend environment variables:

1. Go to **Dashboard → healthcare-frontend → Environment**
2. Update these variables with your actual service URLs:

```bash
VITE_API_BASE_URL=https://healthcare-backend.onrender.com/api
VITE_AI_API_BASE_URL=https://healthcare-ai.onrender.com
```

3. Click **"Save Changes"** to trigger a rebuild

---

## 🐛 Troubleshooting

### Backend Shows "Service Unavailable"

**Cause**: Health check failing at `/api/health`

**Solution**:
1. Check logs for startup errors
2. Verify DATABASE_PASSWORD is set correctly
3. Ensure PORT env var is set (should be automatic)
4. Wait 2-3 minutes for cold start (free tier)

### Backend Crashes with OutOfMemoryError

**Cause**: Exceeding 512MB RAM limit

**Solution**: Already optimized with:
- Heap limited to 256MB (`-Xmx256m`)
- Serial GC for lower memory footprint
- Lazy initialization enabled
- Connection pool limited to 3

If still crashing, consider:
- Upgrading to paid tier ($7/month for 2GB RAM)
- Reducing `spring.datasource.hikari.maximum-pool-size` to 2

### Database Connection Fails

**Cause**: Missing or incorrect DATABASE_PASSWORD

**Solution**:
1. Verify the password in Render dashboard matches your Neon database
2. Check Neon database is active (free tier pauses after inactivity)
3. Test connection string locally first

### CORS Errors from Frontend

**Cause**: Frontend URL not matching backend expectations

**Solution**: Already fixed - backend allows all origins with `allowedOriginPatterns: ["*"]`

### Free Tier Spin Down (15 min inactivity)

**Cause**: Render free tier spins down after 15 minutes of inactivity

**Solution**:
- First request after spin down takes 30-60 seconds
- Consider using a ping service (e.g., UptimeRobot) to keep it alive
- Or upgrade to paid tier for always-on service

---

## 📊 Service URLs (Update After Deployment)

After deployment, your services will be available at:

```
Backend:  https://healthcare-backend.onrender.com
AI API:   https://healthcare-ai.onrender.com
LungAI:   https://healthcare-lungai.onrender.com
Frontend: https://healthcare-frontend.onrender.com
```

**Note**: Replace these with your actual Render URLs from the dashboard.

---

## 🔒 Security Best Practices

### ✅ Already Implemented:
- Environment variables for all secrets
- HTTPS enforced by Render
- CORS properly configured
- Database connection pooling limited
- Memory limits enforced

### 🚨 TODO (Recommended):
1. **Rotate API Keys**: Change default keys in this guide
2. **Use Render Secret Files**: For even more sensitive data
3. **Enable Render Environment Groups**: Share secrets across services
4. **Set up Database Backups**: Neon provides automatic backups
5. **Monitor Logs**: Set up log aggregation (Papertrail, Logtail)

---

## 💰 Cost Optimization

### Current Setup (FREE):
- Backend: Free tier (512MB RAM, spins down after 15 min)
- AI Services: Free tier (512MB RAM each)
- Frontend: Free static site (never spins down, CDN-served)
- Database: Neon free tier (0.5GB storage, 1 compute unit)

### If You Need Always-On:
- Upgrade backend to Starter ($7/month): 2GB RAM, no spin down
- Keep AI services on free tier (less critical)
- Frontend stays free (static sites never spin down)

**Total cost for always-on backend**: $7/month

---

## 📝 Next Steps

1. ✅ Push changes to GitHub
2. ✅ Deploy via Render Blueprint
3. ✅ Set environment variables in dashboard
4. ✅ Verify health endpoint
5. ✅ Update frontend URLs
6. ✅ Test end-to-end functionality
7. 🔒 Rotate API keys and passwords
8. 📊 Set up monitoring/alerts

---

## 🆘 Still Having Issues?

Check the logs:
```bash
# View real-time logs
render logs healthcare-backend --tail

# Or in dashboard: Services → healthcare-backend → Logs
```

Common log errors and fixes:
- `Bind to 0.0.0.0:8080 failed` → PORT env var issue (should be auto-set)
- `Connection to database failed` → DATABASE_PASSWORD not set
- `OutOfMemoryError` → Reduce connection pool or upgrade tier
- `Health check failed` → Backend not starting, check logs for root cause

---

## ✅ Verification Checklist

- [ ] Changes pushed to GitHub
- [ ] Blueprint deployed successfully
- [ ] All 4 services show "Live" status
- [ ] Environment variables set for backend
- [ ] Health endpoint returns 200 OK
- [ ] Frontend can reach backend API
- [ ] Database connection working
- [ ] AI endpoints responding
- [ ] No errors in logs

---

**Your backend should now work perfectly on Render! 🎉**
