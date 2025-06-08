// addTest.js

const form = document.getElementById('add-test-form');
const questionsContainer = document.getElementById('questions-container');
const addQuestionBtn = document.getElementById('add-question');

let questionCount = 0;

function createQuestionBlock() {
  const qIndex = questionCount++;
  const div = document.createElement('div');
  div.className = 'question-block';
  div.innerHTML = `
    <label>Вопрос:<br><input type="text" name="question_${qIndex}" required></label><br>
    <label>Варианты ответа:</label><br>
    <input type="text" name="option_${qIndex}_0" placeholder="Вариант 1" required>
    <input type="text" name="option_${qIndex}_1" placeholder="Вариант 2" required>
    <input type="text" name="option_${qIndex}_2" placeholder="Вариант 3" required>
    <input type="text" name="option_${qIndex}_3" placeholder="Вариант 4" required><br>
    <label>Правильный ответ:
      <select name="answer_${qIndex}" required>
        <option value="0">1</option>
        <option value="1">2</option>
        <option value="2">3</option>
        <option value="3">4</option>
      </select>
    </label>
    <hr>
  `;
  questionsContainer.appendChild(div);
}

addQuestionBtn.addEventListener('click', () => {
  createQuestionBlock();
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);
  const title = data.get('title');
  const questions = [];
  for (let i = 0; i < questionCount; i++) {
    const text = data.get(`question_${i}`);
    if (!text) continue;
    const options = [0,1,2,3].map(j => data.get(`option_${i}_${j}`));
    const answer = parseInt(data.get(`answer_${i}`), 10);
    questions.push({ text, options, answer });
  }
  if (questions.length === 0) {
    alert('Добавьте хотя бы один вопрос!');
    return;
  }
  // Сохраняем тест в localStorage
  const tests = JSON.parse(localStorage.getItem('tests')) || [];
  const id = 'test_' + Date.now();
  tests.push({ id, title, questions });
  localStorage.setItem('tests', JSON.stringify(tests));
  alert('Тест успешно добавлен!');
  window.location.href = 'index.html';
});

// Добавляем первый вопрос по умолчанию
createQuestionBlock(); 