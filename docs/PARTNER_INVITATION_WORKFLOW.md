# Partner Invitation Workflow — Полная архитектура

## Обзор системы

Партнёр приглашает гостей на вебинары JetUP через Telegram Mini App. Вебинары проводятся в Zoom с единой ссылкой для всех гостей и партнёров. Система отслеживает весь путь гостя: от получения приглашения до посещения вебинара и follow-up.

---

## 1. Источник мероприятий

```
Админ-панель (jet-up.ai/admin)
    │
    ├── Создаёт schedule_event:
    │     title, date, time, timezone, speaker,
    │     language, zoom_link, highlights, banner
    │
    └── Сохраняется в таблицу schedule_events
              │
              ▼
    Partner Mini App → GET /api/partner-app/webinars
              │
              ▼
    Фильтр: date >= сегодня → Список предстоящих мероприятий
```

**Таблица:** `schedule_events`
**Ключевые поля:** id, title, date, time, timezone, speaker, link (Zoom), language, highlights

---

## 2. Партнёр выбирает способ приглашения

Из экрана предстоящего мероприятия партнёр выбирает один из двух путей:

```
┌─────────────────────────────────────────────┐
│           ПРЕДСТОЯЩЕЕ МЕРОПРИЯТИЕ           │
│   "Система Дупликации 2.0" — 28.03, 13:00  │
│                                             │
│   ┌─────────────┐   ┌──────────────────┐    │
│   │ Social      │   │ Personal AI      │    │
│   │ Invite      │   │ Invite           │    │
│   └──────┬──────┘   └────────┬─────────┘    │
└──────────┼───────────────────┼──────────────┘
           │                   │
           ▼                   ▼
      Путь A               Путь B
```

---

## Путь A — Social Invite (Массовая ссылка)

### Шаг A1: Создание ссылки

```
Партнёр нажимает "Social Invite"
    │
    ▼
POST /api/partner-app/create-invite
    body: { scheduleEventId }
    │
    ▼
Сервер создаёт invite_event:
    partner_id, schedule_event_id, invite_code (unique),
    zoom_link, title, date, time
    │
    ▼
Возвращает: inviteUrl = /invite/{inviteCode}
    │
    ▼
Партнёр видит ссылку + кнопки "Поделиться":
    Telegram / WhatsApp / Email / Копировать
```

**Таблица:** `invite_events`
**Ключевые поля:** id, partner_id, schedule_event_id, invite_code, zoom_link, is_active

### Шаг A2: Гость открывает ссылку

```
jet-up.ai/invite/{inviteCode}
    │
    ▼
GET /api/invite/{code}
    │
    ▼
InvitePage — лендинг мероприятия:
    • Название вебинара
    • Спикер (фото, имя)
    • Дата, время, таймзона
    • Таймер обратного отсчёта
    • Кнопка "Зарегистрироваться"
```

### Шаг A3: Гость регистрируется

```
Гость заполняет форму:
    name, email, phone
    │
    ▼
POST /api/invite/{code}/register
    invitationMethod = "bulk_link"
    │
    ▼
Создаётся запись invite_guests:
    invite_event_id, name, email, phone,
    guest_token (UUID) ← НОВОЕ (#46),
    invitation_method = "bulk_link"
    │
    ├──► Партнёр получает Telegram-уведомление:
    │    "Новая регистрация: [Имя] на [Вебинар]"
    │
    └──► [ПЛАНИРУЕТСЯ #45] Гость получает подтверждение
         на выбранный канал (email/Telegram) с /go/{token}
```

**Таблица:** `invite_guests`
**Ключевые поля:** id, invite_event_id, name, email, phone, guest_token, invitation_method, clicked_zoom, clicked_at, go_clicked_at

---

## Путь B — Personal AI Invite (Персональное приглашение)

### Шаг B1: Квалификация гостя

```
Партнёр заполняет информацию о госте:
    │
    ├── Имя проспекта
    ├── Тип: Инвестор / MLM-лидер / Предприниматель / Нейтральный
    ├── Мотивация: Финансовая свобода / Рост / Новые возможности
    ├── Реакция на предложения: Открыт / Скептичен / Аналитичен
    │
    ▼
POST /api/partner-app/generate-invite-messages
    │
    ▼
AI (GPT-4o-mini) определяет:
    • DISC-тип (Dominance / Influence / Steadiness / Conscientiousness)
    • Стратегию приглашения
    • 2 персонализированных сообщения
    │
    ▼
Партнёр видит preview → подтверждает → получает ссылку
```

### Шаг B2: Создание персонального инвайта

```
POST /api/partner-app/create-personal-invite
    │
    ▼
Создаётся personal_invites:
    partner_id, schedule_event_id, invite_code (unique),
    prospect_name, disc_type, motivation_type,
    invite_strategy, generated_messages, chat_history = []
    │
    ▼
Возвращает: inviteUrl = /personal-invite/{inviteCode}
    │
    ▼
Партнёр отправляет ссылку гостю (Telegram / WhatsApp)
```

