import { 
  getCase, 
  createDocketEntry,  
  addHearing, 
  addFeeRecord,
  updateDefendant,
  updateBond,
  updateJury,
  updateCaseStatus as updateStatus,
  enterJudgmentRecord
} from './data.js';
import { currentUser } from './auth.js';

// Helper function to generate docket table
function generateDocketTable(docketEntries) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  thead.innerHTML = `
    <tr>
      <th>Date</th>
      <th>Description</th>
    </tr>
  `;

  docketEntries.forEach(entry => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.description}</td>
    `;
    tbody.appendChild(row);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  return table.outerHTML;
}

// Helper function to generate hearings table
function generateHearingsTable(hearings) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  thead.innerHTML = `
    <tr>
      <th>Date</th>
      <th>Description</th>
    </tr>
  `;

  hearings.forEach(hearing => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${hearing.date}</td>
      <td>${hearing.description}</td>
    `;
    tbody.appendChild(row);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  return table.outerHTML;
}

function showEditModal(title, content) {
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.innerHTML = `
    <h3>${title}</h3>
    <div class="modal-body">${content}</div>
    <div class="modal-buttons">
      <button type="button" onclick="document.querySelector('.modal-overlay').remove()">Cancel</button>
    </div>
  `;
  
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);
  
  return modalContent;
}

export function addDocketEntry(caseNumber) {
  const modal = showEditModal('Add Docket Entry', `
    <form id="docketEntryForm" class="edit-form">
      <div class="form-group">
        <label>Date:</label>
        <input type="date" name="date" value="${new Date().toISOString().split('T')[0]}" required>
      </div>
      <div class="form-group">
        <label>Description:</label>
        <textarea name="description" rows="4" required></textarea>
      </div>
      <button type="submit">Add Entry</button>
    </form>
  `);

  modal.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const entry = {
      date: form.querySelector('[name="date"]').value,
      description: form.querySelector('[name="description"]').value,
      judge: currentUser.name
    };
    
    if (createDocketEntry(caseNumber, entry)) {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    }
  };
}

export function scheduleHearing(caseNumber) {
  const modal = showEditModal('Schedule Hearing', `
    <form id="hearingForm" class="edit-form">
      <div class="form-group">
        <label>Date:</label>
        <input type="date" name="date" required>
      </div>
      <div class="form-group">
        <label>Time:</label>
        <input type="time" name="time" required>
      </div>
      <div class="form-group">
        <label>Type:</label>
        <select name="type" required>
          <option value="Initial">Initial Hearing</option>
          <option value="Status">Status Conference</option>
          <option value="Motion">Motion Hearing</option>
          <option value="Trial">Trial</option>
          <option value="Sentencing">Sentencing</option>
        </select>
      </div>
      <div class="form-group">
        <label>Description:</label>
        <textarea name="description" rows="4" required></textarea>
      </div>
      <button type="submit">Schedule Hearing</button>
    </form>
  `);

  modal.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const hearing = {
      date: form.querySelector('[name="date"]').value,
      time: form.querySelector('[name="time"]').value,
      type: form.querySelector('[name="type"]').value,
      description: form.querySelector('[name="description"]').value,
      judge: currentUser.name,
      status: 'Scheduled'
    };
    
    if (addHearing(caseNumber, hearing)) {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    }
  };
}

export function addFee(caseNumber) {
  const modal = showEditModal('Add Fee/Assessment', `
    <form id="feeForm" class="edit-form">
      <div class="form-group">
        <label>Fee Type:</label>
        <select name="type" required>
          <option value="Filing">Filing Fee</option>
          <option value="Service">Service Fee</option>
          <option value="Motion">Motion Fee</option>
          <option value="Appeal">Appeal Fee</option>
          <option value="Transcript">Transcript Fee</option>
          <option value="Other">Other Fee</option>
        </select>
      </div>
      <div class="form-group">
        <label>Amount:</label>
        <input type="number" name="amount" min="0" step="0.01" required>
      </div>
      <div class="form-group">
        <label>Due Date:</label>
        <input type="date" name="dueDate" required>
      </div>
      <button type="submit">Add Fee</button>
    </form>
  `);

  modal.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const fee = {
      type: form.querySelector('[name="type"]').value,
      amount: parseFloat(form.querySelector('[name="amount"]').value),
      dueDate: form.querySelector('[name="dueDate"]').value,
      status: 'Pending',
      judge: currentUser.name,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    
    if (addFeeRecord(caseNumber, fee)) {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    }
  };
}

