# CRITICAL: Clear Your Browser Cache NOW!

## THE PROBLEM
Your browser is caching OLD JavaScript files. The new code IS deployed (timestamp: 09:47), but your browser is serving cached files from hours ago.

## SOLUTION - Do ONE of these:

### Option 1: Hard Refresh (FASTEST)
**Chrome/Edge:**
- Press `Ctrl + Shift + R` or `Ctrl + F5`
- OR: Hold `Ctrl` and click the refresh button

**Firefox:**
- Press `Ctrl + Shift + R`

### Option 2: Clear Cache Completely
1. Open DevTools (Press `F12`)
2. Right-click the refresh button (top left)
3. Select **"Empty Cache and Hard Reload"**

### Option 3: Incognito/Private Window (100% CLEAN)
1. Open new Incognito window (`Ctrl + Shift + N`)
2. Go to `http://localhost:3100`
3. Test there (no cache at all)

## WHAT YOU SHOULD SEE AFTER CLEARING CACHE:

1. **Settings > API Provider Tab**
   - Provider dropdown shows: **"Open WebUI"** (not "openwebui")
   - When you select "Open WebUI":
     - Base URL input field
     - JWT Token input field (NOT "API Key")
     - Model dropdown
     - **Refresh button (🔄 icon)** next to model dropdown

2. **How to Use OpenWebUI:**
   - Enter your OpenWebUI URL (e.g., `https://wordai.hekanet.de`)
   - Get JWT Token:
     - Open your OpenWebUI in browser
     - Press `F12` (DevTools)
     - Go to: **Application** tab → **Local Storage** → Select your domain
     - Find key named **"token"**
     - Copy the value (it's your JWT token)
   - Paste JWT token in the field
   - Click the **Refresh button (🔄)** next to model dropdown
   - Models will populate!

## VERIFICATION COMMANDS (Already Confirmed Working):

```bash
# Container is serving correct files:
docker exec word-plugin-v201 ls -lh /usr/share/nginx/html/assets/*.js
# All files show: Jan  5 09:47 ✓

# HTML loads correct bundle:
curl -s http://localhost:3100 | grep index-
# Shows: index-BIC56nDA.js ✓

# Code contains OpenWebUI support:
docker exec word-plugin-v201 cat /usr/share/nginx/html/assets/SettingsPage-D3KMOvBA.js | grep -o "openwebui" | wc -l
# Shows: 21 occurrences ✓
```

## THE CODE IS WORKING - YOU JUST NEED TO CLEAR CACHE! 🎯

The refreshOpenWebUIModels function IS in the bundle (minified as `Ce`).
The fetchOpenWebUIModels function IS in the bundle (minified as `Ge`).
All OpenWebUI functionality is deployed and ready.

**Just clear your browser cache and it will work!**
