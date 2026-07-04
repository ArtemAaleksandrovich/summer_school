# Роль и контекст

Ты — senior React Native разработчик. Твоя задача — реализовать MVP мобильного приложения для скалодрома «Вертикаль» на основе готовой аналитической документации.

**Важно:** Бэкенд имитируется через mock API. Все запросы к API должны работать с локальными моковыми данными.

---

# Технологический стек

- **Фреймворк:** React Native 0.73+ (Expo SDK 50+)
- **Язык:** TypeScript (strict mode)
- **Навигация:** React Navigation 6
- **HTTP-клиент:** Axios
- **Хранение токенов:** expo-secure-store
- **Стейт-менеджмент:** Zustand
- **Формы:** React Hook Form + Zod
- **Кэширование:** React Query (TanStack Query)
- **UI компоненты:** React Native Paper или кастомные компоненты

---

# Структура проекта
summer-school-2026-feature-client/
├── src/
│ ├── api/
│ │ ├── client.ts # Axios instance
│ │ ├── mock/ # Mock данные и handlers
│ │ │ ├── data.ts # Моковые слоты, инструкторы, брони
│ │ │ └── handlers.ts # Имитация API endpoints
│ │ ├── auth.ts
│ │ ├── slots.ts
│ │ └── bookings.ts
│ ├── screens/
│ │ ├── SCR-001-registration/
│ │ ├── SCR-002-slot-list/
│ │ └── SCR-004-booking/
│ ├── components/
│ │ ├── bottom-sheets/
│ │ │ ├── BS-001-filters/
│ │ │ └── BS-002-booking-success/
│ │ └── ui/
│ ├── logic/
│ │ ├── LOGIC-001-otp-auth.ts
│ │ ├── LOGIC-003-pricing.ts
│ │ ── LOGIC-005-filtering.ts
│ ├── store/
│ │ └── authStore.ts
│ ── utils/
├── 01-analysis
├── assets/
└── package.json

---

# Источники аналитики

Вся аналитика находится в папке `01-analysis/`:

- **Функциональные требования:** `01-analysis/2-requirements/functional-requirements.md`
- **Модель данных:** `01-analysis/4-design/data-model.md`
- **ТЗ экранов:** `01-analysis/5-mobile-app-spec/SCR-*.md`
- **ТЗ bottom sheets:** `01-analysis/5-mobile-app-spec/BS-*.md`
- **Переиспользуемые логики:** `01-analysis/5-mobile-app-spec/09_ЛОГИКИ/LOGIC-*.md`
- **Дизайн-бриф:** `01-analysis/3-design-brief/00-foundations.md`

---

# Mock API

## Структура моковых данных

Создай файл `src/api/mock/data.ts` с моковыми данными:

```typescript
// Пример структуры
export const mockInstructors = [
  {
    id: 'uuid-1',
    name: 'Иван Петров',
    photo_url: 'https://...',
    rating: 4.8
  },
  // ... ещё 4 инструктора
];

export const mockSlots = [
  {
    id: 'uuid-slot-1',
    start_time: '2026-07-15T19:00:00Z',
    duration_minutes: 90,
    format: 'BOULDERING',
    instructor: mockInstructors[0],
    capacity: 8,
    booked_count: 4,
    rental_gear: {
      is_available: true,
      shoes_price: 300,
      harness_price: 200,
      available_sizes: [40, 41, 42, 43]
    },
    base_price: 800,
    address: 'ул. Спортивная, 15',
    status: 'SCHEDULED'
  },
  // ... слоты на 7 дней вперёд
];

export const mockBookings: Booking[] = []; // Изначально пустой
```

## Имитация API endpoints

Создай файл src/api/mock/handlers.ts с функциями, имитирующими API:

```typescript
// Пример
export const mockApi = {
  auth: {
    requestOtp: async (phone: string) => {
      // Имитация задержки сети
      await delay(500);
      const otpId = generateUUID();
      const otpCode = '123456'; // Фиксированный код для тестирования
      console.log(`[MOCK] OTP для ${phone}: ${otpCode}`);
      return { otp_id: otpId, ttl: 300 };
    },
    
    verifyOtp: async (otpId: string, code: string) => {
      await delay(300);
      if (code !== '123456') {
        throw new ApiError(401, 'INVALID_OTP', 'Неверный код');
      }
      return {
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 900
      };
    }
  },
  
  slots: {
    getSlots: async (filters?: SlotFilters) => {
      await delay(400);
      let slots = [...mockSlots];
      // Применение фильтров
      if (filters?.format) {
        slots = slots.filter(s => filters.format!.includes(s.format));
      }
      // ... другие фильтры
      return { slots, meta: { total: slots.length, has_more: false } };
    }
  },
  
  bookings: {
    createBooking: async (data: BookingCreateRequest, idempotencyKey: string) => {
      await delay(600);
      // Проверка идемпотентности
      // Проверка доступности
      // Создание брони
      const booking: Booking = {
        id: generateUUID(),
        slot_id: data.slot_id,
        status: 'CONFIRMED',
        rental_gear_needed: data.rental_gear_needed,
        shoe_size: data.shoe_size,
        total_price: calculatePrice(data),
        created_at: new Date().toISOString()
      };
      mockBookings.push(booking);
      return booking;
    }
  }
};
```

