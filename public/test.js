fetch('/api/questions')
  .then(res => res.json())
  .then(questions => {
    const questionsDiv = document.getElementById('questions');
    questions.forEach((q, i) => {
      const block = document.createElement('div');
      block.className = 'question-block';
      block.innerHTML = `<p><b>${i+1}. ${q.q}</b></p>` +
        q.a.map((ans, j) =>
          `<label><input type="radio" name="q${i}" value="${j}" required> ${ans}</label><br>`
        ).join('');
      questionsDiv.appendChild(block);
    });
  }); 