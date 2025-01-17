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
    
    fetch(`/api/cases/${caseNumber}/docketEntries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(entry)
    })
    .then(response => response.json())
    .then(data => {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to add docket entry. Please try again.');
    });
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
    
    fetch(`/api/cases/${caseNumber}/hearings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(hearing)
    })
    .then(response => response.json())
    .then(data => {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to schedule hearing. Please try again.');
    });
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
    
    fetch(`/api/cases/${caseNumber}/fees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fee)
    })
    .then(response => response.json())
    .then(data => {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to add fee. Please try again.');
    });
  };
}

export function editDefendantInfo(caseNumber) {
  const caseData = getCase(caseNumber);
  if (!caseData) return;
  
  const modal = showEditModal('Edit Defendant Information', `
    <form id="defendantForm" class="edit-form">
      <div class="form-group">
        <label>Name:</label>
        <input type="text" name="name" value="${caseData.defendant?.name || ''}" required>
      </div>
      <div class="form-group">
        <label>Address:</label>
        <textarea name="address" rows="2" required>${caseData.defendant?.address || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Phone:</label>
        <input type="tel" name="phone" value="${caseData.defendant?.phone || ''}" pattern="[0-9-()+ ]*">
      </div>
      <div class="form-group">
        <label>Attorney:</label>
        <input type="text" name="attorney" value="${caseData.defendant?.attorney || ''}">
      </div>
      <div class="form-group">
        <label>DOB:</label>
        <input type="date" name="dob" value="${caseData.defendant?.dob || ''}">
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
    
    fetch(`/api/cases/${caseNumber}/defendant`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(defendantInfo)
    })
    .then(response => response.json())
    .then(data => {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to update defendant information. Please try again.');
    });
  };
}

export function editBondInfo(caseNumber) {
  const caseData = getCase(caseNumber);
  if (!caseData) return;
  
  const modal = showEditModal('Edit Bond Information', `
    <form id="bondForm" class="edit-form">
      <div class="form-group">
        <label>Bond Type:</label>
        <select name="type" required>
          <option value="Cash" ${caseData.bond?.type === 'Cash' ? 'selected' : ''}>Cash Bond</option>
          <option value="Surety" ${caseData.bond?.type === 'Surety' ? 'selected' : ''}>Surety Bond</option>
          <option value="Property" ${caseData.bond?.type === 'Property' ? 'selected' : ''}>Property Bond</option>
          <option value="Personal" ${caseData.bond?.type === 'Personal' ? 'selected' : ''}>Personal Recognizance</option>
        </select>
      </div>
      <div class="form-group">
        <label>Amount:</label>
        <input type="number" name="amount" value="${caseData.bond?.amount || ''}" min="0" step="0.01" required>
      </div>
      <div class="form-group">
        <label>Conditions:</label>
        <textarea name="conditions" rows="4">${caseData.bond?.conditions?.join('\n') || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Status:</label>
        <select name="status" required>
          <option value="Posted" ${caseData.bond?.status === 'Posted' ? 'selected' : ''}>Posted</option>
          <option value="Pending" ${caseData.bond?.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Released" ${caseData.bond?.status === 'Released' ? 'selected' : ''}>Released</option>
          <option value="Forfeited" ${caseData.bond?.status === 'Forfeited' ? 'selected' : ''}>Forfeited</option>
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
    
    fetch(`/api/cases/${caseNumber}/bond`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bondInfo)
    })
    .then(response => response.json())
    .then(data => {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to update bond information. Please try again.');
    });
  };
}

export function editJuryInfo(caseNumber) {
  const caseData = getCase(caseNumber);
  if (!caseData) return;
  
  const modal = showEditModal('Edit Jury Information', `
    <form id="juryForm" class="edit-form">
      <div class="form-group">
        <label>Jury Type:</label>
        <select name="type" required>
          <option value="Petit" ${caseData.jury?.type === 'Petit' ? 'selected' : ''}>Petit Jury</option>
          <option value="Grand" ${caseData.jury?.type === 'Grand' ? 'selected' : ''}>Grand Jury</option>
        </select>
      </div>
      <div class="form-group">
        <label>Size:</label>
        <input type="number" name="size" value="${caseData.jury?.size || '12'}" min="6" max="23" required>
      </div>
      <div class="form-group">
        <label>Selection Date:</label>
        <input type="date" name="selectionDate" value="${caseData.jury?.selectionDate || ''}" required>
      </div>
      <div class="form-group">
        <label>Status:</label>
        <select name="status" required>
          <option value="Pending" ${caseData.jury?.status === 'Pending' ? 'selected' : ''}>Pending Selection</option>
          <option value="Selected" ${caseData.jury?.status === 'Selected' ? 'selected' : ''}>Selected</option>
          <option value="Sworn" ${caseData.jury?.status === 'Sworn' ? 'selected' : ''}>Sworn</option>
          <option value="Dismissed" ${caseData.jury?.status === 'Dismissed' ? 'selected' : ''}>Dismissed</option>
        </select>
      </div>
      <div class="form-group">
        <label>Notes:</label>
        <textarea name="notes" rows="4">${caseData.jury?.notes || ''}</textarea>
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
    
    fetch(`/api/cases/${caseNumber}/jury`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(juryInfo)
    })
    .then(response => response.json())
    .then(data => {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to update jury information. Please try again.');
    });
  };
}

