import { userCredentials, cases } from './data.js';
import { initializeAuth, currentUser, authenticate, logout } from './auth.js';
import { showDocket, showFilingForm, showUtilities, showReports } from './navigation.js';
import { 
  viewCase, 
  addDocketEntry, 
  scheduleHearing,
  addFee,
  editDefendantInfo,
  editBondInfo,
  editJuryInfo,
  initiateAppeal,
  updateCaseStatus,
  enterJudgment,
  printCase
} from './caseManagement.js';
import { generateReport } from './reports.js';
import { generateStatistics, generateHearingCalendar, batchUpdateCases, showSentencingCalculator } from './utilities.js';
import { initializeMessaging, sendMessage, receiveMessages, displayMessages } from './messages.js';

// Initialize authentication
initializeAuth();

// Initialize messaging system
initializeMessaging();

// Export functions for global access
window.authenticate = authenticate;
window.logout = logout;
window.showDocket = showDocket;
window.showFilingForm = showFilingForm;
window.showUtilities = showUtilities;
window.showReports = showReports;
window.viewCase = viewCase;
window.addDocketEntry = addDocketEntry;
window.scheduleHearing = scheduleHearing;
window.addFee = addFee;
window.editDefendantInfo = editDefendantInfo;
window.editBondInfo = editBondInfo;
window.editJuryInfo = editJuryInfo;
window.initiateAppeal = initiateAppeal;
window.updateCaseStatus = updateCaseStatus;
window.enterJudgment = enterJudgment;
window.printCase = printCase;

// Messaging functions
window.sendMessage = sendMessage;
window.receiveMessages = receiveMessages;
window.displayMessages = displayMessages;

// Reports functions
window.generateDocketReport = function() {
  const output = generateReport('docket', {
    dateRange: { 
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  });
  document.getElementById('reportOutput').innerHTML = output;
};

window.generatePendingReport = function() {
  const output = generateReport('pending', {});
  document.getElementById('reportOutput').innerHTML = output;
};

window.generateClosedReport = function() {
  const output = generateReport('closedCases', {});
  document.getElementById('reportOutput').innerHTML = output;
};

window.generateJudgmentsReport = function() {
  const output = generateReport('judgments', {});
  document.getElementById('reportOutput').innerHTML = output;
};

window.generateHearingsReport = function() {
  const output = generateReport('hearings', {});
  document.getElementById('reportOutput').innerHTML = output;
};

window.generateFeesReport = function() {
  const output = generateReport('fees', {});
  document.getElementById('reportOutput').innerHTML = output;
};

// Utilities functions
window.showStatistics = function() {
  const output = generateStatistics();
  document.getElementById('utilityOutput').innerHTML = output;
};

window.showHearingCalendar = function() {
  const output = generateHearingCalendar();
  document.getElementById('utilityOutput').innerHTML = output;
};

window.showBatchUpdate = function() {
  document.getElementById('utilityOutput').innerHTML = `
    <div class="batch-update-form">
      <h4>Batch Case Update</h4>
      <div class="form-group">
        <label>Update Type:</label>
        <select id="updateType">
          <option value="status">Update Status</option>
          <option value="reassign">Reassign Judge</option>
          <option value="seal">Seal/Unseal</option>
        </select>
      </div>
      <div class="form-group">
        <label>Case Numbers (one per line):</label>
        <textarea id="caseNumbers" rows="5"></textarea>
      </div>
      <div id="updateOptions"></div>
      <button onclick="window.executeBatchUpdate()">Execute Update</button>
    </div>
  `;
  
  document.getElementById('updateType').addEventListener('change', function() {
    const optionsDiv = document.getElementById('updateOptions');
    switch(this.value) {
      case 'status':
        optionsDiv.innerHTML = `
          <div class="form-group">
            <label>New Status:</label>
            <select id="newStatus">
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="Dismissed">Dismissed</option>
              <option value="Stayed">Stayed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        `;
        break;
      case 'reassign':
        optionsDiv.innerHTML = `
          <div class="form-group">
            <label>New Judge:</label>
            <input type="text" id="newJudge">
          </div>
        `;
        break;
      case 'seal':
        optionsDiv.innerHTML = `
          <div class="form-group">
            <label>Action:</label>
            <select id="sealAction">
              <option value="true">Seal</option>
              <option value="false">Unseal</option>
            </select>
          </div>
        `;
        break;
    }
  });
};

window.executeBatchUpdate = function() {
  const updateType = document.getElementById('updateType').value;
  const caseNumbers = document.getElementById('caseNumbers').value.split('\n').map(n => n.trim()).filter(n => n);
  
  const options = { caseNumbers };
  switch(updateType) {
    case 'status':
      options.newStatus = document.getElementById('newStatus').value;
      break;
    case 'reassign':
      options.newJudge = document.getElementById('newJudge').value;
      break;
    case 'seal':
      options.seal = document.getElementById('sealAction').value === 'true';
      break;
  }
  
  const result = batchUpdateCases(updateType, options);
  alert(result);
};

window.showSentencingCalc = function() {
  document.getElementById('utilityOutput').innerHTML = showSentencingCalculator();
  // Initialize first calculation
  window.updateSentencing();
};

function handleNewCase(e) {
  e.preventDefault();
  
  const caseType = document.getElementById('caseType').value;
  const caseTitle = document.getElementById('caseTitle').value;
  
  // Generate case number
  const year = new Date().getFullYear().toString().substr(-2);
  const sequence = (cases.length + 1).toString().padStart(5, '0');
  const caseNumber = `${year}-${sequence}-${caseType}`;
  
  const newCase = {
    caseNumber,
    title: caseTitle,
    filingDate: new Date().toISOString().split('T')[0],
    type: caseType,
    status: 'Pending',
    circuit: document.getElementById('circuitSelect').value
  };
  
  cases.push(newCase);
  
  // Store updated cases array in local storage
  localStorage.setItem('cases', JSON.stringify(cases));
  
  alert(`Case filed successfully!\nCase Number: ${caseNumber}`);
  showDocket();
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('circuitSelect')?.addEventListener('change', showDocket);
  document.getElementById('newCaseForm')?.addEventListener('submit', handleNewCase);
});