export function editDefendantInfo(caseNumber) {
  const caseData = getCase(caseNumber);
  const defendant = caseData.defendant || {};
  
  const modal = showEditModal('Edit Defendant Information', `
    <form id="defendantForm" class="edit-form">
      <div class="form-group">
        <label>Name:</label>
        <input type="text" name="name" value="${defendant.name || ''}" required>
      </div>
      <div class="form-group">
        <label>Address:</label>
        <textarea name="address" rows="2" required>${defendant.address || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Phone:</label>
        <input type="tel" name="phone" value="${defendant.phone || ''}" pattern="[0-9-()+ ]*">
      </div>
      <div class="form-group">
        <label>Attorney:</label>
        <input type="text" name="attorney" value="${defendant.attorney || ''}">
      </div>
      <div class="form-group">
        <label>DOB:</label>
        <input type="date" name="dob" value="${defendant.dob || ''}">
      </div>
      <button type="submit">Update Defendant Information</button>
    </form>
  `);

  modal.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const defendantInfo = {
      name: form.querySelector('[name="name"]').value,
      address: form.querySelector('[name="address"]').value,
      phone: form.querySelector('[name="phone"]').value,
      attorney: form.querySelector('[name="attorney"]').value,
      dob: form.querySelector('[name="dob"]').value
    };
    
    if (updateDefendant(caseNumber, defendantInfo)) {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    }
  };
}

export function editBondInfo(caseNumber) {
  const caseData = getCase(caseNumber);
  const bond = caseData.bond || {};
  
  const modal = showEditModal('Edit Bond Information', `
    <form id="bondForm" class="edit-form">
      <div class="form-group">
        <label>Bond Type:</label>
        <select name="type" required>
          <option value="Cash" ${bond.type === 'Cash' ? 'selected' : ''}>Cash Bond</option>
          <option value="Surety" ${bond.type === 'Surety' ? 'selected' : ''}>Surety Bond</option>
          <option value="Property" ${bond.type === 'Property' ? 'selected' : ''}>Property Bond</option>
          <option value="Personal" ${bond.type === 'Personal' ? 'selected' : ''}>Personal Recognizance</option>
        </select>
      </div>
      <div class="form-group">
        <label>Amount:</label>
        <input type="number" name="amount" value="${bond.amount || ''}" min="0" step="0.01" required>
      </div>
      <div class="form-group">
        <label>Conditions:</label>
        <textarea name="conditions" rows="4">${bond.conditions?.join('\n') || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Status:</label>
        <select name="status" required>
          <option value="Posted" ${bond.status === 'Posted' ? 'selected' : ''}>Posted</option>
          <option value="Pending" ${bond.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Released" ${bond.status === 'Released' ? 'selected' : ''}>Released</option>
          <option value="Forfeited" ${bond.status === 'Forfeited' ? 'selected' : ''}>Forfeited</option>
        </select>
      </div>
      <button type="submit">Update Bond Information</button>
    </form>
  `);

  modal.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const bondInfo = {
      type: form.querySelector('[name="type"]').value,
      amount: parseFloat(form.querySelector('[name="amount"]').value),
      conditions: form.querySelector('[name="conditions"]').value.split('\n').filter(c => c.trim()),
      status: form.querySelector('[name="status"]').value
    };
    
    if (updateBond(caseNumber, bondInfo)) {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    }
  };
}

