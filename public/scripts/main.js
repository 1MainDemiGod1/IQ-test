// main.js 

// Получить тесты из localStorage или создать дефолтный IQ-тест
function getTests() {
  const tests = JSON.parse(localStorage.getItem('tests'));
  if (tests && Array.isArray(tests) && tests.length > 0) return tests;
  // Дефолтный тест
  const defaultTest = {
    id: 'iq-basic',
    title: 'Основной IQ тест',
    questions: [
      {
        text: '2 + 2 = ?',
        options: ['3', '4', '5', '6'],
        answer: 1
      },
      {
        text: 'Столица Франции?',
        options: ['Лондон', 'Париж', 'Берлин', 'Рим'],
        answer: 1
      },
      {
        text: 'Какой цвет получится при смешении синего и жёлтого?',
        options: ['Зелёный', 'Красный', 'Оранжевый', 'Фиолетовый'],
        answer: 0
      }
    ]
  };
  localStorage.setItem('tests', JSON.stringify([defaultTest]));
  return [defaultTest];
}

function renderTests() {
  const tests = getTests();
  const list = document.getElementById('test-list');
  list.innerHTML = '';
  tests.forEach(test => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${test.title}</span>
      <button onclick="startTest('${test.id}')">Пройти тест</button>
    `;
    list.appendChild(li);
  });
}

function startTest(id) {
  window.location.href = `test.html?test=${id}`;
}

renderTests(); 