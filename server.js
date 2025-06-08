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
    user: 'sdcvuinm006@gmail.com', // замените на свой email
    pass: 'wbso mjyl mlvk bnyt' // замените на свой пароль или пароль приложения
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
    email TEXT,
    lastname TEXT,
    firstname TEXT,
    middlename TEXT
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
  const { username, password, email, lastname, firstname, middlename } = req.body;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.redirect('/register.html?error=Некорректный+email');
  }
  db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
    if (row) {
      return res.redirect('/register.html?error=Пользователь+с+таким+email+уже+существует');
    }
    db.run('INSERT INTO users (username, password, email, lastname, firstname, middlename) VALUES (?, ?, ?, ?, ?, ?)', [username, password, email, lastname, firstname, middlename], function(err) {
      if (err) {
        return res.redirect('/register.html?error=Пользователь+с+таким+логином+уже+существует');
      }
      res.redirect('/index.html?registered=1');
    });
  });
});

// Вход
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT id FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (row) {
      req.session.userId = row.id;
      res.redirect('/tests.html');
    } else {
      res.redirect('/index.html?error=Неверный+логин+или+пароль');
    }
  });
});

// Тест (пример: 3 вопроса)
const questions = [
  {
    q: 'Какое число должно стоять вместо знака вопроса? 2, 6, 12, 20, 30, ?',
    a: ['38', '40', '42', '44'],
    correct: 2,
    iq: 8
  },
  {
    q: 'Какое слово лишнее: квадрат, треугольник, круг, ромб, куб?',
    a: ['квадрат', 'треугольник', 'круг', 'ромб', 'куб'],
    correct: 4,
    iq: 8
  },
  {
    q: 'Найдите закономерность: 3, 9, 27, 81, ?',
    a: ['162', '243', '324', '729'],
    correct: 1,
    iq: 8
  },
  {
    q: 'Какое число пропущено: 31, 29, 24, 22, 17, ?',
    a: ['15', '14', '13', '12'],
    correct: 2,
    iq: 8
  },
  {
    q: 'Какое из чисел не подходит: 121, 144, 169, 196, 225, 256, 289, 324, 361, 400, 441, 484, 529, 576, 625, 729?',
    a: ['121', '324', '441', '729'],
    correct: 3,
    iq: 8
  },
  {
    q: 'Какое слово не подходит: мысль, идея, концепция, гипотеза, теория, аксиома?',
    a: ['мысль', 'идея', 'концепция', 'гипотеза', 'теория', 'аксиома'],
    correct: 5,
    iq: 8
  },
  {
    q: 'Какое число будет следующим: 2, 12, 30, 56, 90, ?',
    a: ['110', '132', '156', '182'],
    correct: 1,
    iq: 8
  },
  {
    q: 'Найдите закономерность: 1, 4, 9, 16, 25, 36, 49, 64, 81, ?',
    a: ['90', '91', '100', '121'],
    correct: 2,
    iq: 8
  },
  {
    q: 'Какое число пропущено: 7, 10, 8, 11, 9, 12, ?',
    a: ['10', '11', '12', '13'],
    correct: 0,
    iq: 8
  },
  {
    q: 'Какое слово не подходит: атом, молекула, клетка, орган, организм?',
    a: ['атом', 'молекула', 'клетка', 'орган', 'организм'],
    correct: 0,
    iq: 8
  },
  {
    q: 'Какое число будет следующим: 1, 2, 6, 24, 120, ?',
    a: ['240', '360', '720', '840'],
    correct: 2,
    iq: 8
  },
  {
    q: 'Какое из чисел не подходит: 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 91?',
    a: ['67', '73', '79', '91'],
    correct: 3,
    iq: 8
  },
  {
    q: 'Какое слово не подходит: красный, синий, зелёный, жёлтый, белый, чёрный?',
    a: ['красный', 'синий', 'зелёный', 'жёлтый', 'белый', 'чёрный'],
    correct: 4,
    iq: 8
  },
  {
    q: 'Какое число пропущено: 2, 5, 10, 17, 26, ?',
    a: ['33', '34', '35', '36'],
    correct: 1,
    iq: 8
  },
  {
    q: 'Какое из чисел не подходит: 8, 27, 64, 125, 216, 343, 512, 729, 1000?',
    a: ['343', '512', '729', '1000'],
    correct: 3,
    iq: 8
  },
  {
    q: 'Какое слово не подходит: лев, тигр, леопард, гепард, ягуар, пантера, пума, рысь?',
    a: ['лев', 'тигр', 'леопард', 'гепард', 'ягуар', 'пантера', 'пума', 'рысь'],
    correct: 7,
    iq: 8
  },
  {
    q: 'Какое число будет следующим: 3, 6, 18, 72, ?',
    a: ['144', '216', '288', '360'],
    correct: 1,
    iq: 8
  },
  {
    q: 'Какое слово не подходит: весна, лето, осень, зима, месяц?',
    a: ['весна', 'лето', 'осень', 'зима', 'месяц'],
    correct: 4,
    iq: 8
  },
  {
    q: 'Какое число пропущено: 4, 9, 20, 43, ?',
    a: ['86', '90', '94', '98'],
    correct: 0,
    iq: 8
  },
  {
    q: 'Какое из чисел не подходит: 6, 28, 496, 8128, 33550336, 8589869056?',
    a: ['496', '8128', '33550336', '8589869056'],
    correct: 3,
    iq: 8
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
  db.get('SELECT email, lastname, firstname, middlename FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (user && user.email) {
      const mailOptions = {
        from: 'sdcvuinm006@gmail.com',
        to: user.email,
        subject: 'Ваш результат IQ-теста',
        text: `Уважаемый(ая) ${user.lastname} ${user.firstname} ${user.middlename}!\n\nВаш результат: ${score} из 160 баллов.\nСпасибо за прохождение теста!`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Ошибка отправки email:', error);
        } else {
          console.log('Email отправлен:', info.response);
        }
      });
    }
    db.run('INSERT INTO results (user_id, score, date) VALUES (?, ?, ?)', [req.session.userId, score, new Date().toISOString()], () => {
      res.redirect('/result');
    });
  });
});

app.get('/result', (req, res) => {
  if (!req.session.userId) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'docs', 'results.html'));
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

// Маршрут для страницы со всеми тестами
app.get('/tests', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'tests.html'));
});

// Маршрут для страницы результатов
app.post('/submit-test', (req, res) => {
  // Логика обработки теста
  res.sendFile(path.join(__dirname, 'docs', 'results.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Сервер запущен на порту', PORT);
}); 