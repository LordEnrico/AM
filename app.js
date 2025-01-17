import { userCredentials, cases } from './data.js';
import { initializeAuth, currentUser, authenticate, logout } from './auth.js';
import { showDocket, showFilingForm } from './navigation.js';
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
  enterJudgment
} from './caseManagement.js';

// Initialize authentication
initializeAuth();

// Export functions for global access
window.authenticate = authenticate;
window.logout = logout;
window.showDocket = showDocket;
window.showFilingForm = showFilingForm;
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
  
  alert(`Case filed successfully!\nCase Number: ${caseNumber}`);
  showDocket();
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('circuitSelect')?.addEventListener('change', showDocket);
  document.getElementById('newCaseForm')?.addEventListener('submit', handleNewCase);
});