export function editJuryInfo(caseNumber) {
  const caseData = getCase(caseNumber);
  const jury = caseData.jury || {};
  
  const modal = showEditModal('Edit Jury Information', `
    <form id="juryForm" class="edit-form">
      <div class="form-group">
        <label>Jury Type:</label>
        <select name="type" required>
          <option value="Petit" ${jury.type === 'Petit' ? 'selected' : ''}>Petit Jury</option>
          <option value="Grand" ${jury.type === 'Grand' ? 'selected' : ''}>Grand Jury</option>
        </select>
      </div>
      <div class="form-group">
        <label>Size:</label>
        <input type="number" name="size" value="${jury.size || '12'}" min="6" max="23" required>
      </div>
      <div class="form-group">
        <label>Selection Date:</label>
        <input type="date" name="selectionDate" value="${jury.selectionDate || ''}" required>
      </div>
      <div class="form-group">
        <label>Status:</label>
        <select name="status" required>
          <option value="Pending" ${jury.status === 'Pending' ? 'selected' : ''}>Pending Selection</option>
          <option value="Selected" ${jury.status === 'Selected' ? 'selected' : ''}>Selected</option>
          <option value="Sworn" ${jury.status === 'Sworn' ? 'selected' : ''}>Sworn</option>
          <option value="Dismissed" ${jury.status === 'Dismissed' ? 'selected' : ''}>Dismissed</option>
        </select>
      </div>
      <div class="form-group">
        <label>Notes:</label>
        <textarea name="notes" rows="4">${jury.notes || ''}</textarea>
      </div>
      <button type="submit">Update Jury Information</button>
    </form>
  `);

  modal.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const juryInfo = {
      type: form.querySelector('[name="type"]').value,
      size: parseInt(form.querySelector('[name="size"]').value),
      selectionDate: form.querySelector('[name="selectionDate"]').value,
      status: form.querySelector('[name="status"]').value,
      notes: form.querySelector('[name="notes"]').value
    };
    
    if (updateJury(caseNumber, juryInfo)) {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    }
  };
}

export function viewCase(caseNumber) {
  const caseData = getCase(caseNumber);
  if (!caseData) return;

  document.getElementById('docketView').style.display = 'none';
  document.getElementById('caseDetailView').style.display = 'block';
  document.getElementById('detailCaseNumber').textContent = caseNumber;
  document.getElementById('caseStatusSelect').value = caseData.status || 'Active';

  loadCaseDetails(caseData);
}

export function updateCaseStatus(caseNumber, newStatus) {
  if (updateStatus(caseNumber, newStatus, currentUser.name)) {
    viewCase(caseNumber); // Refresh the view
  }
}

export function enterJudgment(caseNumber) {
  const modal = showEditModal('Enter Judgment', `
    <form id="judgmentForm" class="edit-form">
      <div class="form-group">
        <label>Judgment Type:</label>
        <select name="type" required>
          <option value="default">Default Judgment</option>
          <option value="summary">Summary Judgment</option>
          <option value="consent">Consent Judgment</option>
          <option value="dismissal">Dismissal with Prejudice</option>
          <option value="dismissal-without">Dismissal without Prejudice</option>
          <option value="verdict">Verdict</option>
        </select>
      </div>
      <div class="form-group">
        <label>Judgment Text:</label>
        <textarea name="text" required rows="4"></textarea>
      </div>
    </form>
  `);

  modal.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const judgment = {
      type: form.querySelector('[name="type"]').value,
      text: form.querySelector('[name="text"]').value,
      date: new Date().toISOString().split('T')[0],
      judge: currentUser.name
    };
    
    if (enterJudgmentRecord(caseNumber, judgment)) {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    }
  };
}

