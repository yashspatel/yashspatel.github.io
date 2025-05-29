const sheetURL = 'https://script.google.com/macros/s/AKfycbzoRExx8FgEmB5LbYqYi_W_qHq5sSEGCEc0HoEaGPVUNDSPbiNUdCrsi8gcrQhtkF3-/exec';

document.addEventListener('DOMContentLoaded', fetchCalendarData);

function fetchCalendarData() {
  fetch(sheetURL)
    .then(response => response.json())
    .then(data => renderCalendar(data))
    .catch(err => console.error('Error fetching data:', err));
}

function renderCalendar(entries) {
  const calendarBody = document.getElementById('calendarBody');
  calendarBody.innerHTML = '';

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hoursMap = { 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0 };

  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(dayDate.getDate() + i);
    const dateStr = dayDate.toISOString().split('T')[0];

    const dayEntries = entries.filter(e => e.Date === dateStr);
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    dayEntries.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'entry';
      div.textContent = `${entry.Signer} (${entry.Hours} hrs)`;
      cell.appendChild(div);
      hoursMap[days[i]] += parseFloat(entry.Hours || 0);
    });

    const totalDiv = document.createElement('div');
    totalDiv.className = 'total-hours';
    totalDiv.textContent = `${hoursMap[days[i]].toFixed(2)} hrs`;
    cell.appendChild(totalDiv);

    calendarBody.appendChild(cell);
  }
}
