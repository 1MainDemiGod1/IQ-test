const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./iqtest.db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('docs'));
app.use(session({
  secret: 'iqtest_secret',
  resave: false,
  saveUninitialized: true
}));

// Создание таблиц, если не существуют
// Пользователи и результаты
// ... existing code ...
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    score INTEGER,
    date TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

// Маршруты
// Главная страница
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/test');
  } else {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
  }
});

// Регистрация
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
    if (err) {
      return res.send('Ошибка: пользователь уже существует или данные некорректны. <a href="/">Назад</a>');
    }
    req.session.userId = this.lastID;
    res.redirect('/test');
  });
});

// Вход
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT id FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (row) {
      req.session.userId = row.id;
      res.redirect('/test');
    } else {
      res.send('Неверный логин или пароль. <a href="/">Назад</a>');
    }
  });
});

// Тест (пример: 3 вопроса)
const questions = [
  {
    q: 'Какое число лишнее: 2, 4, 8, 16, 20, 32?',
    a: ['2', '4', '8', '16', '20', '32'],
    correct: 4
  },
  {
    q: 'Продолжите ряд: 1, 3, 6, 10, ...?',
    a: ['12', '14', '15', '16'],
    correct: 2
  },
  {
    q: 'Сколько треугольников на рисунке? (вообразите рисунок с 4 треугольниками)',
    a: ['2', '3', '4', '5'],
    correct: 2
  }
];

app.get('/test', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'docs', 'test.html'));
});

app.post('/submit', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    if (req.body['q' + i] == questions[i].correct) score++;
  }
  db.run('INSERT INTO results (user_id, score, date) VALUES (?, ?, ?)', [req.session.userId, score, new Date().toISOString()], () => {
    res.redirect('/result');
  });
});

app.get('/result', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  db.get('SELECT score FROM results WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.session.userId], (err, row) => {
    res.send(`<h2>Ваш результат: ${row ? row.score : 0} из ${questions.length}</h2><a href="/test">Пройти снова</a> | <a href="/logout">Выйти</a>`);
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Для фронта вопросы (AJAX)
app.get('/api/questions', (req, res) => {
  res.json(questions.map(q => ({ q: q.q, a: q.a })));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Сервер запущен на порту', PORT);
}); 