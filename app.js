const ratingItems = [
  'Reservation', 'Check-in', 'Cleanliness', 'Room', 'Bathroom', 'Hot Water',
  'Electricity', 'Food', 'Hospitality', 'Safety', 'Value', 'Overall'
];
const lodgeCodes = {
  'RASESA': { accommodation: 'Rasesa Lodge', location: 'Rasesa', guide: 'George' },
  'BTIS-RASESA': { accommodation: 'Rasesa Lodge', location: 'Rasesa', guide: 'George' }
};
const storageKey = 'btis_surveys_v0_5';
let currentStep = 0;
let photoData = '';
let recognition = null;

const form = document.getElementById('surveyForm');
const steps = [...document.querySelectorAll('.step')];
const stepper = document.getElementById('stepper');
const ratings = document.getElementById('ratings');

function init() {
  document.getElementById('surveyDate').valueAsDate = new Date();
  document.getElementById('btisNo').value = makeBtisNo();
  steps.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    stepper.appendChild(dot);
  });
  renderRatings();
  bindEvents();
  updateStep();
}

function makeBtisNo() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BTIS-${y}${m}${day}-${rand}`;
}

function renderRatings() {
  ratings.innerHTML = ratingItems.map(item => `
    <div class="rating-card">
      <strong>${item}</strong>
      <div class="score-row">
        ${[1,2,3,4,5].map(n => `
          <label><input type="radio" name="rating_${item}" value="${n}"><span>${n}</span></label>
        `).join('')}
      </div>
    </div>`).join('');
}

function bindEvents() {
  document.getElementById('nextBtn').addEventListener('click', () => { if (currentStep < steps.length - 1) currentStep++; updateStep(); });
  document.getElementById('prevBtn').addEventListener('click', () => { if (currentStep > 0) currentStep--; updateStep(); });
  document.getElementById('applyQr').addEventListener('click', applyQr);
  document.getElementById('photoInput').addEventListener('change', handlePhoto);
  document.getElementById('dashboardBtn').addEventListener('click', showDashboard);
  document.getElementById('newSurveyBtn').addEventListener('click', showSurvey);
  document.getElementById('clearData').addEventListener('click', clearData);
  document.getElementById('exportJson').addEventListener('click', exportJson);
  document.getElementById('startVoice').addEventListener('click', startVoiceInput);
  document.getElementById('stopVoice').addEventListener('click', stopVoiceInput);
  form.addEventListener('submit', saveSurvey);
  form.addEventListener('input', () => { if (currentStep === steps.length - 1) renderSummary(); });
}

function updateStep() {
  steps.forEach((s, i) => s.classList.toggle('active', i === currentStep));
  [...stepper.children].forEach((d, i) => d.classList.toggle('active', i <= currentStep));
  document.getElementById('prevBtn').style.visibility = currentStep === 0 ? 'hidden' : 'visible';
  document.getElementById('nextBtn').style.display = currentStep === steps.length - 1 ? 'none' : 'inline-block';
  if (currentStep === steps.length - 1) renderSummary();
}

function applyQr() {
  const raw = document.getElementById('qrText').value.trim();
  if (!raw) return;
  let data = lodgeCodes[raw.toUpperCase()];
  if (!data) {
    try { data = JSON.parse(raw); } catch { data = null; }
  }
  if (!data) { alert('QR / Lodge Code not recognised. You can still enter manually.'); return; }
  ['accommodation', 'location', 'guide'].forEach(k => { if (data[k]) document.getElementById(k).value = data[k]; });
}

function handlePhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    photoData = reader.result;
    const img = document.getElementById('photoPreview');
    img.src = photoData;
    img.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function collectData() {
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.mayContact = fd.get('mayContact') === 'on';
  data.photo = photoData;
  data.createdAt = new Date().toISOString();
  data.ratings = {};
  ratingItems.forEach(item => data.ratings[item] = Number(fd.get(`rating_${item}`) || 0));
  return data;
}

function renderSummary() {
  const data = collectData();
  const avg = averageScore(data.ratings);
  document.getElementById('summaryBox').innerHTML = `
    <p><strong>${data.btisNo || '(No BTIS No.)'}</strong></p>
    <p>${data.accommodation || '(Accommodation not entered)'} — ${data.location || ''}</p>
    <p>Average score: <strong>${avg || '-'}</strong></p>
    <p>Guest: ${data.nationality || '-'} / ${data.travelType || '-'}</p>
  `;
}

function saveSurvey(e) {
  e.preventDefault();
  const surveys = loadSurveys();
  surveys.unshift(collectData());
  localStorage.setItem(storageKey, JSON.stringify(surveys));
  alert('Survey saved locally.');
  form.reset();
  photoData = '';
  document.getElementById('photoPreview').classList.add('hidden');
  document.getElementById('surveyDate').valueAsDate = new Date();
  document.getElementById('btisNo').value = makeBtisNo();
  currentStep = 0;
  updateStep();
}

function loadSurveys() {
  try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; }
}

function averageScore(ratingsObj) {
  const vals = Object.values(ratingsObj || {}).filter(v => v > 0);
  if (!vals.length) return 0;
  return (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(1);
}

function showDashboard() {
  document.getElementById('surveyView').classList.add('hidden');
  document.getElementById('dashboardView').classList.remove('hidden');
  renderDashboard();
}
function showSurvey() {
  document.getElementById('dashboardView').classList.add('hidden');
  document.getElementById('surveyView').classList.remove('hidden');
}

function renderDashboard() {
  const surveys = loadSurveys();
  const allScores = surveys.flatMap(s => Object.values(s.ratings || {}).filter(v => v > 0));
  const avg = allScores.length ? (allScores.reduce((a,b) => a+b, 0) / allScores.length).toFixed(1) : '-';
  document.getElementById('stats').innerHTML = `
    <div class="stat"><strong>${surveys.length}</strong>Surveys</div>
    <div class="stat"><strong>${avg}</strong>Average</div>
    <div class="stat"><strong>${new Set(surveys.map(s => s.accommodation).filter(Boolean)).size}</strong>Accommodations</div>
  `;
  renderPriorities(surveys);
  document.getElementById('surveyList').innerHTML = surveys.map(s => `
    <div class="survey-item">
      <strong>${s.btisNo}</strong><br>
      ${s.accommodation || '-'} / ${s.location || '-'}<br>
      Average: ${averageScore(s.ratings)}<br>
      <small>${new Date(s.createdAt).toLocaleString()}</small>
    </div>
  `).join('') || '<p class="hint">No surveys saved yet.</p>';
}

function renderPriorities(surveys) {
  const sums = {};
  const counts = {};
  ratingItems.forEach(i => { sums[i] = 0; counts[i] = 0; });
  surveys.forEach(s => ratingItems.forEach(i => {
    const v = Number(s.ratings?.[i] || 0);
    if (v > 0) { sums[i] += v; counts[i]++; }
  }));
  const rows = ratingItems.map(i => ({ item: i, avg: counts[i] ? sums[i] / counts[i] : 0, count: counts[i] }))
    .filter(r => r.count)
    .sort((a,b) => a.avg - b.avg)
    .slice(0, 5);
  document.getElementById('priorityList').innerHTML = rows.map(r => `
    <div class="priority-item"><strong>${r.item}</strong>: ${r.avg.toFixed(1)} average — improvement priority</div>
  `).join('') || '<p class="hint">No rating data yet.</p>';
}

function clearData() {
  if (!confirm('Clear all local BTIS survey data?')) return;
  localStorage.removeItem(storageKey);
  renderDashboard();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(loadSurveys(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'btis-surveys-v0-5.json';
  a.click();
  URL.revokeObjectURL(url);
}

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const status = document.getElementById('voiceStatus');
  if (!SpeechRecognition) {
    status.textContent = 'Voice input is not supported in this browser. Please type the summary.';
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.onresult = e => {
    let text = '';
    for (let i = e.resultIndex; i < e.results.length; i++) text += e.results[i][0].transcript;
    document.getElementById('voiceNote').value = text.trim();
  };
  recognition.onend = () => {
    document.getElementById('startVoice').disabled = false;
    document.getElementById('stopVoice').disabled = true;
    status.textContent = 'Voice input stopped.';
  };
  recognition.start();
  document.getElementById('startVoice').disabled = true;
  document.getElementById('stopVoice').disabled = false;
  status.textContent = 'Listening...';
}

function stopVoiceInput() {
  if (recognition) recognition.stop();
}

init();
