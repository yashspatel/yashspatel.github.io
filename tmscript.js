const scriptURL = 'https://script.google.com/macros/s/AKfycbyelfqMM0DHhQJNeBQ_6hOtXPvAl9Xbx-ahbfhDFCnfS7zMsG0VZweHUFEvc7t8dPmf/exec';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addEntryBtn').addEventListener('click', toggleForm);
  document.getElementById('entryForm').addEventListener('submit', submitForm);
  loadData();
});

function toggleForm() {
  const container = document.getElementById('form-container');
  container.classList.toggle('hidden');
}

async function submitForm(e) {
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
}
