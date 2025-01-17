// navigation.js
import { cases } from './data.js';
import { currentUser } from './auth.js';

export function showDocket() {
  if (!currentUser) return;

  document.getElementById('docketView').style.display = 'block';
  document.getElementById('filingForm').style.display = 'none';

  const circuit = document.getElementById('circuitSelect').value;
  
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
}

export function showFilingForm() {
  if (!currentUser) return;
  
  document.getElementById('docketView').style.display = 'none';
  document.getElementById('filingForm').style.display = 'block';
}