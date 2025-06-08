const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const db = new sqlite3.Database('./iqtest.db');

// Настройка транспорта для gmail (замените на свои данные)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ВАШ_EMAIL@gmail.com', // замените на свой email
    pass: 'ВАШ_ПАРОЛЬ_ИЛИ_ПАРОЛЬ_ПРИЛОЖЕНИЯ' // замените на свой пароль или пароль приложения
  }
});

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
    password TEXT,
    email TEXT
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
  const { username, password, email } = req.body;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.send('Некорректный email. <a href="/">Назад</a>');
  }
  db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, password, email], function(err) {
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
    correct: 4,
    iq: 5
  },
  {
    q: 'Продолжите ряд: 1, 3, 6, 10, ...?',
    a: ['12', '14', '15', '16'],
    correct: 2,
    iq: 5
  },
  {
    q: 'Сколько треугольников на рисунке? (вообразите рисунок с 4 треугольниками)',
    a: ['2', '3', '4', '5'],
    correct: 2,
    iq: 5
  },
  {
    q: 'Какое слово лишнее: кот, собака, мышь, воробей?',
    a: ['кот', 'собака', 'мышь', 'воробей'],
    correct: 3,
    iq: 6
  },
  {
    q: 'Найди закономерность: 2, 6, 12, 20, ...?',
    a: ['30', '28', '24', '22'],
    correct: 1,
    iq: 6
  },
  {
    q: 'Какое из чисел делится на 3: 14, 21, 25, 28?',
    a: ['14', '21', '25', '28'],
    correct: 1,
    iq: 6
  },
  {
    q: 'Выберите правильную фигуру для завершения последовательности (вообразите фигуры): круг, квадрат, треугольник, круг, квадрат, ...?',
    a: ['треугольник', 'круг', 'квадрат', 'ромб'],
    correct: 0,
    iq: 7
  },
  {
    q: 'Какое число пропущено: 5, 10, __, 20, 25?',
    a: ['12', '13', '15', '17'],
    correct: 2,
    iq: 7
  },
  {
    q: 'Найди лишнее: весна, лето, осень, неделя, зима?',
    a: ['весна', 'лето', 'осень', 'неделя', 'зима'],
    correct: 3,
    iq: 7
  },
  {
    q: 'Какое число будет следующим: 1, 4, 9, 16, ...?',
    a: ['20', '25', '24', '36'],
    correct: 1,
    iq: 8
  },
  {
    q: 'Какое слово не подходит: стол, стул, диван, окно?',
    a: ['стол', 'стул', 'диван', 'окно'],
    correct: 3,
    iq: 8
  },
  {
    q: 'Продолжите ряд: 2, 4, 8, 16, ...?',
    a: ['18', '20', '24', '32'],
    correct: 3,
    iq: 8
  },
  {
    q: 'Найди закономерность: 3, 6, 12, 24, ...?',
    a: ['36', '48', '50', '60'],
    correct: 1,
    iq: 8
  },
  {
    q: 'Какое число пропущено: 7, 14, __, 28, 35?',
    a: ['17', '19', '21', '23'],
    correct: 2,
    iq: 9
  },
  {
    q: 'Какое слово лишнее: яблоко, груша, апельсин, морковь?',
    a: ['яблоко', 'груша', 'апельсин', 'морковь'],
    correct: 3,
    iq: 9
  },
  {
    q: 'Выберите правильный ряд: 2, 4, 6, 8, ...?',
    a: ['10', '12', '14', '16'],
    correct: 0,
    iq: 9
  },
  {
    q: 'Какое число будет следующим: 2, 3, 5, 7, 11, ...?',
    a: ['12', '13', '15', '17'],
    correct: 1,
    iq: 10
  },
  {
    q: 'Найди лишнее: понедельник, вторник, среда, январь, четверг?',
    a: ['понедельник', 'вторник', 'среда', 'январь', 'четверг'],
    correct: 3,
    iq: 10
  },
  {
    q: 'Продолжите ряд: 1, 2, 4, 8, 16, ...?',
    a: ['18', '24', '32', '36'],
    correct: 2,
    iq: 10
  },
  {
    q: 'Какое число будет следующим: 5, 10, 20, 40, ...?',
    a: ['60', '70', '80', '100'],
    correct: 2,
    iq: 10
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
    if (req.body['q' + i] == questions[i].correct) score += questions[i].iq;
  }
  db.get('SELECT email FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (user && user.email) {
      const mailOptions = {
        from: 'ВАШ_EMAIL@gmail.com',
        to: user.email,
        subject: 'Ваш результат IQ-теста',
        text: `Ваш результат: ${score} из 160 баллов. Спасибо за прохождение теста!`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        // Можно добавить логирование, если нужно
      });
    }
    db.run('INSERT INTO results (user_id, score, date) VALUES (?, ?, ?)', [req.session.userId, score, new Date().toISOString()], () => {
      res.redirect('/result');
    });
  });
});

app.get('/result', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  res.send(`<h2>Результат отправлен на вашу почту.</h2><a href="/test">Пройти снова</a> | <a href="/logout">Выйти</a>`);
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