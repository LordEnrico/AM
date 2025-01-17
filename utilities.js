// utilities.js
import { cases } from './data.js';
import { currentUser } from './auth.js';
import { createDocketEntry } from './data.js';

function generateStatistics() {
  const userCases = cases.filter(c => 
    currentUser.circuits.includes('all') || currentUser.circuits.includes(c.circuit)
  );

  const stats = {
    total: userCases.length,
    active: userCases.filter(c => c.status === 'Active').length,
    pending: userCases.filter(c => c.status === 'Pending').length,
    closed: userCases.filter(c => c.status === 'Closed' || c.status === 'Dismissed').length,
    hearingsThisWeek: userCases.filter(c => 
      c.hearings?.some(h => {
        const hearingDate = new Date(h.date);
        const today = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return hearingDate >= today && hearingDate <= weekFromNow;
      })
    ).length,
    unpaidFees: userCases.filter(c => 
      c.fees?.some(f => f.status === 'Pending')
    ).length
  };

  return `
    <div class="stats-container">
      <h4>Case Statistics</h4>
      <div class="stats-grid">
        <div class="stat-box">
          <span class="stat-number">${stats.total}</span>
          <span class="stat-label">Total Cases</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">${stats.active}</span>
          <span class="stat-label">Active Cases</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">${stats.pending}</span>
          <span class="stat-label">Pending Cases</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">${stats.closed}</span>
          <span class="stat-label">Closed Cases</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">${stats.hearingsThisWeek}</span>
          <span class="stat-label">Hearings This Week</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">${stats.unpaidFees}</span>
          <span class="stat-label">Cases with Unpaid Fees</span>
        </div>
      </div>
    </div>
  `;
}