**Таблица:** `personal_invites`
**Ключевые поля:** id, partner_id, schedule_event_id, invite_code, prospect_name, disc_type, guest_name, guest_email, guest_telegram, viewed_at, registered_at, chat_history, guest_token, go_clicked_at

### Шаг B3: Гость открывает персональную ссылку

```
jet-up.ai/personal-invite/{inviteCode}
    │
    ▼
GET /api/personal-invite/{code}
    • Помечает viewed_at = now()     ← статус "link_opened"
    │
    ▼
PersonalInvitePage — Landing фаза:
    • Название вебинара, дата/время
    • "Тебя лично приглашает [Имя партнёра]"
    • Кнопка "Открыть приглашение"
    │
    ▼
Chat фаза — AI-ассистент:
    • Персонализированные сообщения (по DISC-типу)
    • Quick replies адаптированы под тип личности
    • Общение на языке гостя (RU/DE/EN)
    │
    ▼
Когда гость готов → Inline-форма регистрации:
    name, email, канал напоминания (Telegram/WhatsApp/Email),
    phone или @telegram_username
    │
    ▼
POST /api/personal-invite/{code}/register
    • registered_at = now()
    • Данные синхронизируются в invite_guests
      (invitationMethod = "personal_ai")
    • Генерируется guest_token (UUID) ← НОВОЕ (#46)
    │
    ├──► Партнёр получает Telegram-уведомление
    │
    └──► [ПЛАНИРУЕТСЯ #45] Гость получает:
         • Deep link на бота (если Telegram выбран)
         • Email с подтверждением и /go/{token}
```

---

## 3. Статусы гостя (воронка)

```
    ┌─────────────┐
    │   Invited    │ ← партнёр отправил ссылку
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Link Opened │ ← viewed_at (только personal AI)
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   Chatted   │ ← chat_history не пустой (только personal AI)
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Registered  │ ← registered_at заполнен
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │ Clicked /go │ ← go_clicked_at (НОВОЕ #46)
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │  Attended   │ ← matched в zoom_attendance
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │  Follow-up  │ ← AI-генерация сообщения
    └─────────────┘
```

---

## 4. Напоминания и `/go/` ссылка

### [ПЛАНИРУЕТСЯ — Задача #45 + #46]

```
Гость зарегистрировался → выбрал канал Telegram
    │
    ▼
Экран: "Получи напоминание в Telegram"
    → Deep link: t.me/BotName?start=remind_{CODE}
    │
    ▼
Гость открывает бота → /start remind_{CODE}
    • Бот сохраняет telegram_chat_id
    • Бот отправляет подтверждение: "Вы зарегистрированы на..."
    │
    ▼
За 24 часа до вебинара:
    Планировщик (reminder-scheduler.ts, каждые 2 мин)
    → Отправляет через бота:
      "Вебинар завтра в 13:00! Перейди по ссылке:"
      → https://jet-up.ai/go/{guestToken}
    │
    ▼
За 1 час до вебинара:
    → Повторное напоминание с /go/{token}
    │
    ▼
Гость кликает /go/{token}
    │
    ▼
GET /go/{token}
    • Находит гостя по token
    • Записывает go_clicked_at = now()
    • 302 Redirect → общая Zoom-ссылка
    │
    ▼
Гость попадает в Zoom
```

---

## 5. Zoom Sync и атрибуция посещения

```
После вебинара — партнёр нажимает "Sync Zoom"
    │
    ▼
POST /api/partner-app/events/{id}/zoom-sync
    │
    ▼
syncZoomDataForEvent():
    1. Извлечь meetingId из Zoom-ссылки
    2. GET /report/meetings/{meetingId}/participants (Zoom API)
    3. Получить список участников: email, name, join_time, leave_time
    │
    ▼
Алгоритм матчинга (для каждого участника Zoom):

    Приоритет 1: Email (текущий)
    ┌─ invite_guests.email == participant.user_email? → MATCH ✅
    │
    Приоритет 2: /go/ click timing (НОВОЕ #46)
    ├─ invite_guests.go_clicked_at ±10 мин от join_time? → MATCH ✅
    │
    Приоритет 3: Не совпал ни один критерий
    └─ → НЕ привязан (ранее считался walk-in)
    │
    ▼
Создаётся zoom_attendance:
    invite_guest_id (если совпал), invite_event_id,
    participant_email, participant_name,
    join_time, leave_time, duration_minutes,
    questions_asked, question_texts
```

**Таблица:** `zoom_attendance`
**Ключевые поля:** id, invite_guest_id, invite_event_id, participant_email, participant_name, join_time, leave_time, duration_minutes, questions_asked

---

