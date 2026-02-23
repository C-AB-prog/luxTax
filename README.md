# VIP Driver — Telegram Mini App

## Быстрый старт

### 1. Клонируй и настрой окружение

```bash
cp .env.example .env
```

Заполни `.env`:

| Переменная | Описание |
|---|---|
| `BOT_TOKEN` | Токен бота от @BotFather |
| `WEBHOOK_SECRET` | Любая случайная строка (openssl rand -hex 32) |
| `WEBHOOK_URL` | Публичный URL сервера (напр. https://yourdomain.com) |
| `OPERATOR_CHAT_ID` | ID группы/чата операторов (отрицательное число) |
| `JWT_SECRET` | Любая случайная строка |
| `ADMIN_USERNAME` | Логин для admin panel |
| `ADMIN_PASSWORD` | Пароль для admin panel |
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | Данные PostgreSQL |

### 2. Настрой Mini App в Telegram

1. Зайди в @BotFather → `/newbot` → создай бота
2. `/newapp` → привяжи Mini App URL: `https://yourdomain.com` (порт 5173)
3. Скопируй `BOT_TOKEN` в `.env`

### 3. Получи ID чата операторов

1. Добавь бота в группу операторов
2. Назначь его администратором
3. Отправь сообщение в группу, зайди на:
   `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
4. Найди `"chat": {"id": -100...}` — это `OPERATOR_CHAT_ID`

### 4. Настрой VITE_BOT_USERNAME во frontend

В `frontend/src/pages/Home.jsx` замени `VITE_BOT_USERNAME` или создай `frontend/.env`:
```
VITE_API_URL=https://yourdomain.com/api
VITE_BOT_USERNAME=your_bot_username
```

### 5. Запусти

```bash
docker compose up --build -d
```

### 6. Регистрация webhook

Webhook регистрируется автоматически при старте backend.
Вручную можно так:

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://yourdomain.com/webhook","secret_token":"<WEBHOOK_SECRET>"}'
```

---

## Архитектура

```
vip-driver/
├── backend/              # Express + Prisma + Bot logic
│   ├── src/
│   │   ├── index.js      # Entry point
│   │   ├── prisma.js     # Prisma client
│   │   ├── routes/
│   │   │   ├── auth.js   # POST /api/auth/telegram, /auth/admin
│   │   │   ├── orders.js # POST /api/orders, GET /api/orders/me
│   │   │   ├── admin.js  # GET/PATCH /api/admin/orders
│   │   │   └── bot.js    # POST /webhook
│   │   ├── middleware/
│   │   │   └── auth.js   # JWT middleware
│   │   ├── services/
│   │   │   ├── telegram.js  # initData validation
│   │   │   └── bot.js       # Telegram Bot API calls
│   │   └── bot/
│   │       └── webhook.js   # Webhook registration
│   └── prisma/
│       └── schema.prisma
├── frontend/             # React Mini App (Vite)
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx        # Плитки услуг
│       │   ├── OrderForm.jsx   # Форма заказа
│       │   ├── MyOrders.jsx    # История заказов
│       │   └── PhoneRequest.jsx
│       ├── context/AuthContext.jsx
│       └── api/client.js
├── admin/               # Admin Panel (React + Vite)
│   └── src/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Orders.jsx
│       │   └── OrderDetail.jsx
│       └── api/client.js
└── docker-compose.yml
```

## Endpoints

| Method | Path | Auth | Описание |
|---|---|---|---|
| POST | `/api/auth/telegram` | — | Авторизация через initData |
| POST | `/api/auth/phone` | — | Сохранить телефон |
| POST | `/api/auth/admin` | — | Логин в админку |
| POST | `/api/orders` | JWT | Создать заказ |
| GET | `/api/orders/me` | JWT | Мои заказы |
| GET | `/api/admin/orders` | Admin JWT | Все заказы |
| GET | `/api/admin/orders/:id` | Admin JWT | Детали заказа |
| PATCH | `/api/admin/orders/:id/status` | Admin JWT | Сменить статус |
| POST | `/webhook` | Secret Header | Telegram webhook |

## Порты

| Сервис | Порт |
|---|---|
| Backend API | 3000 |
| Mini App | 5173 |
| Admin Panel | 5174 |
| PostgreSQL | 5432 |

## Продакшн (nginx reverse proxy)

Рекомендуем поставить nginx перед всеми сервисами:

```nginx
server {
    server_name yourdomain.com;

    location /api { proxy_pass http://localhost:3000/api; }
    location /webhook { proxy_pass http://localhost:3000/webhook; }
    location /admin { proxy_pass http://localhost:5174; }
    location / { proxy_pass http://localhost:5173; }
}
```