function generateHearingCalendar() {
  const today = new Date();
  const upcomingHearings = cases
    .filter(c => currentUser.circuits.includes('all') || currentUser.circuits.includes(c.circuit))
    .flatMap(c => (c.hearings || [])
      .filter(h => new Date(h.date) >= today)
      .map(h => ({ ...h, caseNumber: c.caseNumber, caseTitle: c.title }))
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return `
    <div class="calendar-container">
      <h4>Upcoming Hearings Calendar</h4>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Case</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${upcomingHearings.map(h => `
            <tr>
              <td>${h.date}</td>
              <td>${h.time}</td>
              <td>${h.caseNumber} - ${h.caseTitle}</td>
              <td>${h.type}</td>
              <td>${h.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function batchUpdateCases(updateType, options) {
  const affectedCases = cases.filter(c => 
    (currentUser.circuits.includes('all') || currentUser.circuits.includes(c.circuit)) &&
    options.caseNumbers.includes(c.caseNumber)
  );

  affectedCases.forEach(c => {
    switch(updateType) {
      case 'status':
        c.status = options.newStatus;
        createDocketEntry(c.caseNumber, {
          date: new Date().toISOString().split('T')[0],
          description: `Status updated to: ${options.newStatus}`,
          judge: currentUser.name
        });
        break;

      case 'reassign':
        c.assignedJudge = options.newJudge;
        createDocketEntry(c.caseNumber, {
          date: new Date().toISOString().split('T')[0],
          description: `Case reassigned to: ${options.newJudge}`,
          judge: currentUser.name
        });
        break;

      case 'seal':
        c.sealed = options.seal;
        createDocketEntry(c.caseNumber, {
          date: new Date().toISOString().split('T')[0],
          description: `Case ${options.seal ? 'sealed' : 'unsealed'}`,
          judge: currentUser.name
        });
        break;
    }
  });

  return `Updated ${affectedCases.length} cases`;
}

function getOffenseDescription(level) {
  const descriptions = {
    1: "Improper Stapling",
    5: "Unauthorized Margin Adjustment",
    10: "Willful Font Misuse",
    15: "Serial Form Misfiling",
    20: "Aggravated Rubber Stamp Abuse",
    25: "Bureaucratic Insurrection",
    30: "Grand Paper Clip Larceny",
    35: "Malicious Memo Distribution",
    40: "High Treason Against The Process",
    43: "Existence Without Permit"
  };
  
  const levels = Object.keys(descriptions).map(Number);
  const closest = levels.reduce((prev, curr) => 
    (Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev));
  return descriptions[closest];
}

function calculateSentencingRange(level, history) {
  const punishments = [];
  
  if (level >= 43) {
    punishments.push("CIVIL AMPUTATION (Permanent Documentation Privileges Revocation)");
    punishments.push("Complete Removal from The Process");
  } else if (level >= 35) {
    punishments.push("Circuit Jail - Department of Love Maximum Security Wing (15-25 years)");
    punishments.push("Mandatory Institutional Reeducation Program (10 years minimum)");
    punishments.push("Perpetual Form Filing Restrictions");
  } else if (level >= 25) {
    punishments.push("Department of Love Correctional Processing Center (5-15 years)");
    punishments.push("Intensive Bureaucratic Rehabilitation");
    punishments.push("Weekly Form Filing Duties");
  } else if (level >= 15) {
    punishments.push("Circuit Jail (2-5 years)");
    punishments.push("Mandatory Paper Clip Safety Training");
    punishments.push("Rubber Stamp Privileges Revocation");
  } else if (level >= 10) {
    punishments.push("Institutional Reeducation Division (6-24 months)");
    punishments.push("Form 27B-6 Filing Restrictions");
    punishments.push("Bureaucratic Probation");
  } else {
    punishments.push("Administrative Probation (3-12 months)");
    punishments.push("Remedial Rubber Stamp Training");
    punishments.push("Weekly Process Appreciation Sessions");
  }
  
  if (history === 'VI') {
    punishments.unshift("Career Bureaucratic Offender Enhancement");
    punishments.push("Permanent Record of Administrative Deviancy");
  }
  
  return punishments;
}

function getSupervisionPeriod(level) {
  if (level >= 40) return "Eternal Vigilance";
  if (level >= 30) return "Life Plus 99 Years";
  if (level >= 20) return "25 Years to Life";
  if (level >= 10) return "10-15 Years";
  return "5 Years";
}

function getRehabilitationRequirements(level) {
  if (level >= 35) {
    return "Daily Form Filing Exercises + Monthly Bureaucratic Loyalty Assessments";
  } else if (level >= 25) {
    return "Bi-weekly Process Appreciation Sessions + Quarterly Paper Handling Reviews";
  } else if (level >= 15) {
    return "Monthly Document Processing Training + Semi-annual Procedure Compliance Checks";
  }
  return "Annual Administrative Ethics Refresher Course";
}

export function showSentencingCalculator() {
  return `
    <div class="calculator-container">
      <h3>Official Department of Love Sentencing Guidelines Calculator</h3>
      <div class="system-notice" style="color: #cc0000; text-align: center; margin: 10px 0;">
        NOTICE: All calculations are final and binding in the eyes of The Process.
      </div>
      
      <form id="sentencingForm" class="edit-form">
        <div class="form-group">
          <label>Base Bureaucratic Transgression Level:</label>
          <select id="baseOffense" required>
            ${Array.from({length: 43}, (_, i) => `
              <option value="${i+1}">${i+1} - ${getOffenseDescription(i+1)}</option>
            `).join('')}
          </select>
        </div>

        <div class="form-group">
          <label>Prior Documentation Violations Category:</label>
          <select id="criminalHistory" required>
            <option value="I">Category I (0-1 Form Misfilings)</option>
            <option value="II">Category II (2-3 Procedure Violations)</option>
            <option value="III">Category III (4-6 Protocol Breaches)</option>
            <option value="IV">Category IV (7-9 Regulation Infractions)</option>
            <option value="V">Category V (10-12 Bureaucratic Contempts)</option>
            <option value="VI">Category VI (13+ Administrative Heresies)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Specific Process Characteristics:</label>
          <div id="characteristics">
            <div class="checkbox-group">
              <input type="checkbox" id="weaponUsed" onchange="window.updateSentencing()">
              <label for="weaponUsed">Unauthorized Writing Implement (+2)</label>
            </div>
            <div class="checkbox-group">
              <input type="checkbox" id="vulnerableVictim" onchange="window.updateSentencing()">
              <label for="vulnerableVictim">Offense Against Bureaucratic Dignity (+2)</label>
            </div>
            <div class="checkbox-group">
              <input type="checkbox" id="obstruction" onchange="window.updateSentencing()">
              <label for="obstruction">Resistance to The Process (+2)</label>
            </div>
            <div class="checkbox-group">
              <input type="checkbox" id="acceptance" onchange="window.updateSentencing()">
              <label for="acceptance">Voluntary Submission to The Process (-2)</label>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Institutional Adjustments:</label>
          <div id="adjustments">
            <div class="checkbox-group">
              <input type="checkbox" id="roleAggravating" onchange="window.updateSentencing()">
              <label for="roleAggravating">Ringleader in Administrative Rebellion (+2)</label>
            </div>
            <div class="checkbox-group">
              <input type="checkbox" id="roleMitigating" onchange="window.updateSentencing()">
              <label for="roleMitigating">Exemplary Form-Filing History (-2)</label>
            </div>
          </div>
        </div>

        <div class="results-section">
          <h4>Calculated Institutional Treatment Guidelines</h4>
          <div id="calculatedOffenseLevel"></div>
          <div id="sentencingRange"></div>
          <div id="supervisionRange"></div>
        </div>
      </form>
    </div>
  `;
}

// Add to window object for global access
window.updateSentencing = function() {
  const baseLevel = parseInt(document.getElementById('baseOffense').value);
  const history = document.getElementById('criminalHistory').value;
  
  let adjustedLevel = baseLevel;
  
  // Add adjustments
  if (document.getElementById('weaponUsed').checked) adjustedLevel += 2;
  if (document.getElementById('vulnerableVictim').checked) adjustedLevel += 2;
  if (document.getElementById('obstruction').checked) adjustedLevel += 2;
  if (document.getElementById('acceptance').checked) adjustedLevel -= 2;
  if (document.getElementById('roleAggravating').checked) adjustedLevel += 2;
  if (document.getElementById('roleMitigating').checked) adjustedLevel -= 2;
  
  // Calculate ranges
  const range = calculateSentencingRange(adjustedLevel, history);
  
  document.getElementById('calculatedOffenseLevel').innerHTML = `
    <p>Final Bureaucratic Deviation Level: <strong>${adjustedLevel}</strong></p>
  `;
  
  document.getElementById('sentencingRange').innerHTML = `
    <p>Recommended Administrative Action Range:</p>
    <ul>
      ${range.map(punishment => `<li>${punishment}</li>`).join('')}
    </ul>
  `;
  
  document.getElementById('supervisionRange').innerHTML = `
    <p>Post-Treatment Monitoring Period:</p>
    <ul>
      <li>${getSupervisionPeriod(adjustedLevel)} of Document Processing Supervision</li>
      <li>${getRehabilitationRequirements(adjustedLevel)}</li>
    </ul>
  `;
};

export { generateStatistics, generateHearingCalendar, batchUpdateCases };