## 6. Что видит партнёр

### Предстоящие мероприятия (UpcomingScreen)

```
┌──────────────────────────────────────────┐
│  Система Дупликации 2.0                  │
│  28.03.2026, 13:00 CET                   │
│  Спикер: Якоб Шмидт                      │
│                                          │
│  📩 AI Invites: 3 отправлено             │
│     └─ 2 открыли / 1 зарегистрировался   │
│  🔗 Social Invites: 5 отправлено         │
│     └─ 2 зарегистрировались              │
│                                          │
│  [Мои приглашения]  ← список контактов   │
│  ┌────────────────────────────────────┐   │
│  │ Макс М.    ✅ Зарег. 🔔 Подписан  │   │
│  │ Анна С.    👁 Открыла  [Follow-up] │   │
│  │ Игорь К.   🔗 Отправлено          │   │
│  └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### Прошедшие мероприятия (PastScreen)

```
┌──────────────────────────────────────────┐
│  Отчёт: Система Дупликации 1.0           │
│  21.03.2026                              │
│                                          │
│  Воронка:                                │
│  Зарегистрировано:  5                     │
│  Перешли по /go/:   4                     │
│  Пришли:            3                     │
│  Конверсия:         60%                   │
│                                          │
│  ┌────────────────────────────────────┐   │
│  │ Макс М.   ✅ Был  45 мин  2 вопр. │   │
│  │ Анна С.   ✅ Была 30 мин          │   │
│  │ Игорь К.  ✅ Был  15 мин          │   │
│  │ Ольга Т.  ❌ Не пришла [Follow-up]│   │
│  │ Денис Р.  ❌ Не пришёл [Follow-up]│   │
│  └────────────────────────────────────┘   │
│                                          │
│  [🤖 AI Follow-up]                       │
└──────────────────────────────────────────┘
```

### Контакты (ContactsScreen)

```
Все гости партнёра из всех мероприятий:
    • Имя, email, телефон
    • Канал связи: Telegram / WhatsApp / Email
    • Статус: Attended / Registered / No-show
    • Рекомендуемое действие: "Follow-up" / "Пригласить на следующий"
```

### Статистика (StatisticsScreen)

```
За 7 дней / 30 дней / Всё время:
    • Всего приглашено: X (только свои гости)
    • Зарегистрировано: Y
    • Пришли: Z (только сматченные, без walk-in)
    • Конверсия: Z/Y × 100%
```

---

## 7. AI Follow-up (после вебинара)

```
Партнёр выбирает контакт → "AI Follow-up"
    │
    ▼
POST /api/partner-app/ai-followup
    body: { message, guestContext: { name, attended, duration, questions } }
    │
    ▼
GPT-4o-mini генерирует персонализированное сообщение:
    • Для attended: "Привет, Макс! Рад что ты был на вебинаре..."
    • Для no-show: "Привет, Макс! Жаль что не получилось прийти..."
    │
    ▼
Партнёр копирует → отправляет через Telegram/WhatsApp
```

---

## 8. Таблицы базы данных — связи

```
schedule_events          (админ создаёт вебинары)
    │
    ├──► invite_events   (партнёр создаёт social invite ссылку)
    │       │
    │       └──► invite_guests  (гость регистрируется)
    │               │
    │               └──► zoom_attendance (Zoom-синк привязывает посещение)
    │
    └──► personal_invites  (партнёр создаёт AI invite)
            │
            └──► invite_guests  (при регистрации данные дублируются сюда)
                    │
                    └──► zoom_attendance
```

---

## 9. Запланированные улучшения

| # | Задача | Что добавляет |
|---|--------|--------------|
| 42 | Guest UX | Кнопка "назад", чёткая регистрация, умный экран после |
| 43 | Invite tracking | Список контактов per-event со статусами в UpcomingScreen |
| 44 | Stats fix | Убрать walk-in из статистики партнёра, починить InvitePage |
| 45 | Telegram notifications | Deep link бот, подтверждение регистрации, напоминания через `/go/` |
| 46 | /go/ tracking | `guest_token`, endpoint `/go/:token`, time-proximity матчинг |

---

## 10. Ключевые файлы

| Область | Файл |
|---------|------|
| Схема БД | `shared/schema.ts` |
| Partner Mini App (фронт) | `client/src/pages/partner-app/` |
| Гостевые страницы | `client/src/pages/InvitePage.tsx`, `PersonalInvitePage.tsx` |
| API партнёра | `server/partner-app-routes.ts` |
| API регистрации | `server/routes.ts` (строки 941–1070) |
| Zoom-интеграция | `server/integrations/zoom-api.ts` |
| Напоминания | `server/integrations/reminder-scheduler.ts` |
| Partner Bot | `server/integrations/partner-bot.ts` |
| Переводы | `client/src/contexts/LanguageContext.tsx` |
