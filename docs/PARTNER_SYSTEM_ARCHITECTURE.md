# JetUP Partner System — Полная Архитектура

## 📋 Содержание
1. [Общий обзор](#общий-обзор)
2. [Структура базы данных](#структура-базы-данных)
3. [Компоненты системы](#компоненты-системы)
4. [Flow от начала до конца](#flow-от-начала-до-конца)
5. [Интеграция с Zoom](#интеграция-с-zoom)
6. [Админка — что означают разделы](#админка)
7. [API Endpoints](#api-endpoints)

---

## 🎯 Общий обзор

**JetUP Partner System** — это экосистема для партнеров (брокеров), которая позволяет:
- Создавать персонализированные приглашения на вебинары
- Отслеживать регистрации гостей
- Анализировать посещаемость через интеграцию с Zoom
- Получать real-time уведомления в Telegram
- Использовать AI для квалификации лидов и follow-up

### Основные каналы взаимодействия:
1. **Telegram Mini App** — основной интерфейс для партнера (`@Jetup_partner_test_bot` dev, `@JetUP_Partner_Bot` prod)
2. **Telegram Bot** — уведомления и быстрые команды
3. **Web приложение** — доступ через браузер
4. **Zoom** — платформа для проведения вебинаров

---

## 🗄️ Структура базы данных

### Ключевые таблицы и их взаимосвязи

```
┌─────────────────┐
│    partners     │  ← Корневая таблица: партнеры системы
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│ invite_events   │  ← События (инвайты) созданные партнером
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐      ┌──────────────────┐
│ invite_guests   │◄─────│ zoom_attendance  │
└─────────────────┘  1:1 └──────────────────┘
   (Регистрации)        (Данные посещаемости)
```

### 1. `partners` — Партнеры
```sql
CREATE TABLE partners (
  id SERIAL PRIMARY KEY,
  telegram_chat_id TEXT UNIQUE NOT NULL,  -- Идентификатор в Telegram
  telegram_username TEXT,
  name TEXT NOT NULL,                     -- Имя партнера
  cu_number TEXT NOT NULL,                -- CU номер (внутренний ID)
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Что это:** Таблица всех зарегистрированных партнеров (брокеров).

**Зачем нужно:** 
- Идентификация партнера в системе
- Привязка всех инвайтов и гостей к конкретному партнеру
- Отправка персональных уведомлений в Telegram

### 2. `invite_events` — События/Инвайты
```sql
CREATE TABLE invite_events (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER,                     -- Ссылка на партнера
  schedule_event_id INTEGER,              -- Ссылка на вебинар из расписания
  partner_name TEXT NOT NULL,
  partner_cu TEXT NOT NULL,
  zoom_link TEXT NOT NULL,                -- Ссылка на Zoom встречу
  title TEXT NOT NULL,                    -- Название вебинара
  event_date TEXT NOT NULL,               -- Дата (2026-03-20)
  event_time TEXT NOT NULL,               -- Время (19:00)
  invite_code TEXT UNIQUE NOT NULL,       -- Уникальный код (abc123)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Что это:** Конкретная инстанция инвайта, созданная партнером для определенного вебинара.

**Зачем нужно:**
- Генерация уникальной ссылки `/invite/abc123`
- Привязка регистраций к конкретному партнеру
- Отслеживание откуда пришел гость

**Пример:** Партнер "Денис" создает инвайт на вебинар "Трейдинг стратегии" → система генерирует код `d8k3j2` → ссылка `https://jet-up.ai/invite/d8k3j2`

### 3. `invite_guests` — Зарегистрированные гости
```sql
CREATE TABLE invite_guests (
  id SERIAL PRIMARY KEY,
  invite_event_id INTEGER NOT NULL,       -- К какому инвайту относится
  name TEXT NOT NULL,                     -- Имя гостя
  email TEXT NOT NULL,                    -- Email гостя
  phone TEXT,
  registered_at TIMESTAMP DEFAULT NOW(),  -- Когда зарегистрировался
  clicked_zoom BOOLEAN DEFAULT false,     -- Кликнул ли на "Присоединиться к Zoom"
  clicked_at TIMESTAMP                    -- Когда кликнул
);
```

**Что это:** Список людей, которые зарегистрировались через ссылку партнера.

**Зачем нужно:**
- Отслеживание конверсии (клик → регистрация)
- Уведомление партнера о новых регистрациях
- База для сопоставления с Zoom attendance

### 4. `zoom_attendance` — Данные посещаемости из Zoom
```sql
CREATE TABLE zoom_attendance (
  id SERIAL PRIMARY KEY,
  invite_guest_id INTEGER,                -- Связь с гостем (может быть NULL!)
  invite_event_id INTEGER NOT NULL,       -- К какому событию относится
  participant_email TEXT NOT NULL,        -- Email из Zoom
  participant_name TEXT,                  -- Имя из Zoom
  join_time TIMESTAMP,                    -- Время входа
  leave_time TIMESTAMP,                   -- Время выхода
  duration_minutes INTEGER DEFAULT 0,     -- Сколько минут был на встрече
  questions_asked INTEGER DEFAULT 0,      -- Сколько вопросов задал
  question_texts TEXT[],                  -- Тексты вопросов
  fetched_at TIMESTAMP DEFAULT NOW()
);
```

**Что это:** Реальные данные о том, кто был на вебинаре (получены из Zoom API).

**Зачем нужно:**
- Точная посещаемость (не просто "кликнул на Zoom", а "был на встрече")
- Аналитика engagement (сколько минут был, задавал ли вопросы)
- Основа для AI follow-up (персонализированные сообщения)

**Важно:** `invite_guest_id` может быть `NULL` — это "walk-in" участники, которые пришли на вебинар, но НЕ регистрировались через ссылку партнера (например, были приглашены организатором напрямую).

### 5. `personal_invites` — Персональные AI-инвайты
```sql
CREATE TABLE personal_invites (
  id SERIAL PRIMARY KEY,
  partner_id INTEGER NOT NULL,
  schedule_event_id INTEGER NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  prospect_name TEXT NOT NULL,            -- Имя потенциального гостя
  prospect_type TEXT DEFAULT 'Neutral',   -- Тип отношений
  disc_type TEXT,                         -- DISC профиль (D/I/S/C)
  motivation_type TEXT,                   -- Тип мотивации
  invite_strategy TEXT,                   -- Стратегия приглашения
  generated_messages TEXT DEFAULT '[]',   -- Сгенерированные AI сообщения
  guest_name TEXT,                        -- Фактическое имя после регистрации
  guest_email TEXT,
  guest_telegram TEXT,
  guest_phone TEXT,
  reminder_channel TEXT,                  -- Канал для напоминаний
  registered_at TIMESTAMP,
  reminder_preference TEXT,
  guest_language TEXT,
  chat_history TEXT DEFAULT '[]',         -- История чата с AI
  viewed_at TIMESTAMP,                    -- Когда проспект открыл ссылку
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Что это:** Расширенная версия инвайта с AI-квалификацией лида.

**Зачем нужно:**
- Персонализированные приглашения на основе DISC-профиля
- AI-чат для вовлечения проспекта
- Отслеживание engagement до регистрации

---

## 🧩 Компоненты системы

### 1. Telegram Mini App (Frontend)
**Файлы:** `client/src/pages/partner-app/`

**Экраны:**
- `DashboardScreen.tsx` — главный экран с статистикой
- `WebinarsScreen.tsx` — список вебинаров для создания инвайтов
- `ReportsScreen.tsx` — статистика по событиям и гостям

**Вход:**
- Автоматическая авторизация через Telegram WebApp SDK
- Получение `telegramId` из `window.Telegram.WebApp.initDataUnsafe`

### 2. Telegram Bot (Backend)
**Файл:** `server/integrations/partner-bot.ts`

**Команды:**
- `/start` — открывает Mini App
- `/invite` — открывает раздел вебинаров
- `/events` — список событий
- `/report` — детальный отчет по событию
- `/followup` — AI-ассистент для follow-up сообщений

**Уведомления:**
```javascript
// При регистрации гостя
await bot.sendMessage(partner.telegramChatId, 
  `🎉 Новая регистрация!\n${guestName} зарегистрировался на ${eventTitle}`
);
```

### 3. Backend API
**Файл:** `server/partner-app-routes.ts`

**Основные endpoints:**
- `GET /api/partner-app/webinars` — список доступных вебинаров
- `POST /api/partner-app/create-invite` — создание инвайта
- `GET /api/partner-app/events` — события партнера (группировка по вебинарам)
- `GET /api/partner-app/events/:id/report` — детальный отчет

### 4. Zoom Integration
**Файл:** `server/integrations/zoom-api.ts`

**Функции:**
- `fetchZoomMeetingParticipants()` — получение списка участников
- `fetchZoomMeetingQA()` — получение вопросов из Q&A
- `syncZoomDataForEvent()` — синхронизация данных

---

## 🔄 Flow от начала до конца

### Flow 1: Регистрация партнера

```
1. Партнер открывает Telegram → находит @Jetup_partner_test_bot
                                        ↓
2. Нажимает /start → бот отправляет кнопку "Открыть Partner App"
                                        ↓
3. Открывается Mini App → проверка telegramId в БД
                                        ↓
4. НЕ НАЙДЕН → показывается экран регистрации
                                        ↓
5. Партнер вводит: Имя, CU-номер, телефон, email
                                        ↓
6. POST /api/partner-app/register → создается запись в partners
                                        ↓
7. Партнер получает доступ к Dashboard
```

**Код регистрации:**
```typescript
// client/src/pages/partner-app/RegistrationScreen.tsx
const handleRegister = async () => {
  await fetch('/api/partner-app/register', {
    method: 'POST',
    headers: { 'x-telegram-id': telegramId },
    body: JSON.stringify({ name, cuNumber, phone, email })
  });
};
```

### Flow 2: Создание инвайта (Social Share)

```
1. Партнер открывает раздел "Вебинары"
                    ↓
2. Выбирает вебинар "Трейдинг стратегии 20.03 19:00"
                    ↓
3. Нажимает "Создать приглашение"
                    ↓
4. Выбирает стиль сообщения (Профессиональное/Дружеское/Короткое)
                    ↓
5. POST /api/partner-app/create-invite
   {
     scheduleEventId: 5
   }
                    ↓
6. Backend:
   - Создает запись в invite_events
   - Генерирует уникальный invite_code (например, "x8k2p")
   - Возвращает ссылку: /invite/x8k2p
                    ↓
7. Партнер получает ссылку и делится ей (WhatsApp, Telegram, Email)
```

**Backend создание инвайта:**
```typescript
// server/partner-app-routes.ts
app.post("/api/partner-app/create-invite", async (req, res) => {
  const partner = await getPartnerFromRequest(req);
  const { scheduleEventId } = req.body;
  
  const scheduleEvent = await storage.getScheduleEvent(scheduleEventId);
  
  // Создаем invite_event
  const inviteEvent = await storage.createInviteEvent({
    partnerName: partner.name,
    partnerCu: partner.cuNumber,
    partnerId: partner.id,
    scheduleEventId: scheduleEvent.id,
    zoomLink: scheduleEvent.link,
    title: scheduleEvent.title,
    eventDate: scheduleEvent.date,
    eventTime: scheduleEvent.time,
    isActive: true,
  });
  
  res.json({
    inviteCode: inviteEvent.inviteCode,
    inviteUrl: `/invite/${inviteEvent.inviteCode}`
  });
});
```

### Flow 3: Регистрация гостя

```
1. Гость получает ссылку https://jet-up.ai/invite/x8k2p
                    ↓
2. Открывает → видит landing page с информацией о вебинаре
                    ↓
3. Заполняет форму: Имя, Email, Телефон
                    ↓
4. POST /api/invite/x8k2p/register
   {
     name: "Иван Петров",
     email: "ivan@example.com",
     phone: "+7..."
   }
                    ↓
5. Backend:
   - Создает запись в invite_guests
   - Отправляет уведомление партнеру в Telegram
   - Отправляет confirmation email гостю
                    ↓
6. Гость видит кнопку "Присоединиться к Zoom"
                    ↓
7. Клик → POST /api/invite/x8k2p/click
   - Обновляется clicked_zoom = true, clicked_at = NOW()
   - Редирект на Zoom ссылку
```

### Flow 4: Синхронизация с Zoom

```
1. Вебинар завершился
                    ↓
2. Партнер открывает отчет в боте: /report
                    ↓
3. Бот показывает кнопку "🔄 Обновить Zoom данные"
                    ↓
4. Клик → вызывается syncZoomDataForEvent(inviteEventId, zoomLink)
                    ↓
5. Zoom API процесс:
   
   a) Извлекаем meetingId из zoom_link
      https://zoom.us/j/84938727526 → 84938727526
   
   b) Запрос OAuth токена:
      POST https://zoom.us/oauth/token
      grant_type=account_credentials
      → access_token
   
   c) Получаем участников:
      GET /v2/report/meetings/84938727526/participants
      (или /v2/report/webinars/... если webinar)
      
      Ответ:
      {
        participants: [
          {
            name: "Иван Петров",
            user_email: "ivan@example.com",
            join_time: "2026-03-20T19:05:00Z",
            leave_time: "2026-03-20T20:30:00Z",
            duration: 85  // минуты
          },
          ...
        ]
      }
   
   d) Получаем Q&A:
      GET /v2/report/meetings/84938727526/qa
      
      Ответ:
      {
        questions: [
          {
            email: "ivan@example.com",
            question_details: [
              { question: "Какой минимальный депозит?" }
            ]
          }
        ]
      }
                    ↓
6. Сопоставление с гостями:
   
   Для каждого Zoom участника:
   - Ищем в invite_guests по email
   - НАЙДЕН → создаем zoom_attendance с invite_guest_id
   - НЕ НАЙДЕН → создаем zoom_attendance с invite_guest_id = NULL (walk-in)
                    ↓
7. Сохранение в БД:
   
   INSERT INTO zoom_attendance (
     invite_guest_id,    -- 15 или NULL
     invite_event_id,    -- 42
     participant_email,  -- ivan@example.com
     participant_name,   -- Иван Петров
     join_time,          -- 2026-03-20 19:05:00
     leave_time,         -- 2026-03-20 20:30:00
     duration_minutes,   -- 85
     questions_asked     -- 1
   )
                    ↓
8. Логирование:
   console.log("[ZoomSync] Persisted attendance: ivan@example.com — 85min")
   console.log("[ZoomSync] Complete: 3 synced, 1 skipped, 4 total")
```

**Код синхронизации:**
```typescript
// server/integrations/zoom-api.ts
export async function syncZoomDataForEvent(
  inviteEventId: number, 
  zoomMeetingUrl: string
) {
  // 1. Извлечение ID
  const meetingId = extractMeetingId(zoomMeetingUrl);
  
  // 2. Получение данных из Zoom
  let participants = await fetchZoomMeetingParticipants(meetingId);
  const qaData = await fetchZoomMeetingQA(meetingId);
  
  // 3. Получение зарегистрированных гостей
  const guests = await storage.getGuestsByEventId(inviteEventId);
  const existingAttendance = await storage.getZoomAttendanceByEventId(inviteEventId);
  
  // 4. Сопоставление и сохранение
  let synced = 0;
  for (const participant of participants) {
    const email = participant.user_email?.toLowerCase();
    
    // Пропускаем дубликаты
    if (existingEmails.has(email)) {
      skipped++;
      continue;
    }
    
    // Ищем гостя
    const matchedGuest = guests.find(g => g.email.toLowerCase() === email);
    
    // Считаем вопросы
    const questionsCount = qaData.filter(q => 
      q.email.toLowerCase() === email
    ).length;
    
    // Сохраняем
    await storage.createZoomAttendance({
      inviteGuestId: matchedGuest?.id || null,  // NULL для walk-in
      inviteEventId,
      participantEmail: participant.user_email,
      participantName: participant.name,
      joinTime: new Date(participant.join_time),
      leaveTime: new Date(participant.leave_time),
      durationMinutes: participant.duration,
      questionsAsked: questionsCount,
    });
    
    synced++;
  }
  
  return { participants, synced, skipped };
}
```

---

## 📊 Интеграция с Zoom

### Почему нужна интеграция с Zoom?

**Проблема без интеграции:**
- Партнер видит только "кто зарегистрировался" и "кто кликнул на Zoom"
- НО не знает: кто реально был, сколько времени, задавал ли вопросы

**Решение с интеграцией:**
- Точные данные посещаемости из самого Zoom
- Метрики engagement (duration, questions)
- Выявление "no-show" (зарегистрировался, но не пришел)
- Выявление "walk-in" (пришел, но не регистрировался)

### Zoom API Endpoints

#### 1. OAuth токен (Server-to-Server)
```http
POST https://zoom.us/oauth/token
Authorization: Basic base64(CLIENT_ID:CLIENT_SECRET)
Content-Type: application/x-www-form-urlencoded

grant_type=account_credentials&account_id=ACCOUNT_ID

→ Response:
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### 2. Participants Report
```http
GET https://api.zoom.us/v2/report/meetings/{meetingId}/participants?page_size=300
Authorization: Bearer {access_token}

→ Response:
{
  "page_size": 300,
  "total_records": 15,
  "participants": [
    {
      "id": "user123",
      "name": "Иван Петров",
      "user_email": "ivan@example.com",
      "join_time": "2026-03-20T19:05:23Z",
      "leave_time": "2026-03-20T20:30:15Z",
      "duration": 85,
      "attentiveness_score": ""
    },
    ...
  ]
}
```

**Для вебинаров:** `/v2/report/webinars/{webinarId}/participants`

#### 3. Q&A Report
```http
GET https://api.zoom.us/v2/report/meetings/{meetingId}/qa
Authorization: Bearer {access_token}

→ Response:
{
  "questions": [
    {
      "email": "ivan@example.com",
      "name": "Иван Петров",
      "question_details": [
        {
          "question": "Какой минимальный депозит для начала?",
          "answer": "Минимальный депозит 100 USD"
        }
      ]
    }
  ]
}
```

### Обработка ошибок

**Ошибка 400 "webinar":**
```javascript
if (res.status === 400 && errorText.includes("webinar")) {
  // Переключаемся на webinar endpoint
  res = await fetch(`/v2/report/webinars/${meetingId}/participants`);
}
```

**Ошибка 404:**
- Встреча еще не завершилась
- Неверный meeting ID
- Данные еще не доступны (Zoom обрабатывает ~30 мин после окончания)

**Ошибка 429:**
- Rate limit достигнут
- Нужно подождать несколько минут

---

## 🎛️ Админка

### Раздел "Partner Invites Management" (Invites)

**Что это:**
Административный раздел для управления всеми инвайтами в системе.

**Что видно:**
```
┌─────────────────────────────────────────────────────────┐
│ Partner Invites Management (234 events)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🔍 Search: [________]  📅 Filter  [+ Create]           │
│                                                          │
│  Event                    Partner     Guests  Clicks    │
│  ─────────────────────   ─────────   ──────  ──────    │
│  Трейдинг стратегии      Денис (CU-  5 👥   3 🖱️      │
│  2026-03-20 19:00        1234)                          │
│  ✅ Active               🔗 abc123                       │
│  📊 View Details  📧 Send Report  🔄 Zoom Sync          │
│  ────────────────────────────────────────────────────   │
│  ...                                                     │
└─────────────────────────────────────────────────────────┘
```

**Функции:**

1. **View Details** — открывает модальное окно с таблицей гостей:
   ```
   Guest Report: Трейдинг стратегии
   Partner: Денис (CU-1234)
   
   ┌────────────┬───────────┬──────────┬─────────┬─────────┬──────────┐
   │ Name       │ Email     │ Registered│ Clicked │ Attended│ Duration │
   ├────────────┼───────────┼──────────┼─────────┼─────────┼──────────┤
   │ Иван П.    │ ivan@...  │ 19.03    │ ✓       │ ✓ Yes   │ 85m      │
   │ Мария С.   │ maria@... │ 18.03    │ ✓       │ ─       │ ─        │
   │ Unknown    │ guest@... │ ─        │ ─       │ ✓ Yes   │ 45m      │
   │ (Walk-in)  │           │          │         │ 🟡      │          │
   └────────────┴───────────┴──────────┴─────────┴─────────┴──────────┘
   ```
   
   **Walk-in участники** (🟡 желтый фон):
   - Люди, которые были на вебинаре
   - НО не регистрировались через ссылку партнера
   - Пример: организатор пригласил напрямую

2. **Send Report** — отправляет отчет партнеру в Telegram:
   ```
   📊 Event-Bericht: Трейдинг стратегии
   📅 2026-03-20 19:00
   👤 Partner: Денис (CU-1234)
   
   📝 Registriert: 5 Gäste
   ✅ Zoom beigetreten: 3
   ❌ Nicht beigetreten: 2
   
   ✅ Beigetreten:
     • Иван Петров (ivan@example.com)
     • ...
   ```

3. **Zoom Sync** — запускает синхронизацию с Zoom:
   - Вызывает `POST /api/admin/zoom-sync/:eventId`
   - Показывает результат: "3 synchronisiert, 1 übersprungen"

**Зачем нужен:**
- Центральный мониторинг всех инвайтов
- Помощь партнерам (если у них проблемы)
- Контроль качества лидов
- Ручная синхронизация Zoom (если автоматическая не сработала)

### Раздел "Partners"

**Что это:**
Список всех зарегистрированных партнеров.

**Что видно:**
```
┌─────────────────────────────────────────────────────────┐
│ Registrierte Partner (42)                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Денис Иванов  [CU-1234]  [Aktiv]                       │
│  📱 @denis_broker  📧 denis@example.com                  │
│  Registriert: 15.02.2026                                │
│  ────────────────────────────────────────────────────   │
│  Мария Петрова  [CU-5678]  [Aktiv]                      │
│  📱 @maria_trading  📧 maria@example.com                 │
│  Registriert: 20.02.2026                                │
│  ────────────────────────────────────────────────────   │
│  ...                                                     │
└─────────────────────────────────────────────────────────┘
```

**Зачем нужен:**
- Видеть всех партнеров системы
- Проверять статус (active/inactive)
- Контакты для связи
- Аудит (кто и когда зарегистрировался)

---

## 📡 API Endpoints

### Partner App API

#### Регистрация
```http
POST /api/partner-app/register
Headers:
  x-telegram-id: 123456789
Body:
  {
    "name": "Денис Иванов",
    "cuNumber": "CU-1234",
    "phone": "+7...",
    "email": "denis@example.com"
  }
Response:
  {
    "partner": { id: 1, name: "Денис Иванов", ... }
  }
```

#### Получение вебинаров
```http
GET /api/partner-app/webinars?language=de
Headers:
  x-telegram-id: 123456789
Response:
  [
    {
      "id": 5,
      "title": "Trading Strategien",
      "date": "2026-03-20",
      "time": "19:00",
      "speaker": "John Doe",
      "link": "https://zoom.us/j/...",
      ...
    }
  ]
```

#### Создание инвайта
```http
POST /api/partner-app/create-invite
Headers:
  x-telegram-id: 123456789
Body:
  {
    "scheduleEventId": 5
  }
Response:
  {
    "inviteCode": "x8k2p",
    "inviteUrl": "/invite/x8k2p",
    "event": {
      "title": "Trading Strategien",
      "date": "2026-03-20",
      "time": "19:00",
      "speaker": "John Doe"
    }
  }
```

#### Статистика событий (с группировкой)
```http
GET /api/partner-app/events
Headers:
  x-telegram-id: 123456789
Response:
  [
    {
      "id": 42,
      "title": "Trading Strategien",
      "eventDate": "2026-03-20",
      "eventTime": "19:00",
      "scheduleEventId": 5,
      "invitesSent": 3,              // Сколько инвайтов создано
      "registeredCount": 8,          // Всего регистраций
      "clickedCount": 6,             // Кликнули на Zoom
      "attendedCount": 4,            // Реально были (из Zoom)
      "conversionRate": 50,          // 4/8 * 100%
      "inviteEventIds": [42, 43, 44] // ID всех инвайтов
    }
  ]
```

**Группировка по `scheduleEventId`:**
- Если партнер создал 3 инвайта для одного вебинара → показывается 1 строка
- Суммируются все регистрации и attendance
- При клике на детали → объединяются данные всех 3 инвайтов

#### Детальный отчет
```http
GET /api/partner-app/events/42/report
Headers:
  x-telegram-id: 123456789
Response:
  {
    "event": { id: 42, title: "...", ... },
    "guests": [
      {
        "id": 15,
        "name": "Иван Петров",
        "email": "ivan@example.com",
        "registeredAt": "2026-03-19T...",
        "clickedZoom": true,
        "attended": true,
        "durationMinutes": 85,
        "questionsAsked": 1,
        "joinTime": "2026-03-20T19:05:00Z",
        "isWalkIn": false
      },
      {
        "id": -234,  // Negative ID для walk-in
        "name": "Unknown Guest",
        "email": "guest@example.com",
        "attended": true,
        "durationMinutes": 45,
        "questionsAsked": 0,
        "isWalkIn": true
      }
    ],
    "funnel": {
      "invited": 8,
      "registered": 8,
      "clickedZoom": 6,
      "attended": 4
    }
  }
```

### Admin API

#### Получение всех инвайтов
```http
GET /api/admin/invite-events
Headers:
  x-admin-password: SECRET
Response:
  [
    {
      "id": 42,
      "partnerName": "Денис Иванов",
      "partnerCu": "CU-1234",
      "title": "Trading Strategien",
      "eventDate": "2026-03-20",
      "inviteCode": "x8k2p",
      "guestCount": 8,
      "clickedCount": 6,
      "zoomSyncedCount": 4
    }
  ]
```

#### Отчет по событию (с walk-in)
```http
GET /api/admin/invite-events/42/report
Headers:
  x-admin-password: SECRET
Response:
  {
    "event": { ... },
    "guests": [
      {
        "id": 15,
        "name": "Иван Петров",
        "email": "ivan@example.com",
        "clickedZoom": true,
        "attended": true,
        "durationMinutes": 85,
        "questionsAsked": 1,
        "joinTime": "2026-03-20T19:05:00Z",
        "isWalkIn": false
      },
      {
        "id": -234,
        "name": "Unknown",
        "email": "guest@example.com",
        "attended": true,
        "durationMinutes": 45,
        "isWalkIn": true
      }
    ],
    "stats": {
      "totalRegistered": 8,
      "totalClicked": 6,
      "totalAttended": 4,
      "totalWalkIns": 1
    }
  }
```

#### Zoom синхронизация
```http
POST /api/admin/zoom-sync/42
Headers:
  x-admin-password: SECRET
Response:
  {
    "synced": 3,
    "skipped": 1,
    "error": null
  }
```

---

## 🎯 Практические сценарии

### Сценарий 1: Партнер создает инвайт и отслеживает результаты

**День 1 (19.03):**
1. Денис открывает Partner App → Вебинары
2. Видит "Trading Strategien 20.03 19:00"
3. Создает инвайт → получает ссылку `/invite/x8k2p`
4. Делится в WhatsApp группе (50 человек)

**День 2 (19.03 вечер):**
5. 8 человек кликают на ссылку и регистрируются
6. Денис получает 8 уведомлений в Telegram:
   ```
   🎉 Новая регистрация!
   Иван Петров зарегистрировался на Trading Strategien
   ```

**День 3 (20.03 19:00):**
7. Начинается вебинар
8. 6 из 8 кликают "Присоединиться к Zoom"
9. Фактически приходят только 4 человека
10. Еще 1 человек приходит (не регистрировался) — walk-in

**День 4 (21.03):**
11. Денис открывает бота → `/report`
12. Видит предварительную статистику:
    ```
    📝 Registriert: 8
    🔗 Zoom geklickt: 6
    ```
13. Нажимает "🔄 Zoom-Daten aktualisieren"
14. Система синхронизирует:
    - 4 matched (нашли по email)
    - 1 walk-in (новый участник)
15. Обновленный отчет:
    ```
    📝 Registriert: 8
    🔗 Zoom geklickt: 6
    ✅ Teilgenommen: 4
    ❌ No-show: 2
    🆕 Walk-in: 1
    
    ✅ Teilgenommen:
      • Иван Петров (85 min, 1 Frage)
      • Мария Сидорова (120 min, 3 Fragen)
      ...
    ```

### Сценарий 2: Админ проверяет качество лидов

**Задача:** Выявить неактивных партнеров

1. Админ открывает `/admin` → Partner Invites
2. Фильтрует за последний месяц
3. Смотрит conversion rate:
   ```
   Денис:   8 регистраций → 4 attendance (50%)  ✅
   Мария:   12 регистраций → 2 attendance (17%) ⚠️
   Петр:    3 регистрации → 0 attendance (0%)   ❌
   ```
4. Выводы:
   - Денис — качественные лиды
   - Мария — нужна помощь с квалификацией
   - Петр — возможно, спам-регистрации

---

## 🔑 Ключевые концепции

### 1. Walk-in участники
**Что:** Люди на вебинаре, которых НЕТ в `invite_guests`

**Почему возникают:**
- Организатор пригласил напрямую
- Участник был на других вебинарах и имеет постоянную ссылку
- Email в Zoom не совпадает с email при регистрации

**Как обрабатывается:**
- `invite_guest_id = NULL` в `zoom_attendance`
- Показываются внизу списка с меткой "Walk-in"
- Включаются в `totalAttended`, но не в конверсию (invited → attended)

### 2. Группировка событий
**Зачем:** Один вебинар = много инвайтов от разных партнеров

**Пример:**
```
schedule_events.id = 5  "Trading Strategien 20.03"
  ├─ invite_events.id = 42  (Денис, 8 guests)
  ├─ invite_events.id = 43  (Мария, 12 guests)
  └─ invite_events.id = 44  (Петр, 3 guests)

В Partner App Дениса:
  "Trading Strategien" — 8 registered, 4 attended
  (только ЕГО гости)

В админке:
  Event #42 (Денис) — 8/4
  Event #43 (Мария) — 12/2
  Event #44 (Петр) — 3/0
```

### 3. Null-safe отображение
**Проблема:** До Zoom sync attendance = null

**Решение:**
```typescript
{guest.durationMinutes != null ? 
  `${guest.durationMinutes}m` : 
  "—"
}
```

**Зачем:** Четко показывать "данные еще не синхронизированы" vs "был, но 0 минут"

---

## 🚨 Распространенные проблемы

### Проблема 1: Zoom возвращает ошибку 300/400 "webinar"

**Причина:** У вас вебинары (webinars), а не обычные встречи (meetings)

**Решение:** Система автоматически определяет и переключается на webinar endpoint

### Проблема 2: Walk-in участники не показываются

**Причина:** Zoom attendance не синхронизирован

**Решение:** Нажать кнопку "🔄 Zoom Sync" в админке или боте

### Проблема 3: Email не совпадает

**Ситуация:** 
- Гость регистрировался с `ivan.petrov@gmail.com`
- В Zoom зашел с `ivan@company.com`

**Результат:** Будет показан как walk-in (не matched)

**Решение:** Гость должен использовать один email

---

## 📞 Быстрая справка

**Основной принцип:**
```
Partner создает Invite → генерирует ссылку → 
Guest регистрируется → кликает Zoom → 
Zoom фиксирует посещение → система синхронизирует → 
Partner видит полную картину
```

**Ключевые файлы:**
- База данных: `shared/schema.ts`
- Backend API: `server/partner-app-routes.ts`
- Zoom интеграция: `server/integrations/zoom-api.ts`
- Telegram Bot: `server/integrations/partner-bot.ts`
- Frontend: `client/src/pages/partner-app/`

**Environment переменные:**
```bash
# Zoom API
ZOOM_ACCOUNT_ID=...
ZOOM_CLIENT_ID=...
ZOOM_CLIENT_SECRET=...

# Telegram Bot
TELEGRAM_PARTNER_BOT_TOKEN=...

# Partner App
PARTNER_APP_ENABLED=true
```
