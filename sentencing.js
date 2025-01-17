// sentencing.js
const TRANSGRESSION_DESCRIPTIONS = {
    1: "Minor clerical errors, improper stapling, unauthorized margin adjustments",
    2: "Willful font misuse, serial form misfiling, rubber stamp abuse",
    3: "Bureaucratic insubordination, grand paper clip larceny, malicious memo distribution",
    4: "Organizational chart manipulation, systematic protocol deviation, stamp pad sabotage",
    5: "Mass form destruction, institutional hierarchy subversion, procedure nullification",
    6: "Complete process rejection, bureaucratic insurrection, existence without permit"
};

const PUNISHMENTS = {
    1: [
        "Administrative Probation (3-12 months)",
        "Weekly Process Appreciation Sessions",
        "Remedial Rubber Stamp Training"
    ],
    2: [
        "Institutional Reeducation Division (6-24 months)",
        "Form 27B-6 Filing Restrictions",
        "Monthly Process Compliance Audits"
    ],
    3: [
        "Circuit Jail (2-5 years)",
        "Mandatory Paper Clip Safety Training",
        "Quarterly Bureaucratic Rehabilitation"
    ],
    4: [
        "Department of Love Correctional Processing Center (5-15 years)",
        "Intensive Administrative Reprogramming",
        "Perpetual Form Filing Duties"
    ],
    5: [
        "Circuit Jail - Department of Love Maximum Security Wing (15-25 years)",
        "Complete Bureaucratic Reconditioning",
        "Lifetime Documentation Restrictions"
    ],
    6: [
        "CIVIL AMPUTATION (Permanent Documentation Privileges Revocation)",
        "Complete Removal from The Process",
        "Eternal Bureaucratic Exile"
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('baseOffense').addEventListener('change', updateTransgressionDescription);
    updateTransgressionDescription();
});

function updateTransgressionDescription() {
    const level = document.getElementById('baseOffense').value;
    const description = TRANSGRESSION_DESCRIPTIONS[level];
    document.getElementById('transgressionDescription').textContent = description;
}

window.generateSentence = function() {
    let level = parseInt(document.getElementById('baseOffense').value);
    
    // Apply adjustments
    if (document.getElementById('weaponUsed').checked) level += 1;
    if (document.getElementById('vulnerableVictim').checked) level += 1;
    if (document.getElementById('obstruction').checked) level += 1;
    if (document.getElementById('acceptance').checked) level -= 1;
    if (document.getElementById('roleMitigating').checked) level -= 1;
    
    // Ensure level stays within bounds
    level = Math.max(1, Math.min(6, level));
    
    const history = document.getElementById('criminalHistory').value;
    const punishments = PUNISHMENTS[level];
    
    // Update both display and printable versions
    updateDisplayResults(level, history, punishments);
    updatePrintableResults(level, history, punishments);
};

function updateDisplayResults(level, history, punishments) {
    // Show results section
    const resultsSection = document.querySelector('.results-section');
    resultsSection.style.display = 'block';
    
    // Update display
    document.getElementById('calculatedOffenseLevel').innerHTML = `
        <p>Final Bureaucratic Deviation Level: <strong>${level}</strong></p>
        <p class="transgression-description">${TRANSGRESSION_DESCRIPTIONS[level]}</p>
    `;
    
    document.getElementById('sentencingRange').innerHTML = `
        <p>Recommended Administrative Action Range:</p>
        <ul>
            ${punishments.map(p => `<li>${p}</li>`).join('')}
        </ul>
    `;
    
    document.getElementById('supervisionRange').innerHTML = `
        <p>Post-Treatment Monitoring Period:</p>
        <ul>
            <li>${level === 6 ? 'Eternal Vigilance' : `${level * 5} Years of Document Processing Supervision`}</li>
            <li>${level === 6 ? 'Permanent Process Exile' : 'Monthly Bureaucratic Compliance Reviews'}</li>
        </ul>
    `;
    
    // Generate reference number and date
    document.getElementById('generationDate').textContent = new Date().toLocaleString();
    document.getElementById('referenceNumber').textContent = 
        Math.random().toString(36).substring(2, 8).toUpperCase() + 
        '-' + level + '-' + history;
};

function updatePrintableResults(level, history, punishments) {
    const now = new Date();
    const refNumber = Math.random().toString(36).substring(2, 8).toUpperCase() + 
        '-' + level + '-' + history;
    
    document.getElementById('printCalculatedLevel').innerHTML = `
        <div style="margin: 20px 0; padding: 20px; border: 1px solid #000;">
            <h4>OFFICIAL TRANSGRESSION ASSESSMENT</h4>
            <p>The Process has determined a Bureaucratic Deviation Level of <strong>${level}</strong></p>
            <p class="transgression-description">${TRANSGRESSION_DESCRIPTIONS[level]}</p>
        </div>
    `;
    
    document.getElementById('printSentencingRange').innerHTML = `
        <div style="margin: 20px 0;">
            <h4>PRESCRIBED ADMINISTRATIVE ACTION</h4>
            <p>The Department of Love hereby orders the following corrective measures:</p>
            <ol style="margin: 20px 0;">
                ${punishments.map(p => `<li style="margin: 10px 0;">${p}</li>`).join('')}
            </ol>
        </div>
    `;
    
    document.getElementById('printSupervisionRange').innerHTML = `
        <div style="margin: 20px 0;">
            <h4>POST-TREATMENT MONITORING PROTOCOL</h4>
            <p>Following successful completion of prescribed treatment:</p>
            <ul style="margin: 20px 0;">
                <li>${level === 6 ? 'Eternal Vigilance' : `${level * 5} Years of Document Processing Supervision`}</li>
                <li>${level === 6 ? 'Permanent Process Exile' : 'Monthly Bureaucratic Compliance Reviews'}</li>
            </ul>
        </div>
    `;
    
    document.getElementById('printGenerationDate').textContent = now.toLocaleString();
    document.getElementById('printReferenceNumber').textContent = refNumber;
    
    // Show the printable version when printing
    const printableJudgment = document.getElementById('printableJudgment');
    const originalDisplay = printableJudgment.style.display;
    
    window.onbeforeprint = function() {
        printableJudgment.style.display = 'block';
    };
    
    window.onafterprint = function() {
        printableJudgment.style.display = originalDisplay;
    };
};