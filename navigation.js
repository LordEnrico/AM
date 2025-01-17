import { currentUser } from './auth.js';

export function showDocket() {
  if (!currentUser) return;

  document.getElementById('docketView').style.display = 'block';
  document.getElementById('filingForm').style.display = 'none';

  const circuit = document.getElementById('circuitSelect').value;

  fetch('/api/cases')
    .then(response => response.json())
    .then(cases => {
      // Filter cases based on user permissions
      const filteredCases = cases.filter(c => {
        const circuitMatch = currentUser.circuits.includes('all') || currentUser.circuits.includes(c.circuit);
        const typeMatch = currentUser.types.includes('all') || currentUser.types.includes(c.type);
        return circuitMatch && typeMatch && (circuit === 'all' || c.circuit === circuit);
      });

      const tbody = document.getElementById('docketBody');
      tbody.innerHTML = '';

      filteredCases.forEach(c => {
        const row = tbody.insertRow();
        row.insertCell().textContent = c.caseNumber;
        row.insertCell().textContent = c.title;
        row.insertCell().textContent = c.filingDate;
        row.insertCell().textContent = c.type;
        row.insertCell().textContent = c.status;
        const actionsCell = row.insertCell();
        actionsCell.className = 'action-cell';
        actionsCell.innerHTML = `
          <span class="action-link" onclick="viewCase('${c.caseNumber}')">View</span>
        `;
      });
    })
    .catch(error => {
      console.error('Error fetching cases:', error);
      alert('Failed to load cases. Please try again.');
    });
}

export function showFilingForm() {
  if (!currentUser) return;

  document.getElementById('docketView').style.display = 'none';
  document.getElementById('filingForm').style.display = 'block';
}

export function showUtilities() {
  if (!currentUser) return;

  document.getElementById('docketView').style.display = 'none';
  document.getElementById('filingForm').style.display = 'none';
  document.getElementById('caseDetailView').style.display = 'none';
  document.getElementById('utilityView').style.display = 'block';
  document.getElementById('reportsView').style.display = 'none';

  const utilityContent = document.getElementById('utilityContent');
  utilityContent.innerHTML = `
    <div class="utilities-menu">
      <button onclick="window.showStatistics()">Case Statistics</button>
      <button onclick="window.showHearingCalendar()">Hearing Calendar</button>
      <button onclick="window.showBatchUpdate()">Batch Case Update</button>
    </div>
    <div id="utilityOutput"></div>
  `;
}

export function showReports() {
  if (!currentUser) return;

  document.getElementById('docketView').style.display = 'none';
  document.getElementById('filingForm').style.display = 'none';
  document.getElementById('caseDetailView').style.display = 'none';
  document.getElementById('utilityView').style.display = 'none';
  document.getElementById('reportsView').style.display = 'block';

  const reportsContent = document.getElementById('reportsContent');
  reportsContent.innerHTML = `
    <div class="reports-menu">
      <button onclick="window.generateDocketReport()">Docket Report</button>
      <button onclick="window.generatePendingReport()">Pending Cases</button>
      <button onclick="window.generateClosedReport()">Closed Cases</button>
      <button onclick="window.generateJudgmentsReport()">Judgments</button>
      <button onclick="window.generateHearingsReport()">Hearings</button>
      <button onclick="window.generateFeesReport()">Fees Report</button>
    </div>
    <div id="reportOutput"></div>
  `;
}
