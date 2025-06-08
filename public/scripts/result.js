// result.js 

const resultForm = document.getElementById('result-form');
const resultMessage = document.getElementById('result-message');

// Получаем результат из sessionStorage
const lastResult = JSON.parse(sessionStorage.getItem('lastResult') || '{}');

if (lastResult && lastResult.testTitle) {
  resultMessage.innerHTML = `<b>Тест:</b> ${lastResult.testTitle}<br><b>Ваш результат:</b> ${lastResult.score} из ${lastResult.total}`;
} else {
  resultMessage.innerHTML = 'Результат не найден. Пройдите тест.';
  resultForm.style.display = 'none';
}

resultForm.addEventListener('submit', async e => {
  e.preventDefault();
  const data = new FormData(resultForm);
  const fio = `${data.get('lastName')} ${data.get('firstName')} ${data.get('middleName')}`;
  const email = data.get('email');

  resultMessage.textContent = 'Отправка...';

  try {
    const resp = await fetch('https://YOUR-BACKEND-URL/api/send-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fio,
        email,
        testTitle: lastResult.testTitle,
        score: lastResult.score,
        total: lastResult.total
      })
    });
    const res = await resp.json();
    if (res.success) {
      resultMessage.textContent = `Результат отправлен на ${email}!`;
      resultForm.reset();
    } else {
      resultMessage.textContent = 'Ошибка отправки: ' + (res.error || 'Неизвестная ошибка');
    }
  } catch (err) {
    resultMessage.textContent = 'Ошибка соединения с сервером';
  }
});
// Замените https://YOUR-BACKEND-URL на адрес вашего backend-сервера! 