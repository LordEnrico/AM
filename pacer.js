import { cases, getCase } from './data.js';

window.searchCases = function() {
  const circuit = document.getElementById('circuitSelect').value;
  const caseType = document.getElementById('caseTypeSelect').value;
  const caseNumber = document.getElementById('caseNumber').value;
  const dateFiled = document.getElementById('dateFiled').value;
  const partyName = document.getElementById('partyName').value.toLowerCase();

  const filteredCases = cases.filter(c => {
    if (circuit !== 'all' && c.circuit !== circuit) return false;
    if (caseType !== 'all' && !c.caseNumber.includes(caseType)) return false;
    if (caseNumber && !c.caseNumber.includes(caseNumber)) return false;
    if (dateFiled && c.filingDate !== dateFiled) return false;
    if (partyName && !c.title.toLowerCase().includes(partyName)) return false;
    return true;
  });

  displayResults(filteredCases);
};

function displayResults(results) {
  const table = document.getElementById('resultsTable');
  const tbody = document.getElementById('resultsBody');
  tbody.innerHTML = '';

  if (results.length === 0) {
    table.style.display = 'none';
    alert('No cases found matching your search criteria.');
    return;
  }

  results.forEach(c => {
    const row = tbody.insertRow();
    row.insertCell().textContent = c.caseNumber;
    row.insertCell().textContent = c.title;
    row.insertCell().textContent = c.filingDate;
    row.insertCell().textContent = c.type;
    row.insertCell().textContent = c.circuit;
    
    const actionsCell = row.insertCell();
    actionsCell.innerHTML = `
      <span class="view-link" onclick="window.viewPacerCase('${c.caseNumber}')">View Case</span>
    `;
  });

  table.style.display = 'table';
}

window.viewPacerCase = function(caseNumber) {
  const caseData = getCase(caseNumber);
  if (!caseData) return;

  const caseView = document.getElementById('caseView');
  caseView.style.display = 'block';
  document.getElementById('searchSection').style.display = 'none';

  caseView.innerHTML = `
    <button onclick="window.returnToSearch()" class="back-button">← Back to Search</button>
    <h3>Case Details: ${caseNumber}</h3>

    <div class="section">
      <h4>Case Information</h4>
      <table>
        <tr><td>Title:</td><td>${caseData.title}</td></tr>
        <tr><td>Filing Date:</td><td>${caseData.filingDate}</td></tr>
        <tr><td>Type:</td><td>${caseData.type}</td></tr>
        <tr><td>Status:</td><td>${caseData.status}</td></tr>
        <tr><td>Circuit:</td><td>${caseData.circuit}</td></tr>
        ${caseData.judgment ? `<tr><td>Judgment:</td><td>${caseData.judgment.type} - ${caseData.judgment.text}</td></tr>` : ''}
      </table>
    </div>

    <div class="section">
      <h4>Docket Entries</h4>
      ${generateDocketTable(caseData.docketEntries)}
    </div>

    <div class="section">
      <h4>Hearings</h4>
      ${generateHearingsTable(caseData.hearings)}
    </div>

    ${caseData.defendant && caseData.defendant.name ? `
    <div class="section">
      <h4>Defendant Information</h4>
      <table>
        <tr><td>Name:</td><td>${caseData.defendant.name}</td></tr>
        <tr><td>Attorney:</td><td>${caseData.defendant.attorney || 'Not specified'}</td></tr>
      </table>
    </div>
    ` : ''}
  `;
};

window.returnToSearch = function() {
  document.getElementById('caseView').style.display = 'none';
  document.getElementById('searchSection').style.display = 'block';
};

function generateDocketTable(entries) {
  if (!entries || entries.length === 0) {
    return '<p>No docket entries found.</p>';
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${entries.map(entry => `
          <tr>
            <td>${entry.date}</td>
            <td>${entry.description}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function generateHearingsTable(hearings) {
  if (!hearings || hearings.length === 0) {
    return '<p>No hearings scheduled.</p>';
  }

  return `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        ${hearings.map(hearing => `
          <tr>
            <td>${hearing.date}</td>
            <td>${hearing.description}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}