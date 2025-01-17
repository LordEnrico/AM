import fs from 'fs';
import path from 'path';

let currentId = 2; // Track last used case ID for new cases

// Mock database tables
export const userCredentials = {
  mcbrien: {
    password: 'grandjudge123',
    name: 'Judge Henry McBrien',
    circuits: ['all'],
    types: ['GJ']
  },
  angers: {
    password: 'firstcircuit456',
    name: 'Judge Edward Angers',
    circuits: ['first'],
    types: ['CV', 'FC', 'LT', 'MC', 'CI']
  },
  holden: {
    password: 'special789',
    name: 'Judge Holden',
    circuits: ['special'],
    types: ['all']
  },
  collom: {
    password: 'appeals321',
    name: 'Judge Collom',
    circuits: ['all'],
    types: ['GA']
  }
};

// Case database with full detail storage
export const cases = [
  {
    id: 1,
    caseNumber: '23-00001-CV',
    title: 'Pentel v. Bic',
    filingDate: '2023-12-01',
    type: 'CV',
    status: 'Active',
    circuit: 'first',
    docketEntries: [
      {
        date: '2023-12-01',
        description: 'Case filed',
        judge: 'Judge Edward Angers'
      }
    ],
    hearings: [
      {
        date: '2023-12-15',
        type: 'Initial',
        time: '09:00',
        description: 'Initial hearing',
        judge: 'Judge Edward Angers',
        status: 'Scheduled'
      }
    ],
    fees: [
      {
        type: 'Filing',
        amount: 350,
        status: 'Paid',
        judge: 'Judge Edward Angers',
        dateAdded: '2023-12-01',
        dueDate: '2023-12-15'
      }
    ],
    defendant: {
      name: 'Bic Corporation',
      address: '123 Pen Street, Writington, ST 12345',
      phone: '555-0123',
      attorney: 'John Quill'
    },
    bond: {
      type: 'Civil Bond',
      amount: 5000,
      status: 'Posted',
      conditions: ['Must maintain pen quality standards']
    },
    jury: {
      type: 'Civil',
      size: 12,
      selected: true,
      selectionDate: '2023-12-10',
      notes: 'Jury selected from pool of certified pen experts'
    }
  },
  {
    id: 2,
    caseNumber: '23-00002-GJ',
    title: 'In re: Fountain Pen Standards',
    filingDate: '2023-12-15',
    type: 'GJ',
    status: 'Pending',
    circuit: 'special',
    docketEntries: [],
    hearings: [],
    fees: [],
    defendant: {},
    bond: {},
    jury: {}
  }
];

// Database operations
export function addCase(caseData) {
  currentId++;
  const newCase = {
    id: currentId,
    ...caseData,
    docketEntries: [],
    hearings: [],
    fees: [],
    defendant: {},
    bond: {},
    jury: {}
  };
  cases.push(newCase);
  saveCasesToFile();
  return newCase;
}

export function updateCase(caseNumber, updates) {
  const index = cases.findIndex(c => c.caseNumber === caseNumber);
  if (index !== -1) {
    cases[index] = { ...cases[index], ...updates };
    saveCasesToFile();
    return cases[index];
  }
  return null;
}

export function getCase(caseNumber) {
  return cases.find(c => c.caseNumber === caseNumber);
}

export function createDocketEntry(caseNumber, entry) {
  const caseData = getCase(caseNumber);
  if (caseData) {
    if (!caseData.docketEntries) caseData.docketEntries = [];
    caseData.docketEntries.push(entry);
    saveCasesToFile();
    return true;
  }
  return false;
}

export function addHearing(caseNumber, hearing) {
  const caseData = getCase(caseNumber);
  if (caseData) {
    if (!caseData.hearings) caseData.hearings = [];
    caseData.hearings.push(hearing);
    saveCasesToFile();
    return true;
  }
  return false;
}

export function addFeeRecord(caseNumber, fee) {
  const caseData = getCase(caseNumber);
  if (caseData) {
    if (!caseData.fees) caseData.fees = [];
    caseData.fees.push(fee);
    saveCasesToFile();
    return true;
  }
  return false;
}

export function updateDefendant(caseNumber, defendantInfo) {
  const caseData = getCase(caseNumber);
  if (caseData) {
    caseData.defendant = { ...caseData.defendant, ...defendantInfo };
    saveCasesToFile();
    return true;
  }
  return false;
}

export function updateBond(caseNumber, bondInfo) {
  const caseData = getCase(caseNumber);
  if (caseData) {
    caseData.bond = { ...caseData.bond, ...bondInfo };
    saveCasesToFile();
    return true;
  }
  return false;
}

export function updateJury(caseNumber, juryInfo) {
  const caseData = getCase(caseNumber);
  if (caseData) {
    caseData.jury = { ...caseData.jury, ...juryInfo };
    saveCasesToFile();
    return true;
  }
  return false;
}

export function updateCaseStatus(caseNumber, status, judge) {
  const caseData = getCase(caseNumber);
  if (caseData) {
    caseData.status = status;
    createDocketEntry(caseNumber, {
      date: new Date().toISOString().split('T')[0],
      description: `Case status updated to: ${status}`,
      judge
    });
    saveCasesToFile();
    return true;
  }
  return false;
}

export function enterJudgmentRecord(caseNumber, judgmentInfo) {
  const caseData = getCase(caseNumber);
  if (caseData) {
    caseData.judgment = judgmentInfo;
    caseData.status = 'Closed';
    createDocketEntry(caseNumber, {
      date: new Date().toISOString().split('T')[0],
      description: `Judgment Entered: ${judgmentInfo.type}\n${judgmentInfo.text}`,
      judge: judgmentInfo.judge
    });
    saveCasesToFile();
    return true;
  }
  return false;
}

// Server-side storage functions
function saveCasesToFile() {
  const filePath = path.join(__dirname, 'cases.json');
  fs.writeFileSync(filePath, JSON.stringify(cases, null, 2));
}

function loadCasesFromFile() {
  const filePath = path.join(__dirname, 'cases.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

function saveUserCredentialsToFile() {
  const filePath = path.join(__dirname, 'userCredentials.json');
  fs.writeFileSync(filePath, JSON.stringify(userCredentials, null, 2));
}

function loadUserCredentialsFromFile() {
  const filePath = path.join(__dirname, 'userCredentials.json');
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return {};
}

// Initialize data from file storage
const storedCases = loadCasesFromFile();
if (storedCases.length > 0) {
  cases.length = 0;
  cases.push(...storedCases);
}

const storedUserCredentials = loadUserCredentialsFromFile();
if (Object.keys(storedUserCredentials).length > 0) {
  Object.assign(userCredentials, storedUserCredentials);
}