## Правила mock API
1.	Задержка сети: Все запросы имеют задержку 300-800ms для имитации реального API
2.	Фиксированный OTP: Код всегда 123456 для удобства тестирования
3.	Логирование: Все запросы логируются в консоль с префиксом [MOCK]
4.	Обработка ошибок: Используй класс ApiError с кодами (401, 409, 422 и т.д.)
5.	Идемпотентность: Храни использованные Idempotency-Key и возвращай кэшированный результат

## Задачи для реализации
## Задача 1: Авторизация (SCR-001)
Источники:
    •	01-analysis/5-mobile-app-spec/SCR-001-registration.md
    •	01-analysis/5-mobile-app-spec/09_ЛОГИКИ/LOGIC-001_OTP-авторизация.md
    •	01-analysis/3-design-brief/SCR-001-registration.md
Что реализовать:
1.	Экран ввода телефона:
    o	Поле ввода с маской +7 (___) ___-__-__
    o	Кнопка «Получить код» (активна при валидном номере)
    o	Валидация формата телефона
2.	Экран ввода OTP:
    o	6 ячеек для ввода кода
    o	Автопереход между ячейками
    o	Таймер повторной отправки (60 секунд)
    o	Кнопка «Подтвердить»
3.	Логика:
    o	Вызов mockApi.auth.requestOtp() при запросе кода
    o	Вызов mockApi.auth.verifyOtp() при подтверждении
    o	Сохранение токенов в expo-secure-store
    o	Переход на SCR-002 при успешной авторизации
4.	Обработка ошибок:
    o	400: Inline-ошибка «Проверь номер телефона»
    o	401: Inline-ошибка «Код не подошёл. Осталось попыток: N»
    o	429: Блокировка экрана на 15 минут
Критерии приёмки:
    •	Ввод номера с маской работает
    •	OTP отправляется (лог в консоль), таймер обратного отсчёта работает
    •	При вводе кода 123456 происходит успешная авторизация
    •	При неверном коде показывается ошибка
    •	Токены сохраняются в secure store
    •	После авторизации происходит переход на SCR-002

## Задача 2: Список слотов с фильтрацией (SCR-002 + BS-001)
Источники:
    •	01-analysis/5-mobile-app-spec/SCR-002-slot-list.md
    •	01-analysis/5-mobile-app-spec/BS-001-filters.md
    •	01-analysis/5-mobile-app-spec/09_ЛОГИКИ/LOGIC-005_Фильтрация-слотов.md
    •	01-analysis/5-mobile-app-spec/09_ЛОГИКИ/LOGIC-008_Паттерн-состояний-экрана.md
Что реализовать:
1.	Экран списка слотов (SCR-002):
    o	AppBar с заголовком «Расписание» и иконкой фильтров
    o	Горизонтальный скролл дат (7 дней от текущей даты)
    o	Список карточек слотов
    o	Tab Bar с 3 вкладками (Расписание активна)
2.	Карточка слота:
    o	Время начала (крупно)
    o	Бейдж формата (Болдеринг/Трассы)
    o	Инструктор (имя + аватар)
    o	Количество свободных мест
    o	Статус проката (иконка + текст)
3.	Bottom Sheet фильтров (BS-001):
    o	Чекбоксы форматов (Болдеринг, Трассы)
    o	Чекбоксы инструкторов (список из моковых данных)
    o	Кнопка «Применить»
    o	Кнопка «Сбросить» (если есть активные фильтры)
4.	Паттерн состояний:
    o	Loading: Скелетоны карточек (3-4 штуки)
    o	Content: Список карточек
    o	Empty: Иллюстрация + текст «На эти дни тренировок пока нет»
    o	Error: Иконка ошибки + кнопка «Повторить»
5.	Логика фильтрации:
    o	OR внутри группы (форматы, инструкторы)
    o	AND между группами
    o	Фильтрация по дате через горизонтальный скролл
