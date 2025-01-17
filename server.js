const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const CASES_FILE_PATH = path.join(__dirname, 'cases.json');
const USER_CREDENTIALS_FILE_PATH = path.join(__dirname, 'userCredentials.json');

// Helper functions to read and write files
function readFile(filePath) {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

function writeFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// API endpoints for case data
app.get('/api/cases', (req, res) => {
  const cases = readFile(CASES_FILE_PATH);
  res.json(cases);
});

app.post('/api/cases', (req, res) => {
  const cases = readFile(CASES_FILE_PATH);
  const newCase = req.body;
  cases.push(newCase);
  writeFile(CASES_FILE_PATH, cases);
  res.status(201).json(newCase);
});

app.put('/api/cases/:caseNumber', (req, res) => {
  const cases = readFile(CASES_FILE_PATH);
  const caseNumber = req.params.caseNumber;
  const updatedCase = req.body;
  const index = cases.findIndex(c => c.caseNumber === caseNumber);
  if (index !== -1) {
    cases[index] = updatedCase;
    writeFile(CASES_FILE_PATH, cases);
    res.json(updatedCase);
  } else {
    res.status(404).json({ error: 'Case not found' });
  }
});

// API endpoints for user credentials
app.get('/api/userCredentials', (req, res) => {
  const userCredentials = readFile(USER_CREDENTIALS_FILE_PATH);
  res.json(userCredentials);
});

app.post('/api/userCredentials', (req, res) => {
  const userCredentials = readFile(USER_CREDENTIALS_FILE_PATH);
  const newUser = req.body;
  userCredentials.push(newUser);
  writeFile(USER_CREDENTIALS_FILE_PATH, userCredentials);
  res.status(201).json(newUser);
});

app.put('/api/userCredentials/:username', (req, res) => {
  const userCredentials = readFile(USER_CREDENTIALS_FILE_PATH);
  const username = req.params.username;
  const updatedUser = req.body;
  const index = userCredentials.findIndex(u => u.username === username);
  if (index !== -1) {
    userCredentials[index] = updatedUser;
    writeFile(USER_CREDENTIALS_FILE_PATH, userCredentials);
    res.json(updatedUser);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
