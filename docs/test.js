const path = window.location.pathname;
let api = '/api/questions';
let submit = '/submit';
if (path.includes('test-math')) {
  api = '/api/questions-math';
  submit = '/submit-math';
}
fetch(api)
  .then(res => res.json())
  .then(questions => {
    const slider = document.getElementById('question-slider');
    let current = 0;
    const answers = Array(questions.length).fill(null);

    function renderQuestion(idx) {
      const q = questions[idx];
      slider.innerHTML = `
        <div class="question-block active">
          <div class="question-title"><span class="q-num">${idx+1}/${questions.length}</span> ${q.q}</div>
          <div class="answers">
            ${q.a.map((ans, j) => `
              <label class="answer-label">
                <input type="radio" name="q${idx}" value="${j}" ${answers[idx] == j ? 'checked' : ''} required>
                <span>${ans}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
      // Восстанавливаем выбранный ответ
      const radios = slider.querySelectorAll('input[type=radio]');
      radios.forEach(radio => {
        radio.addEventListener('change', e => {
          answers[idx] = +e.target.value;
        });
      });
    }

    function updateButtons() {
      document.getElementById('prevBtn').style.display = current === 0 ? 'none' : '';
      document.getElementById('nextBtn').style.display = current === questions.length-1 ? 'none' : '';
      document.getElementById('finishBtn').style.display = current === questions.length-1 ? '' : 'none';
    }

    document.getElementById('prevBtn').onclick = () => {
      if (current > 0) {
        current--;
        renderQuestion(current);
        updateButtons();
      }
    };
    document.getElementById('nextBtn').onclick = () => {
      // Не даём перейти, если не выбран ответ
      if (slider.querySelector('input[type=radio]:checked')) {
        if (current < questions.length-1) {
          current++;
          renderQuestion(current);
          updateButtons();
        }
      } else {
        slider.querySelector('.answers').classList.add('shake');
        setTimeout(()=>slider.querySelector('.answers').classList.remove('shake'), 400);
      }
    };
    // Перед отправкой формы заполняем ответы
    document.getElementById('testForm').onsubmit = function(e) {
      // Проверяем, что все вопросы отвечены
      if (answers.some(a => a === null)) {
        e.preventDefault();
        renderQuestion(answers.findIndex(a => a === null));
        updateButtons();
        slider.querySelector('.answers').classList.add('shake');
        setTimeout(()=>slider.querySelector('.answers').classList.remove('shake'), 400);
        return false;
      }
      // Добавляем скрытые input'ы для отправки
      answers.forEach((a, i) => {
        let input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'q'+i;
        input.value = a;
        this.appendChild(input);
      });
      this.action = submit;
    };
    // Первый вопрос
    renderQuestion(0);
    updateButtons();
  }); 