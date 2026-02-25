// Fees-only interactions with persistence
(function () {
  const $ = (id) => document.getElementById(id);

  const STATE_KEY = 'samsFeesState';
  const defaultState = {
    term: 'Current Term',
    lineItems: [
      { label: 'Tuition', amount: 2500 },
      { label: 'Lab', amount: 200 },
      { label: 'Library', amount: 50 },
    ],
    dueDate: '2026-03-15',
    paid: 0,
    uploads: [] // {name, size, type, ts}
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return { ...defaultState };
      const parsed = JSON.parse(raw);
      // basic shape check
      if (!parsed || !Array.isArray(parsed.lineItems)) return { ...defaultState };
      return { ...defaultState, ...parsed };
    } catch {
      return { ...defaultState };
    }
  }
  function saveState(s) { localStorage.setItem(STATE_KEY, JSON.stringify(s)); }

  let state = loadState();

  // Elements
  const totalPayableEl = $('totalPayable');
  const amountPaidEl = $('amountPaid');
  const balanceEl = $('balance');
  const dueDateEl = $('dueDate');
  const termSummaryEl = $('termSummary');
  const statusPill = $('statusPill');
  const amountInput = $('amount');
  const depositBtn = $('depositBtn');
  const refundBtn = $('refundBtn');
  const receiptBtn = $('receiptBtn');
  const previewBtn = $('previewBtn');
  const downloadInvoiceBtn = $('downloadInvoiceBtn');
  const invoiceModal = $('invoiceModal');
  const invoiceContent = $('invoiceContent');
  const closeModalBtn = $('closeModalBtn');
  const feeStatus = $('feeStatus');
  const uploadInput = $('uploadInput');
  const uploadList = $('uploadList');
  const yearEl = $('year');
  const txnList = $('txnList');

  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  function formatCurrency(v) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  }

  function computeTotal() { return state.lineItems.reduce((a, b) => a + (b.amount || 0), 0); }
  function computeBalance() { return Math.max(0, computeTotal() - state.paid); }
  function computeOverpay() { return Math.max(0, state.paid - computeTotal()); }

  function updateStatusPill() {
    const bal = computeBalance();
    const over = computeOverpay();
    if (over > 0) { statusPill.textContent = 'Overpaid'; statusPill.className = 'status status--green'; return; }
    if (bal === 0) { statusPill.textContent = 'Cleared'; statusPill.className = 'status status--green'; return; }
    // partially paid vs nothing paid
    if (state.paid > 0) {
      statusPill.textContent = 'Balance Due';
      statusPill.className = 'status status--orange';
      return;
    }
    statusPill.textContent = 'Balance Due';
    statusPill.className = 'status status--ok';
  }

  function renderUploads() {
    uploadList.innerHTML = '';
    if (!state.uploads.length) return;
    state.uploads.slice().reverse().forEach((u, idx) => {
      const li = document.createElement('li');
      const left = document.createElement('div');
      left.innerHTML = `${u.name} <span class="meta">(${Math.round(u.size/1024)} KB • ${u.type || 'file'})</span>`;
      const right = document.createElement('div');
      const a = document.createElement('a');
      a.href = u.blobUrl; a.download = u.name; a.textContent = 'Download';
      const rm = document.createElement('button');
      rm.className = 'btn btn--ghost'; rm.textContent = 'Remove';
      rm.addEventListener('click', () => {
        // revoke object URL and remove
        try { URL.revokeObjectURL(u.blobUrl); } catch {}
        state.uploads.splice(state.uploads.findIndex(x => x.ts === u.ts), 1);
        saveState(state); renderUploads();
      });
      right.append(a, rm);
      li.append(left, right);
      uploadList.appendChild(li);
    });
  }

  function render() {
    const total = computeTotal();
    const bal = computeBalance();
    const over = computeOverpay();

    totalPayableEl.textContent = formatCurrency(total);
    amountPaidEl.textContent = formatCurrency(state.paid);
    balanceEl.textContent = over > 0 ? `${formatCurrency(0)} (overpay ${formatCurrency(over)})` : formatCurrency(bal);
    dueDateEl.textContent = state.dueDate;
    termSummaryEl.textContent = state.lineItems.map(li => `${li.label}: ${formatCurrency(li.amount)}`).join(' · ');

    updateStatusPill();
    renderUploads();
    renderTxns();
  }

  function setStatus(msg, type = 'info') {
    feeStatus.textContent = msg;
    feeStatus.style.color = type === 'error' ? '#ffb3b3' : 'var(--accent-2)';
  }

  function downloadText(filename, lines) {
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }

  function addTxn(kind, amount) {
    if (!state.txns) state.txns = [];
    state.txns.push({ kind, amount, ts: Date.now() });
  }

  function renderTxns() {
    if (!txnList) return;
    txnList.innerHTML = '';
    const list = (state.txns || []).slice().reverse();
    if (!list.length) {
      const li = document.createElement('li');
      li.textContent = 'No transactions yet.';
      txnList.appendChild(li);
      return;
    }
    list.forEach(t => {
      const li = document.createElement('li');
      const left = document.createElement('div');
      const colorDot = document.createElement('span');
      colorDot.style.display = 'inline-block';
      colorDot.style.width = '8px';
      colorDot.style.height = '8px';
      colorDot.style.borderRadius = '999px';
      colorDot.style.marginRight = '8px';
      colorDot.style.background = t.kind === 'deposit' ? 'var(--accent-2)' : 'var(--accent-red)';
      left.append(colorDot, document.createTextNode(`${t.kind === 'deposit' ? 'Deposit' : 'Refund'} — ${formatCurrency(t.amount)}`));
      const right = document.createElement('div');
      right.className = 'meta';
      right.textContent = new Date(t.ts).toLocaleString();
      li.append(left, right);
      txnList.appendChild(li);
    });
  }

  function buildInvoiceHTML() {
    // Assign colors to line items by label keywords
    const colorFor = (label) => {
      const l = String(label).toLowerCase();
      if (l.includes('tuition')) return 'var(--accent-2)';
      if (l.includes('lab')) return 'var(--accent-green)';
      if (l.includes('library')) return 'var(--accent-orange)';
      return 'var(--accent)';
    };
    const itemRows = state.lineItems.map(li => `
      <div class="row">
        <span><span style="display:inline-block;width:8px;height:8px;border-radius:999px;background:${colorFor(li.label)};margin-right:8px"></span>${li.label}</span>
        <strong>${formatCurrency(li.amount)}</strong>
      </div>`);

    const lines = [
      `<div class="row"><strong>Student</strong><span>Makos Tech</span></div>`,
      `<div class="row"><strong>Program</strong><span>BSc. Computer Science</span></div>`,
      `<div class="row"><strong>Term</strong><span>${state.term}</span></div>`,
      `<div class="row"><strong>Date</strong><span>${new Date().toLocaleDateString()}</span></div>`,
      `<h4>Items</h4>`,
      ...itemRows,
      `<div class="row"><span>Total</span><strong>${formatCurrency(computeTotal())}</strong></div>`,
      `<div class="row"><span>Paid</span><strong>${formatCurrency(state.paid)}</strong></div>`,
      `<div class="row"><span>Balance</span><strong>${formatCurrency(computeBalance())}</strong></div>`,
      `<div class="row"><span>Due date</span><strong>${state.dueDate}</strong></div>`
    ];
    return lines.join('');
  }

  function openModal() {
    invoiceContent.innerHTML = buildInvoiceHTML();
    invoiceModal.setAttribute('aria-hidden', 'false');
  }
  function closeModal() { invoiceModal.setAttribute('aria-hidden', 'true'); }

  // Actions
  if (depositBtn) {
    depositBtn.addEventListener('click', () => {
      const val = Number(amountInput.value);
      if (!Number.isFinite(val) || val <= 0) return setStatus('Enter a valid positive deposit amount.', 'error');
      state.paid += val;
      addTxn('deposit', val);
      amountInput.value = '';
      saveState(state);
      render();
      setStatus(`Deposit recorded: ${formatCurrency(val)}.`);
    });
  }

  if (refundBtn) {
    refundBtn.addEventListener('click', () => {
      const val = Number(amountInput.value);
      if (!Number.isFinite(val) || val <= 0) return setStatus('Enter a valid positive refund amount.', 'error');
      if (val > state.paid) return setStatus('Refund exceeds total paid. Reduce amount.', 'error');
      state.paid -= val;
      addTxn('refund', val);
      amountInput.value = '';
      saveState(state);
      render();
      setStatus(`Refund processed: ${formatCurrency(val)}.`);
    });
  }

  if (receiptBtn) {
    receiptBtn.addEventListener('click', () => {
      const lines = [
        '--- Payment Receipt ---',
        `Student: Makos Tech`,
        `Program: BSc. Computer Science`,
        `Term: ${state.term}`,
        `Date: ${new Date().toLocaleString()}`,
        `Paid to date: ${formatCurrency(state.paid)}`,
        `Total charges: ${formatCurrency(computeTotal())}`,
        `Balance: ${formatCurrency(computeBalance())}`,
        'Status: Generated (demo)'
      ];
      downloadText('receipt.txt', lines);
      setStatus('Receipt downloaded.');
    });
  }

  if (previewBtn) {
    previewBtn.addEventListener('click', () => openModal());
  }
  if (downloadInvoiceBtn) {
    downloadInvoiceBtn.addEventListener('click', () => {
      const lines = [
        '--- Invoice ---',
        `Student: Makos Tech`,
        `Program: BSc. Computer Science`,
        `Term: ${state.term}`,
        `Date: ${new Date().toLocaleDateString()}`,
        'Items:',
        ...state.lineItems.map(li => `  - ${li.label}: ${formatCurrency(li.amount)}`),
        `Total: ${formatCurrency(computeTotal())}`,
        `Amount paid: ${formatCurrency(state.paid)}`,
        `Balance: ${formatCurrency(computeBalance())}`,
        `Due date: ${state.dueDate}`
      ];
      downloadText('invoice.txt', lines);
      setStatus('Invoice downloaded.');
      closeModal();
    });
  }
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (invoiceModal) invoiceModal.addEventListener('click', (e) => {
    if (e.target.matches('[data-action="close-modal"]')) closeModal();
  });

  if (uploadInput) {
    uploadInput.addEventListener('change', () => {
      const files = Array.from(uploadInput.files || []);
      if (!files.length) return;
      files.forEach((f) => {
        const blobUrl = URL.createObjectURL(f);
        state.uploads.push({ name: f.name, size: f.size, type: f.type, ts: Date.now() + Math.random(), blobUrl });
      });
      saveState(state);
      renderUploads();
      uploadInput.value = '';
      setStatus('Receipt(s) uploaded.');
    });
  }

  render();
})();
