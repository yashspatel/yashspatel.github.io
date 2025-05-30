const scriptURL = 'https://script.google.com/macros/s/AKfycbyelfqMM0DHhQJNeBQ_6hOtXPvAl9Xbx-ahbfhDFCnfS7zMsG0VZweHUFEvc7t8dPmf/exec';

document.getElementById('entryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = {
    date: form.date.value,
    signer: form.signer.value,
    start: form.start.value,
    end: form.end.value,
    hours: parseFloat(form.hours.value)
  };

  await fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify(formData)
  });

  form.reset();
  toggleForm();
  loadData();
});

function toggleForm() {
  const container = document.getElementById('form-container');
  container.classList.toggle('hidden');
}

async function loadData() {
  const res = await fetch(scriptURL + '?type=get');
  const data = await res.json();
  renderCalendar(data);
  renderWeeklySummary(data);
}

function renderCalendar(data) {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';

  const grouped = {};
  data.forEach(entry => {
    grouped[entry.Date] = (grouped[entry.Date] || 0) + parseFloat(entry['Total Hours']);
  });

  Object.entries(grouped).forEach(([date, hours]) => {
    const box = document.createElement('div');
    box.className = 'day-box';
    box.innerHTML = `<strong>${date}</strong><br/>${hours.toFixed(2)} hrs`;
    calendar.appendChild(box);
  });
}

function renderWeeklySummary(data) {
  const summary = document.getElementById('weekly-summary');
  const weeks = {};

  data.forEach(entry => {
    const d = new Date(entry.Date);
    const monday = new Date(d.setDate(d.getDate() - d.getDay() + 1));
    const weekKey = monday.toISOString().split('T')[0];
    weeks[weekKey] = (weeks[weekKey] || 0) + parseFloat(entry['Total Hours']);
  });

  summary.innerHTML = '<h3>Weekly Summary:</h3>' + Object.entries(weeks).map(([week, hours]) => `${week}: ${hours.toFixed(2)} hrs`).join('<br/>');
}

window.onload = loadData;
