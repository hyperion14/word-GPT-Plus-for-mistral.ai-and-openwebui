# Word‑Plugin → OpenWebUI: 401 Unauthorized

## Symptom
```
POST /bhk-api/api/v1/chat/completions  → 401
Error: 401: {"detail":"401 Unauthorized"}
```

## Root Cause
Der im Plugin unter **Settings → Open WebUI → "JWT Token"** hinterlegte Token ist abgelaufen. OWUI vergibt JWTs mit Default‑Lebensdauer **4 Wochen** (`JWT_EXPIRES_IN=4w`). Nach Ablauf liefert `decode_token()` `None`, OWUI antwortet 401 mit Body `{"detail":"401 Unauthorized"}` — diese exakte Zeichenkette stammt aus `ERROR_MESSAGES.UNAUTHORIZED` in `open_webui/utils/auth.py`.

Der "security"‑Commit `808c10f` (bind ports to 127.0.0.1) hat damit **nichts** zu tun — der Plugin‑Container erreicht OWUI über das Docker‑Netz `bhk-rag-network`, nicht über Host‑Ports.

## Fix
Statt JWT einen persistenten **API‑Key** im selben Feld eintragen — OWUI akzeptiert beide Formate (Unterscheidung per `sk-`‑Prefix).

**Aktuell vorhandener Admin‑API‑Key (admin@bhk-x.de):**
```
sk-37d89e33c44f4b34b8bb490a33e2bc85
```

**Settings im Word‑Plugin:**
- Base URL: `https://wordai.hekanet.de/bhk-api`
- JWT Token (Feld‑Label irreführend — nimmt auch API‑Keys): `sk-37d89e33c44f4b34b8bb490a33e2bc85`

API‑Keys laufen nicht ab → Problem kommt nicht wieder.

## Neuen API‑Key erzeugen
Für andere User: in OWUI einloggen → **Settings → Account → API Keys → Create new secret key**, oder direkt in der DB:
```sql
-- Datenbank: openwebui (bhk-postgres-webui)
SELECT u.email, substring(a.key,1,8) AS prefix, to_timestamp(a.created_at) AS created
FROM api_key a JOIN "user" u ON u.id=a.user_id;
```

## Verifizieren
Vom Plugin‑Container aus testen, ob der Token am OWUI durchgeht:
```bash
docker exec word-plugin-v201 sh -c "wget -qO- --timeout=5 \
  --header='Authorization: Bearer <TOKEN>' \
  http://bhk-open-webui:8080/api/models"
```
- 200 mit JSON‑Liste → Auth ok
- 401 → Token ungültig/abgelaufen
- Connection error → Netz‑Problem (sehr unwahrscheinlich, beide Container hängen am `bhk-rag-network`)

## Relevante Code‑Pfade

**Plugin (sendet Token):**
- `src/api/union.ts:208` — `Authorization: Bearer ${opts.openwebuiAPIKey}`
- `src/settings/storage.ts:246` — Token aus `localStorage.openwebuiAPIKey`

**OWUI (validiert Token):**
- `open_webui/utils/auth.py:322` — `if token.startswith('sk-')` → API‑Key‑Pfad, sonst JWT
- `open_webui/utils/auth.py:214` — `decode_token` (gibt `None` bei Ablauf/falscher Signatur)
- `open_webui/utils/auth.py:391` — wirft `UNAUTHORIZED` wenn `decoded` kein `id` hat
- `open_webui/constants.py:47` — `UNAUTHORIZED = '401 Unauthorized'`
