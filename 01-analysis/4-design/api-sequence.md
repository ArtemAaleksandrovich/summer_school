# Sequence-диаграммы API

**Проект:** Мобильное приложение «Вертикаль» (Клиент)  
**Версия:** 1.0

---

## 1. Сценарий: Авторизация по OTP (UC-03)

**Экраны:** SCR-001 (Регистрация / Вход)

```mermaid
sequenceDiagram
    participant C as Клиент
    participant App as Приложение
    participant API as API Бэкенда
    participant SMS as SMS-шлюз

    C->>App: Вводит номер телефона
    App->>App: Валидация формата номера
    App->>API: POST /auth/otp {phone}
    
    alt Успешный запрос
        API->>SMS: Отправка SMS с кодом
        API-->>App: 200 OK {otp_id, ttl}
        App->>App: Запуск таймера (60 сек)
        App->>C: Экран ввода OTP
    else Превышен лимит (Rate Limit)
        API-->>App: 429 Too Many Requests {retry_after}
        App->>C: Показать таймер блокировки (15 мин)
    else Неверный формат
        API-->>App: 400 Bad Request {code: INVALID_PHONE}
        App->>C: Inline-ошибка под полем ввода
    end

    C->>App: Вводит 6-значный код
    App->>API: POST /auth/verify {otp_id, code}
    
    alt Код верный
        API-->>App: 200 OK {access_token, refresh_token}
        App->>App: Сохранение токенов в Keychain/Keystore
        App->>C: Переход на главный экран (SCR-002)
    else Неверный код
        API-->>App: 401 Unauthorized {code: INVALID_OTP, attempts_left}
        App->>C: Ошибка под полем ввода, очистка поля
    else Код истёк
        API-->>App: 410 Gone {code: OTP_EXPIRED}
        App->>C: Тост "Код устарел", возврат к вводу номера
    end


### Сценарий: Создание брони с идемпотентностью (UC-01)
Экраны: SCR-003 (Детали слота) → SCR-004 (Оформление) → BS-002 (Успех)
sequenceDiagram
    participant C as Клиент
    participant App as Приложение
    participant API as API Бэкенда

    C->>App: Нажимает "Подтвердить бронь"
    App->>App: Генерация Idempotency-Key (UUIDv4)
    App->>API: POST /bookings {slot_id, rental_gear_needed, shoe_size} <br> Header: Idempotency-Key: {key}
    
    alt Успех (201 Created)
        API->>API: Атомарная проверка мест и проката
        API->>API: Создание брони, списание места
        API-->>App: 201 Created {booking_id, status: CONFIRMED, total_price}
        App->>App: Сохранение брони в локальный кэш
        App->>C: Показ BS-002 (Успех), переход в Мои записи
    else Слот заполнен (409)
        API-->>App: 409 Conflict {code: SLOT_FULL}
        App->>C: Тост "Места закончились", возврат к списку
    else Нет нужного размера проката (422)
        API-->>App: 422 Unprocessable Entity {code: RENTAL_GEAR_UNAVAILABLE}
        App->>C: Alert "Нет размера N. Попробуйте без проката"
    else Дедлайн записи пройден (400)
        API-->>App: 400 Bad Request {code: BOOKING_DEADLINE_PASSED}
        App->>C: Alert "Запись закрыта за 30 мин до начала"
    else Клиент заблокирован (403)
        API-->>App: 403 Forbidden {code: CLIENT_BLOCKED, blocked_until}
        App->>C: Экран блокировки с датой разблокировки
    else Сетевая ошибка / Таймаут
        App->>App: Ошибка сети
        App->>C: Тост "Нет соединения". Кнопка "Повторить" (с тем же Idempotency-Key)
    else Ошибка сервера (5xx)
        API-->>App: 500 Internal Server Error
        App->>C: Тост "Ошибка сервера". Кнопка "Повторить"
    end

### Сценарий: Отмена брони с бизнес-правилом дедлайна (UC-02)
sequenceDiagram
    participant C as Клиент
    participant App as Приложение
    participant API as API Бэкенда

    C->>App: Нажимает "Отменить бронь"
    App->>App: Проверка локального времени vs start_time
    
    alt До начала > 2 часов
        App->>C: Диалог "Отменить бронь?" (BS-003)
    else До начала < 2 часов (Поздняя отмена)
        App->>C: Диалог с предупреждением о санкциях (BS-003)
    end

    C->>App: Подтверждает отмену ("Да, отменить")
    App->>App: Генерация Idempotency-Key
    App->>API: DELETE /bookings/{booking_id} <br> Header: Idempotency-Key: {key}
    
    alt Успешная отмена (200 OK)
        API->>API: Освобождение места и прокатного фонда
        API->>API: Инкремент счётчика late_cancellations (если поздно)
        API-->>App: 200 OK {status: CANCELLED или LATE_CANCELLED}
        App->>App: Обновление статуса в локальном кэше
        App->>C: Тост "Бронь отменена", обновление UI
    else Бронь не найдена или уже неактивна (410)
        API-->>App: 410 Gone {code: BOOKING_NOT_FOUND}
        App->>C: Тост "Бронь уже неактивна"
    else Бронь отменена организатором (403)
        API-->>App: 403 Forbidden {code: ORGANIZER_CANCELLED}
        App->>C: UI показывает причину отмены, кнопка скрыта
    end
    
    