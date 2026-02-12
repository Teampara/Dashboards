const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const analyzeBtn = document.getElementById('analyzeBtn');
const sheetSelect = document.getElementById('sheetSelect');
const messages = document.getElementById('messages');
const previewTable = document.getElementById('previewTable');
const kpiCards = document.getElementById('kpiCards');

let workbook = null;
let parsedRows = [];
let charts = {};

const positiveWords = ['good', 'great', 'excellent', 'fast', 'happy', 'love', 'amazing', 'smooth'];
const negativeWords = ['bad', 'poor', 'late', 'slow', 'angry', 'hate', 'issue', 'problem'];

function showMessage(text, type = 'success') {
  messages.textContent = text;
  messages.className = `messages ${type}`;
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/)[0] || '';
  const candidates = [',', '\t', ';', '|'];
  let best = ',';
  let count = 0;
  for (const delimiter of candidates) {
    const c = (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
    if (c > count) {
      count = c;
      best = delimiter;
    }
  }
  return best;
}

function parseDelimited(text) {
  const delimiter = detectDelimiter(text);
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = lines[0].split(delimiter).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim());
    return headers.reduce((obj, key, idx) => {
      obj[key || `column_${idx + 1}`] = values[idx] ?? '';
      return obj;
    }, {});
  });
}

function tryParseNumber(value) {
  if (value === null || value === undefined) return null;
  const num = Number(String(value).replace(/[$,%\s,]/g, ''));
  return Number.isFinite(num) ? num : null;
}

function findColumn(rows, hintRegex) {
  if (!rows.length) return null;
  const keys = Object.keys(rows[0]);
  return keys.find((key) => hintRegex.test(key.toLowerCase())) || null;
}

