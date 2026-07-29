# Supabase Google Auth

Минимальный сайт на React с авторизацией через Google и Supabase.

## Локальный запуск

1. Скопируйте `.env.example` в `.env` и добавьте URL и publishable key проекта Supabase.
2. В Supabase откройте **Authentication → Providers → Google**, включите провайдера и добавьте
   OAuth Client ID и Client Secret из Google Cloud.
3. Добавьте локальный и рабочий адрес сайта в разрешённые Redirect URLs Supabase.
4. Запустите `npm install`, затем `npm run dev`.

Перед публикацией проверьте проект командой `npm run build`.
