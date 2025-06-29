// quiz.js - クイズのロジック
let questions = [];
let current = 0;
let score = 0;
let timeLimit = 60;
let timerInterval;
let startTime;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('teacherSettings'));
  if (!settings) {
    alert('設定が見つかりません。教員に確認してください。');
    return;
  }
  const lines = settings.csv.trim().split('\n');
  questions = lines.map(line => {
    const [word, meaning, opt1, opt2, opt3, audioUrl] = line.split(',');
    return { word, meaning, options: shuffleArray([meaning, opt1, opt2, opt3]), audioUrl };
  });
  if (settings.order === 'random') shuffle(questions);
  timeLimit = settings.timeLimit || 60;
}

function shuffleArray(arr) {
  const array = [...arr];
  shuffle(array);
  return array;
}

function startQuiz() {
  const name = document.getElementById('studentName').value;
  const id = document.getElementById('studentId').value;
  if (!name || !id) {
    alert('氏名と学籍番号を入力してください。');
    return;
  }
  loadSettings();
  score = 0;
  current = 0;
  document.getElementById('quiz').style.display = 'block';
  document.querySelector('button').disabled = true;
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
  showQuestion();
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = timeLimit - elapsed;
  document.getElementById('timer').textContent = `残り時間: ${remaining}秒`;
  if (remaining <= 0) {
    clearInterval(timerInterval);
    showResult();
  }
}

function showQuestion() {
  if (current >= questions.length) {
    clearInterval(timerInterval);
    showResult();
    return;
  }
  const q = questions[current];
  document.getElementById('question').textContent = `Q${current + 1}: ${q.word}`;
  document.getElementById('audio').src = q.audioUrl;

  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => {
      if (opt === q.meaning) score++;
      current++;
      showQuestion();
    };
    optionsDiv.appendChild(btn);
  });
}

function showResult() {
  document.getElementById('quiz').style.display = 'none';
  const name = document.getElementById('studentName').value;
  const id = document.getElementById('studentId').value;
  let resultText = `${name}さん（${id}）のスコア: ${score} / ${questions.length}`;
  resultText += '\n\n【解答一覧】\n';
  questions.forEach((q, i) => {
    resultText += `Q${i + 1}: ${q.word} - ${q.meaning}\n`;
  });
  document.getElementById('result').textContent = resultText;
  downloadLog(name, id, score);
}

function downloadLog(name, id, score) {
  const log = `氏名,学籍番号,スコア\n${name},${id},${score}/${questions.length}`;
  const blob = new Blob([log], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${id}_${name}_log.csv`;
  link.click();
}
