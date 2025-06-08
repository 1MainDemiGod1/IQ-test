const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

app.post('/api/send-result', async (req, res) => {
  const { fio, email, testTitle, score, total } = req.body;
  if (!fio || !email || !testTitle || score == null || total == null) {
    return res.status(400).json({ error: 'Некорректные данные' });
  }
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: `Результаты теста "${testTitle}"`,
    text: `Здравствуйте, ${fio}!\n\nВаш результат по тесту "${testTitle}":\n${score} из ${total}\n\nСпасибо за участие!`
  };
  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка отправки email' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server started on port', PORT)); 