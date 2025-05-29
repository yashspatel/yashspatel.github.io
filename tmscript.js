const sheetURL = 'https://script.google.com/macros/s/AKfycbzoRExx8FgEmB5LbYqYi_W_qHq5sSEGCEc0HoEaGPVUNDSPbiNUdCrsi8gcrQhtkF3-/exec';

function fetchEntries() {
  fetch(sheetURL)
    .then(res => res.json())
    .then(data => renderCalendar(data))
    .catch(err => console.error('Error fetching:', err));
}

function renderCalendar(entries) {
  const wrapper = document.getElementById('calendarWrapper');
  wrapper.innerHTML = '';

  const groupedByWeek = {};

  entries.forEach(e => {
    const date = new Date(e.Date);
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    const weekKey = monday.toISOString().split('T')[0];

    if (!groupedByWeek[weekKey]) groupedByWeek[weekKey] = [];
    groupedByWeek[weekKey].push({ ...e, parsedDate: date });
  });

  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  Object.entries(groupedByWeek).forEach(([weekStart, weekEntries]) => {
    const hoursMap = {};
    days.forEach(d => hoursMap[d] = 0);

    const row = document.createElement('div');
    row.className = 'week-row';

    days.forEach((day, i) => {
      const cell = document.createElement('div');
      cell.className = 'day';
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];

      const dayEntries = weekEntries.filter(e => e.Date === dateStr);

      cell.innerHTML = `<div class='header'>${day}</div>`;
      dayEntries.forEach(e => {
        cell.innerHTML += `<div>${e.Signer} (${e.Hours})</div>`;
        hoursMap[day] += parseFloat(e.Hours || 0);
      });

      row.appendChild(cell);
    });

    const total = Object.values(hoursMap).reduce((a, b) => a + b, 0);
    const totalCell = document.createElement('div');
    totalCell.className = 'total';
    totalCell.innerHTML = `${total.toFixed(2)} hrs<br>(Weekly Total)`;

    row.appendChild(totalCell);
    wrapper.appendChild(row);
  });
}

function submitEntry() {
  const signer = document.getElementById('signer').value;
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;

  if (!signer || !start || !end) return alert('Please fill all fields');

  const today = new Date().toISOString().split('T')[0];

  const body = new URLSearchParams();
  body.append('date', today);
  body.append('signer', signer);
  body.append('start', start);
  body.append('end', end);

  fetch(sheetURL, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .then(res => res.text())
    .then(() => {
      document.getElementById('entryModal').classList.remove('show');
      fetchEntries();
    })
    .catch(err => alert('Failed to save entry'));
}

fetchEntries();
