// test.js

function getTests() {
  return JSON.parse(localStorage.getItem('tests')) || [];
}

function getTestById(id) {
  return getTests().find(t => t.id === id);
}

function getTestIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('test');
}

const testId = getTestIdFromUrl();
const test = getTestById(testId);

const testTitle = document.getElementById('test-title');
const testForm = document.getElementById('test-form');
const finishBtn = document.getElementById('finish-test');

if (!test) {
  testTitle.textContent = 'Тест не найден';
  testForm.innerHTML = '';
  finishBtn.style.display = 'none';
} else {
  testTitle.textContent = test.title;
  test.questions.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'question-block';
    div.innerHTML = `<b>${i+1}. ${q.text}</b><br>` +
      q.options.map((opt, j) => `
        <label><input type="radio" name="q${i}" value="${j}" required> ${opt}</label><br>
      `).join('');
    testForm.appendChild(div);
  });
  finishBtn.style.display = 'block';
}

finishBtn.addEventListener('click', () => {
  const formData = new FormData(testForm);
  let score = 0;
  test.questions.forEach((q, i) => {
    const userAnswer = parseInt(formData.get(`q${i}`), 10);
    if (userAnswer === q.answer) score++;
  });
  // Сохраняем результат во временное хранилище для result.html
  sessionStorage.setItem('lastResult', JSON.stringify({
    testId: test.id,
    testTitle: test.title,
    score,
    total: test.questions.length
  }));
  window.location.href = 'result.html';
}); 