export function viewCase(caseNumber) {
  fetch(`/api/cases/${caseNumber}`)
    .then(response => response.json())
    .then(caseData => {
      if (!caseData) return;

      document.getElementById('docketView').style.display = 'none';
      document.getElementById('caseDetailView').style.display = 'block';
      document.getElementById('detailCaseNumber').textContent = caseNumber;
      document.getElementById('caseStatusSelect').value = caseData.status || 'Active';

      loadCaseDetails(caseData);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to load case details. Please try again.');
    });
}

export function updateCaseStatus(caseNumber, newStatus) {
  fetch(`/api/cases/${caseNumber}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus, judge: currentUser.name })
  })
  .then(response => response.json())
  .then(data => {
    viewCase(caseNumber); // Refresh the view
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Failed to update case status. Please try again.');
  });
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
    
    fetch(`/api/cases/${caseNumber}/judgment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(judgment)
    })
    .then(response => response.json())
    .then(data => {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to enter judgment. Please try again.');
    });
  };
}

export function initiateAppeal(caseNumber) {
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

    fetch(`/api/cases/${caseNumber}/appeal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appealInfo)
    })
    .then(response => response.json())
    .then(data => {
      viewCase(caseNumber);
      document.querySelector('.modal-overlay').remove();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to initiate appeal. Please try again.');
    });
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

  // Load case timeline
  const caseTimeline = document.getElementById('caseTimeline');
  caseTimeline.innerHTML = generateCaseTimeline(caseData);

  // Load case tags
  const caseTags = document.getElementById('caseTags');
  caseTags.innerHTML = generateCaseTags(caseData.tags || []);

  // Load case notes
  const caseNotes = document.getElementById('caseNotes');
  caseNotes.innerHTML = generateCaseNotes(caseData.notes || []);

  // Load case documents
  const caseDocuments = document.getElementById('caseDocuments');
  caseDocuments.innerHTML = generateCaseDocuments(caseData.documents || []);
}

// Helper function to generate case timeline
function generateCaseTimeline(caseData) {
  const timeline = document.createElement('div');
  timeline.className = 'timeline';

  const events = [
    ...caseData.docketEntries.map(entry => ({
      date: entry.date,
      description: entry.description,
      type: 'Docket Entry'
    })),
    ...caseData.hearings.map(hearing => ({
      date: hearing.date,
      description: hearing.description,
      type: 'Hearing'
    })),
    ...caseData.fees.map(fee => ({
      date: fee.dateAdded,
      description: `Fee: ${fee.type} - $${fee.amount}`,
      type: 'Fee'
    }))
  ];

  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  events.forEach(event => {
    const eventElement = document.createElement('div');
    eventElement.className = 'timeline-event';
    eventElement.innerHTML = `
      <div class="timeline-date">${event.date}</div>
      <div class="timeline-description">${event.description}</div>
      <div class="timeline-type">${event.type}</div>
    `;
    timeline.appendChild(eventElement);
  });

  return timeline.outerHTML;
}

// Helper function to generate case tags
function generateCaseTags(tags) {
  if (!tags.length) {
    return '<p>No tags assigned.</p>';
  }

  return `
    <ul class="tags-list">
      ${tags.map(tag => `<li class="tag">${tag}</li>`).join('')}
    </ul>
  `;
}

// Helper function to generate case notes
function generateCaseNotes(notes) {
  if (!notes.length) {
    return '<p>No notes added.</p>';
  }

  return `
    <ul class="notes-list">
      ${notes.map(note => `
        <li class="note">
          <div class="note-date">${note.date}</div>
          <div class="note-text">${note.text}</div>
        </li>
      `).join('')}
    </ul>
  `;
}

// Helper function to generate case documents
function generateCaseDocuments(documents) {
  if (!documents.length) {
    return '<p>No documents uploaded.</p>';
  }

  return `
    <ul class="documents-list">
      ${documents.map(doc => `
        <li class="document">
          <a href="${doc.url}" target="_blank">${doc.name}</a>
          <div class="document-date">${doc.date}</div>
        </li>
      `).join('')}
    </ul>
  `;
}

export function printCase(caseNumber) {
  const caseData = getCase(caseNumber);
  if (!caseData) return;

  // Create print-friendly version
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Case ${caseNumber} - Print View</title>
      <style>
        @media screen, print {
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 2cm; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .section { margin: 20px 0; page-break-inside: avoid; }
          .section h3 { border-bottom: 1px solid #000; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #000; padding: 5px; text-align: left; }
          th { background-color: #f0f0f0; }
          .footer { text-align: center; margin-top: 20px; font-size: 10pt; }
          .no-print { display: none; }
          @media print {
            button { display: none; }
            a { text-decoration: none; color: black; }
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>JUDICIARY OF PENGINEERING</h1>
        <h2>Official Case Record</h2>
        <h3>Case Number: ${caseNumber}</h3>
        <p>Print Date: ${new Date().toLocaleString()}</p>
      </div>

      <div class="section">
        <h3>Case Information</h3>
        <table>
          <tr><td><strong>Title:</strong></td><td>${caseData.title}</td></tr>
          <tr><td><strong>Filing Date:</strong></td><td>${caseData.filingDate}</td></tr>
          <tr><td><strong>Type:</strong></td><td>${caseData.type}</td></tr>
          <tr><td><strong>Status:</strong></td><td>${caseData.status}</td></tr>
          <tr><td><strong>Circuit:</strong></td><td>${caseData.circuit}</td></tr>
        </table>
      </div>

      ${caseData.defendant?.name ? `
      <div class="section">
        <h3>Defendant Information</h3>
        <table>
          <tr><td><strong>Name:</strong></td><td>${caseData.defendant.name}</td></tr>
          ${caseData.defendant.address ? `<tr><td><strong>Address:</strong></td><td>${caseData.defendant.address}</td></tr>` : ''}
          ${caseData.defendant.phone ? `<tr><td><strong>Phone:</strong></td><td>${caseData.defendant.phone}</td></tr>` : ''}
          ${caseData.defendant.attorney ? `<tr><td><strong>Attorney:</strong></td><td>${caseData.defendant.attorney}</td></tr>` : ''}
        </table>
      </div>
      ` : ''}

      <div class="section">
        <h3>Docket Entries</h3>
        ${caseData.docketEntries?.length ? `
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Judge</th>
            </tr>
          </thead>
          <tbody>
            ${caseData.docketEntries.map(entry => `
              <tr>
                <td>${entry.date}</td>
                <td>${entry.description}</td>
                <td>${entry.judge}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : '<p>No docket entries found.</p>'}
      </div>

      ${caseData.hearings?.length ? `
      <div class="section">
        <h3>Hearings</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Type</th>
              <th>Description</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${caseData.hearings.map(h => `
              <tr>
                <td>${h.date}</td>
                <td>${h.time}</td>
                <td>${h.type}</td>
                <td>${h.description}</td>
                <td>${h.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${caseData.fees?.length ? `
      <div class="section">
        <h3>Fees and Assessments</h3>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${caseData.fees.map(f => `
              <tr>
                <td>${f.type}</td>
                <td>$${f.amount}</td>
                <td>${f.status}</td>
                <td>${f.dueDate}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      ${caseData.judgment ? `
      <div class="section">
        <h3>Judgment Information</h3>
        <table>
          <tr><td><strong>Type:</strong></td><td>${caseData.judgment.type}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${caseData.judgment.date}</td></tr>
          <tr><td><strong>Judge:</strong></td><td>${caseData.judgment.judge}</td></tr>
          <tr><td><strong>Text:</strong></td><td>${caseData.judgment.text}</td></tr>
        </table>
      </div>
      ` : ''}

      <div class="footer">
        <p>Official Court Record - Judiciary of Pengineering</p>
        <p>Generated from CM/ECF on ${new Date().toLocaleString()}</p>
      </div>

      <div class="no-print">
        <button onclick="window.print()">Print Case Record</button>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}
