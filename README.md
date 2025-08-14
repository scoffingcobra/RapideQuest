
# WhatsApp Web Clone

## Hardcoded values
- MongoDB URI: `mongodb+srv://whatsapp_user:Blingbling72@cluster0.hamannr.mongodb.net/whatsapp?retryWrites=true&w=majority&appName=cluster0`
- Backend port: `8080`
- Frontend API base: `http://localhost:8080/api`
- WebSocket URL: `http://localhost:8080`

## Backend
```
cd server
npm i
npm run dev
```
Endpoints under `http://localhost:8080/api`

### Load webhook payloads
Drop JSON files in `server/payloads/`, then:
```
npm run load -- payloads
```

## Frontend
```
cd web
npm i
npm run dev
```
Open `http://localhost:3000`

## Deploy
- Backend → Render (Web Service): build `npm install`, start `npm start`.
- Frontend → Vercel: update `web/app/api.ts` and `web/app/socket.ts` with your Render URL and redeploy.
# RapideQuest
