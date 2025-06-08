# Онлайн IQ-Тест

Веб-сервис для прохождения IQ-теста с регистрацией пользователей. Интерфейс на русском языке.

## Запуск локально

1. Установите зависимости:
   ```
   npm install
   ```
2. Запустите сервер:
   ```
   npm start
   ```
3. Откройте [http://localhost:3000](http://localhost:3000)

## Деплой на Render

1. Загрузите проект в свой репозиторий на GitHub (например, https://github.com/1MainDemiGod1/IQ-test.git).
2. Перейдите на [Render](https://render.com/), создайте новый Web Service.
3. Выберите "Connect a repository" и подключите ваш репозиторий.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Укажите Environment: Node
7. После деплоя сайт будет доступен по адресу вида `https://...onrender.com`

## Структура
- `server.js` — сервер Express, логика регистрации, теста, результатов
- `public/` — HTML, CSS, JS для фронтенда
- `iqtest.db` — база данных SQLite (создаётся автоматически)

## Настройка CI/CD
Render автоматически будет обновлять сайт при каждом пуше в GitHub-репозиторий.

---

Если возникнут вопросы — пишите в Issues на GitHub. 