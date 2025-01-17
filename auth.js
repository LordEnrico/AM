export let currentUser = null;
let loginAttempts = {};

export function initializeAuth() {
  let sessionTimeout;
  function resetSessionTimeout() {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(logout, 30 * 60 * 1000); // 30 minutes
  }
  document.addEventListener('mousemove', resetSessionTimeout);
  document.addEventListener('keypress', resetSessionTimeout);

  // Read currentUser from local storage if available
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('loggedInUser').style.display = 'block';
  }
}

export function authenticate() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');
  
  // Check for too many login attempts
  if (loginAttempts[username] && loginAttempts[username].attempts >= 3) {
    const lockoutTime = 15 * 60 * 1000; // 15 minutes
    const timeLeft = loginAttempts[username].lastAttempt + lockoutTime - Date.now();
    
    if (timeLeft > 0) {
      errorDiv.textContent = `Account temporarily locked. Please try again in ${Math.ceil(timeLeft/60000)} minutes.`;
      return;
    } else {
      delete loginAttempts[username];
    }
  }

  const userCredentials = {
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

  if (userCredentials[username] && userCredentials[username].password === password) {
    currentUser = {
      id: username,
      ...userCredentials[username]
    };
    delete currentUser.password;
    
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('loggedInUser').style.display = 'block';
    
    // Store currentUser in local storage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Reset login attempts
    delete loginAttempts[username];
  } else {
    // Track failed login attempts
    if (!loginAttempts[username]) {
      loginAttempts[username] = { attempts: 0 };
    }
    loginAttempts[username].attempts++;
    loginAttempts[username].lastAttempt = Date.now();
    
    errorDiv.textContent = `Invalid credentials. ${3 - loginAttempts[username].attempts} attempts remaining.`;
  }
}

export function logout() {
  currentUser = null;
  let sessionTimeout;
  clearTimeout(sessionTimeout);
  document.getElementById('loginContainer').style.display = 'block';
  document.getElementById('mainContent').style.display = 'none';
  document.getElementById('loggedInUser').style.display = 'none';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  document.getElementById('loginError').textContent = '';
  document.getElementById('docketView').style.display = 'none';
  document.getElementById('filingForm').style.display = 'none';
  
  // Remove currentUser from local storage
  localStorage.removeItem('currentUser');
}