Критерии приёмки:
    •	Список слотов загружается из mock API
    •	Скелетоны показываются при загрузке
    •	Карточки слотов отображают все данные
    •	Горизонтальный скролл дат фильтрует список
    •	BS-001 открывается по тапу на иконку фильтров
    •	Фильтрация по формату работает (OR)
    •	Фильтрация по инструктору работает (OR)
    •	Комбинация фильтров работает (AND)
    •	Empty state показывается при пустом результате
    •	Pull-to-refresh обновляет список

## Задача 3: Оформление брони (SCR-004 + BS-002)
Источники:
    •	01-analysis/5-mobile-app-spec/SCR-004-booking.md
    •	01-analysis/5-mobile-app-spec/BS-002-booking-success.md
    •	01-analysis/5-mobile-app-spec/09_ЛОГИКИ/LOGIC-003_Расчёт-цены-брони.md
Что реализовать:
1.	Экран оформления брони (SCR-004):
    o	AppBar с кнопкой «Назад»
    o	Сводка по слоту (дата, время, формат, инструктор)
    o	Секция «Снаряжение»:
        	Радио-кнопки: «Своё снаряжение» / «Взять в прокат»
        	Picker размера скальников (36-45) — показывается только если выбран прокат
    o	Секция «Итого»:
        	Стоимость тренировки
        	Стоимость проката (если выбран)
        	Итого к оплате (крупно, жирно)
    o	Кнопка «Подтвердить бронь» (фиксирована внизу)
2.	Bottom Sheet успеха (BS-002):
    o	Большая зелёная галочка
    o	Заголовок «Ты записан!»
    o	Текст с датой/временем тренировки
    o	Кнопка «Посмотреть мои записи»
    o	Кнопка «Закрыть»
3.	Логика расчёта цены:
    o	Формула: total = base_price + (rental ? shoes_price + harness_price : 0)
    o	Динамическое обновление при изменении радио-кнопок
4.	Создание брони:
    o	Генерация Idempotency-Key (UUIDv4)
    o	Вызов mockApi.bookings.createBooking()
    o	Блокировка кнопки во время запроса
    o	Обработка ошибок:
        	409: Тост «Места закончились»
        	422: Alert «Нет нужного размера»
    o	При успехе: показ BS-002
Критерии приёмки:
    •	Сводка по слоту отображается
    •	Радио-кнопки переключаются
    •	Picker размера показывается только при выборе проката
    •	Цена пересчитывается динамически
    •	При нажатии «Подтвердить бронь» отправляется запрос
    •	Idempotency-Key генерируется и передаётся
    •	Кнопка блокируется во время запроса
    •	При успехе показывается BS-002
    •	При ошибке 409 показывается тост
    •	При ошибке 422 показывается Alert

## Инструкции по выполнению
1.	Начни с настройки проекта:
    o	Инициализируй Expo проект с TypeScript
    o	Установи зависимости (React Navigation, Axios, Zustand, React Query)
    o	Настрой структуру папок
2.	Создай mock API:
    o	Реализуй моковые данные (инструкторы, слоты)
    o	Реализуй handlers с имитацией задержек
    o	Протестируй в консоли
3.	Реализуй Задачу 1 (Авторизация):
    o	Создай экран SCR-001
    o	Подключи mock API для OTP
    o	Реализуй сохранение токенов
    o	Протестируй флоу авторизации
4.	Реализуй Задачу 2 (Список слотов):
    o	Создай экран SCR-002
    o	Реализуй карточки слотов
    o	Реализуй BS-001 (фильтры)
    o	Подключи фильтрацию
    o	Протестируй все состояния (Loading, Content, Empty, Error)
5.	Реализуй Задачу 3 (Оформление брони):
    o	Создай экран SCR-004
    o	Реализуй расчёт цены
    o	Реализуй BS-002 (успех)
    o	Подключи создание брони
    o	Протестируй успешный флоу и ошибки
6.	Финальная проверка:
    o	Пройди полный флоу: Авторизация → Список слотов → Фильтрация → Детали слота → Оформление брони → Успех
    o	Убедись, что все критерии приёмки выполнены
    o	Проверь обработку ошибок

## Конвенции
1.	Числа не хардкодятся: Все цены, лимиты, размеры берутся из моковых данных
2.	ID требований: Используй префиксы FR-, SCR-, BS-, LOGIC- для ссылок в коде (комментарии)
3.	Обработка ошибок: Все API-запросы должны обрабатывать ошибки через try-catch
4.	Типизация: Строгий TypeScript, никаких any
5.	Компоненты: Переиспользуемые компоненты выноси в src/components/ui/

## Готовность к старту
Перед началом работы убедись, что:
    •	Папка 01-analysis/ содержит всю аналитику
    •	Node.js 20+ установлен
    •	Expo CLI установлен (npm install -g expo-cli)
    •	Ты прочитал ТЗ экранов SCR-001, SCR-002, SCR-004