export function initiateAppeal(caseNumber) {
  const caseData = getCase(caseNumber);
  if (!caseData) return false;

  const modal = showEditModal('Initiate Appeal', `
    <form id="appealForm" class="edit-form">
      <div class="form-group">
        <label>Appeal Type:</label>
        <select name="appealType" required>
          <option value="GA">General Appeals Court</option>
          <option value="GJ">Grand Judiciary</option>
        </select>
      </div>
      <div class="form-group">
        <label>Grounds for Appeal:</label>
        <textarea name="grounds" rows="4" required></textarea>
      </div>
      <button type="submit">Submit Appeal</button>
    </form>
  `);

  modal.querySelector('form').onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    
    const appealInfo = {
      type: form.querySelector('[name="appealType"]').value,
      grounds: form.querySelector('[name="grounds"]').value,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      judge: currentUser.name
    };

    // Create docket entry for appeal
    createDocketEntry(caseNumber, {
      date: appealInfo.date,
      description: `Appeal initiated to ${appealInfo.type === 'GA' ? 'General Appeals Court' : 'Grand Judiciary'}\nGrounds: ${appealInfo.grounds}`,
      judge: appealInfo.judge
    });

    // Update case status
    updateStatus(caseNumber, 'On Appeal', currentUser.name);

    document.querySelector('.modal-overlay').remove();
    viewCase(caseNumber); // Refresh the view
  };
}

function loadCaseDetails(caseData) {
  // Load docket entries
  const docketEntries = document.getElementById('docketEntries');
  docketEntries.innerHTML = generateDocketTable(caseData.docketEntries || []);

  // Load hearings
  const hearingsList = document.getElementById('hearingsList');
  hearingsList.innerHTML = generateHearingsTable(caseData.hearings || []);

  // Load fees
  const feesList = document.getElementById('feesList');
  feesList.innerHTML = generateFeesTable(caseData.fees || []);

  // Load defendant info
  const defendantInfo = document.getElementById('defendantInfo');
  defendantInfo.innerHTML = generateDefendantInfo(caseData.defendant || {});

  // Load bond info 
  const bondInfo = document.getElementById('bondInfo');
  bondInfo.innerHTML = generateBondInfo(caseData.bond || {});

  // Load jury info
  const juryInfo = document.getElementById('juryInfo');
  juryInfo.innerHTML = generateJuryInfo(caseData.jury || {});
}

// Helper function to generate fees table
function generateFeesTable(fees) {
  if (!fees.length) {
    return '<p>No fees recorded.</p>';
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Added By</th>
        </tr>
      </thead>
      <tbody>
        ${fees.map(fee => `
          <tr>
            <td>${fee.type}</td>
            <td>$${fee.amount}</td>
            <td>${fee.status || 'Pending'}</td>
            <td>${fee.judge}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// Helper function to generate defendant info
function generateDefendantInfo(defendant) {
  if (!defendant.name) {
    return '<p>No defendant information recorded.</p>';
  }

  return `
    <table>
      <tr><td>Name:</td><td>${defendant.name}</td></tr>
      <tr><td>Address:</td><td>${defendant.address}</td></tr>
      ${defendant.phone ? `<tr><td>Phone:</td><td>${defendant.phone}</td></tr>` : ''}
      ${defendant.attorney ? `<tr><td>Attorney:</td><td>${defendant.attorney}</td></tr>` : ''}
      ${defendant.dob ? `<tr><td>DOB:</td><td>${defendant.dob}</td></tr>` : ''}
    </table>
  `;
}

// Helper function to generate bond info
function generateBondInfo(bond) {
  if (!bond.type) {
    return '<p>No bond information recorded.</p>';
  }

  return `
    <table>
      <tr><td>Type:</td><td>${bond.type}</td></tr>
      <tr><td>Amount:</td><td>$${bond.amount}</td></tr>
      <tr><td>Status:</td><td>${bond.status || 'Active'}</td></tr>
      ${bond.conditions ? `<tr><td>Conditions:</td><td>${bond.conditions.join('<br>')}</td></tr>` : ''}
    </table>
  `;
}

// Helper function to generate jury info
function generateJuryInfo(jury) {
  if (!jury.type) {
    return '<p>No jury information recorded.</p>';
  }

  return `
    <table>
      <tr><td>Type:</td><td>${jury.type}</td></tr>
      <tr><td>Size:</td><td>${jury.size}</td></tr>
      <tr><td>Selection Date:</td><td>${jury.selectionDate}</td></tr>
      <tr><td>Status:</td><td>${jury.status}</td></tr>
      ${jury.notes ? `<tr><td>Notes:</td><td>${jury.notes}</td></tr>` : ''}
    </table>
  `;
}