function renderPreview(rows) {
  if (!rows.length) {
    previewTable.innerHTML = '<em>No rows to preview.</em>';
    return;
  }
  const keys = Object.keys(rows[0]);
  const sample = rows.slice(0, 10);
  const header = `<tr>${keys.map((k) => `<th>${k}</th>`).join('')}</tr>`;
  const body = sample
    .map((row) => `<tr>${keys.map((k) => `<td>${row[k] ?? ''}</td>`).join('')}</tr>`)
    .join('');
  previewTable.innerHTML = `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
}

function renderKPIs(rows) {
  const amountCol = findColumn(rows, /amount|revenue|sale|total|price|value/);
  const customerCol = findColumn(rows, /customer|client|account/);
  const invoiceCol = findColumn(rows, /invoice|order|transaction|id/);

  const amounts = amountCol ? rows.map((r) => tryParseNumber(r[amountCol])).filter((n) => n !== null) : [];
  const totalAmount = amounts.reduce((sum, n) => sum + n, 0);
  const uniqueCustomers = customerCol ? new Set(rows.map((r) => r[customerCol])).size : null;

  const cards = [
    { label: 'Rows Loaded', value: rows.length.toLocaleString() },
    { label: 'Total Value', value: amounts.length ? totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A' },
    { label: 'Avg Value', value: amounts.length ? (totalAmount / amounts.length).toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'N/A' },
    { label: 'Unique Customers', value: uniqueCustomers ?? 'N/A' },
    { label: 'Unique Orders', value: invoiceCol ? new Set(rows.map((r) => r[invoiceCol])).size : 'N/A' }
  ];

  kpiCards.innerHTML = cards
    .map((c) => `<article class="kpi"><span>${c.label}</span><strong>${c.value}</strong></article>`)
    .join('');
}

function buildCategoryCounts(rows, key) {
  const counts = new Map();
  for (const row of rows) {
    const value = row[key] || 'Unknown';
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
}

function buildTrend(rows, dateKey, amountKey) {
  const totals = new Map();
  for (const row of rows) {
    const d = new Date(row[dateKey]);
    if (Number.isNaN(d.getTime())) continue;
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const value = amountKey ? tryParseNumber(row[amountKey]) ?? 1 : 1;
    totals.set(label, (totals.get(label) || 0) + value);
  }
  return [...totals.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function analyzeSentiment(rows) {
  const textCol = findColumn(rows, /feedback|comment|message|review|note|description/);
  const out = { positive: 0, neutral: 0, negative: 0 };
  if (!textCol) return out;

  for (const row of rows) {
    const text = String(row[textCol] || '').toLowerCase();
    const pos = positiveWords.filter((w) => text.includes(w)).length;
    const neg = negativeWords.filter((w) => text.includes(w)).length;
    if (pos > neg) out.positive += 1;
    else if (neg > pos) out.negative += 1;
    else out.neutral += 1;
  }
  return out;
}

function resetCharts() {
  Object.values(charts).forEach((chart) => chart?.destroy());
  charts = {};
}

function renderCharts(rows) {
  resetCharts();

  const amountCol = findColumn(rows, /amount|revenue|sale|total|price|value/);
  const dateCol = findColumn(rows, /date|time|created|month/);
  const categoryCol = findColumn(rows, /category|product|region|segment|type|status/);

  const trend = dateCol ? buildTrend(rows, dateCol, amountCol) : [];
  charts.trend = new Chart(document.getElementById('trendChart'), {
    type: 'line',
    data: {
      labels: trend.map(([x]) => x),
      datasets: [{ label: amountCol ? 'Value' : 'Count', data: trend.map(([, y]) => y), borderColor: '#2d6cdf', backgroundColor: 'rgba(45,108,223,0.2)' }]
    },
    options: { responsive: true }
  });

  const categories = categoryCol ? buildCategoryCounts(rows, categoryCol) : [];
  charts.category = new Chart(document.getElementById('categoryChart'), {
    type: 'bar',
    data: {
      labels: categories.map(([x]) => x),
      datasets: [{ label: 'Records', data: categories.map(([, y]) => y), backgroundColor: '#12966f' }]
    },
    options: { responsive: true }
  });

  const numericCol = amountCol || Object.keys(rows[0] || {}).find((k) => rows.some((r) => tryParseNumber(r[k]) !== null));
  const values = numericCol ? rows.map((r) => tryParseNumber(r[numericCol])).filter((n) => n !== null) : [];
  const bins = [0, 0, 0, 0];
  if (values.length) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const step = (max - min || 1) / 4;
    values.forEach((v) => {
      const idx = Math.min(3, Math.floor((v - min) / step));
      bins[idx] += 1;
    });
  }
  charts.distribution = new Chart(document.getElementById('distributionChart'), {
    type: 'bar',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{ label: numericCol || 'Value Bands', data: bins, backgroundColor: '#cf7c00' }]
    },
    options: { responsive: true }
  });

  const sentiment = analyzeSentiment(rows);
  charts.sentiment = new Chart(document.getElementById('sentimentChart'), {
    type: 'pie',
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{ data: [sentiment.positive, sentiment.neutral, sentiment.negative], backgroundColor: ['#12966f', '#2d6cdf', '#cf4b4b'] }]
    },
    options: { responsive: true }
  });
}

async function handleFile(file) {
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  sheetSelect.innerHTML = '';
  sheetSelect.disabled = true;

  if (['xlsx', 'xls'].includes(ext)) {
    const buffer = await file.arrayBuffer();
    workbook = XLSX.read(buffer, { type: 'array' });
    workbook.SheetNames.forEach((name, idx) => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      if (idx === 0) option.selected = true;
      sheetSelect.appendChild(option);
    });
    sheetSelect.disabled = false;
    parsedRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetSelect.value], { defval: '' });
  } else {
    workbook = null;
    const text = await file.text();
    if (ext === 'json') {
      const parsed = JSON.parse(text);
      parsedRows = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      parsedRows = parseDelimited(text);
    }
  }

  if (!parsedRows.length) {
    showMessage('File loaded but no rows were detected. Please check the format.', 'warn');
    analyzeBtn.disabled = true;
    return;
  }

  analyzeBtn.disabled = false;
  showMessage(`Loaded ${parsedRows.length} rows from ${file.name}`);
  renderPreview(parsedRows);
}

sheetSelect.addEventListener('change', () => {
  if (!workbook) return;
  parsedRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetSelect.value], { defval: '' });
  renderPreview(parsedRows);
  showMessage(`Switched to sheet: ${sheetSelect.value}`);
});

fileInput.addEventListener('change', (event) => handleFile(event.target.files[0]));

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const [file] = e.dataTransfer.files;
  fileInput.files = e.dataTransfer.files;
  handleFile(file);
});

analyzeBtn.addEventListener('click', () => {
  if (!parsedRows.length) {
    showMessage('Please upload a file first.', 'warn');
    return;
  }
  renderKPIs(parsedRows);
  renderCharts(parsedRows);
  showMessage('Data analyzed. Charts and KPIs are ready.');
});
