# Deployment и эксплуатация

Клиент и авторитетный match-server разворачиваются отдельно. Vercel не подходит
для постоянных WebSocket-соединений сервера, поэтому клиент размещается на Vercel,
а `match-server` — как отдельный Node.js web service (Render Blueprint или Docker).

## 1. Проверка перед публикацией

```bash
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
npm ci --prefix match-server
npm run match:test
npm run match:build
```

## 2. Match-server на Render

1. Создайте Blueprint из корня репозитория — Render прочитает `render.yaml`.
2. Укажите `CLIENT_ORIGINS=https://<project>.vercel.app` без завершающего `/`.
   Несколько origin разделяются запятыми.
3. Дождитесь успешного `GET /health`.
4. Сохраните URL вида `https://circle-clash-match-server.onrender.com`.

Обязательные переменные перечислены в `match-server/.env.example`. Бесплатный
инстанс может засыпать и давать холодный старт; это должно быть видно на `/status`.

Альтернативный контейнер:

```bash
docker build -f match-server/Dockerfile -t circle-clash-match-server .
docker run --rm -p 8787:8787 \
  -e CLIENT_ORIGINS=http://localhost:5173 \
  circle-clash-match-server
```

## 3. Клиент на Vercel

Импортируйте репозиторий как Vite-проект. `vercel.json` задаёт `npm run build`,
каталог `dist`, SPA rewrites, immutable cache для assets и безопасные headers.

Переменные:

```text
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
VITE_MATCH_SERVER_URL=https://<match-server-host>
VITE_RELEASE=<git-sha-or-version>
```

После первого deploy добавьте точный Vercel origin в `CLIENT_ORIGINS` сервера,
а Vercel URL — в Supabase Authentication → URL Configuration.

## 4. Health, status и логи

- `GET /health` — liveness;
- `GET /ready` — readiness;
- `GET /status` — версия, uptime и количество комнат;
- клиентская страница `/status` проверяет клиент, Supabase-конфигурацию и сервер;
- сервер пишет JSON-логи Pino с `event`, `requestId`, `matchId` и без token/cookie;
- неизвестные и внутренние ошибки возвращают JSON с `code` и `requestId`;
- создание/join комнат и WebSocket-сообщения ограничены rate limiter.

## 5. Резервные копии

Матчи хранятся в памяти и не восстанавливаются после рестарта. Аккаунты и настройки
живут в Supabase. Workflow `database-backup` ежедневно запускает `pg_dump` через
зашифрованное соединение и хранит custom-format dump и SHA-256 manifest 30 дней.

Добавьте GitHub Secret `SUPABASE_DB_URL` с pooler/direct connection string.
Не помещайте его в репозиторий или логи.

Проверка и восстановление:

```bash
sha256sum -c <(jq -r '"\(.sha256)  \(.file)"' backup-manifest.json)
pg_restore --clean --if-exists --no-owner --dbname "$RESTORE_DATABASE_URL" circle-clash-*.dump
```

Восстановление сначала выполняется на отдельной тестовой базе. Production restore
требует отдельного подтверждения владельца.

## 6. Rollback

1. На Vercel назначьте предыдущий успешный deployment production.
2. На Render разверните предыдущий commit/image.
3. Проверьте `/health`, `/status`, создание комнаты и WebSocket-подключение.
4. Если менялась схема Supabase, используйте forward-fix либо проверенный backup;
   не откатывайте миграцию вслепую.
