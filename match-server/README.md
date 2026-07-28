# Circle Clash Match Server

Авторитетный сервер приватных боёв 1 на 1. Состояние комнаты хранится только
в памяти процесса, а игровая симуляция выполняется на сервере с частотой 60 Гц.
Postgres и Supabase Realtime не используются как игровой транспорт.

```bash
npm install
npm run dev
```

Клиент по умолчанию подключается к `http://localhost:8787`. Для production
задайте `VITE_MATCH_SERVER_URL` во фронтенде и `CLIENT_ORIGINS` на сервере.

Проверки:

```bash
npm test
npm run build
```

Production endpoints: `/health`, `/ready`, `/status`. Сервер использует
структурированные JSON-логи, rate limiting для create/join и сообщений WebSocket,
а также единый JSON-формат непредвиденных ошибок. Полная инструкция:
[`../docs/DEPLOYMENT.md`](../docs/DEPLOYMENT.md).
