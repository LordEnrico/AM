import { cases } from './data.js';
import { currentUser } from './auth.js';

function generateReport(reportType, options) {
  const filteredCases = cases.filter(c => {
    const circuitMatch = currentUser.circuits.includes('all') || currentUser.circuits.includes(c.circuit);
    const typeMatch = currentUser.types.includes('all') || currentUser.types.includes(c.type);
    
    if (!circuitMatch || !typeMatch) return false;
    
    switch(reportType) {
      case 'docket':
        return options.dateRange ? 
          new Date(c.filingDate) >= new Date(options.dateRange.start) && 
          new Date(c.filingDate) <= new Date(options.dateRange.end) : true;
      
      case 'pending':
        return c.status === 'Pending' || c.status === 'Active';
      
      case 'closedCases':
        return c.status === 'Closed' || c.status === 'Dismissed';
      
      case 'judgments':
        return c.judgment != null;
      
      case 'hearings':
        return c.hearings?.length > 0;
        
      case 'fees':
        return c.fees?.length > 0;
        
      default:
        return true;
    }
  });

  const printableHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>JISPEN Report - ${reportType}</title>
      <style>
        @media print {
          body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 2cm; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #000; padding: 5px; text-align: left; }
          th { background-color: #f0f0f0; }
          .header { text-align: center; margin-bottom: 20px; }
          .page-break { page-break-before: always; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>JUDICIARY OF PENGINEERING</h1>
        <h2>${getReportTitle(reportType)}</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
        ${options.dateRange ? `<p>Date Range: ${options.dateRange.start} to ${options.dateRange.end}</p>` : ''}
      </div>
      ${formatReport(reportType, filteredCases, options)}
      <div class="no-print">
        <button onclick="window.print()">Print Report</button>
      </div>
    </body>
    </html>
  `;

  // Create print window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printableHtml);
  printWindow.document.close();
  
  return formatReport(reportType, filteredCases, options);
}

function getReportTitle(reportType) {
  switch(reportType) {
    case 'docket': return 'Docket Report';
    case 'pending': return 'Pending Cases Report';
    case 'closedCases': return 'Closed Cases Report';
    case 'judgments': return 'Judgments Report';
    case 'hearings': return 'Hearings Calendar';
    case 'fees': return 'Fees Report';
    default: return 'Case Management Report';
  }
}

function formatReport(type, cases, options) {
  let html = '<div class="report-output">';
  
  switch(type) {
    case 'docket':
      html += `
        <h4>Docket Report ${options.dateRange ? `(${options.dateRange.start} to ${options.dateRange.end})` : ''}</h4>
        <table>
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Title</th>
              <th>Filing Date</th>
              <th>Status</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            ${cases.map(c => `
              <tr>
                <td>${c.caseNumber}</td>
                <td>${c.title}</td>
                <td>${c.filingDate}</td>
                <td>${c.status}</td>
                <td>${c.docketEntries?.[c.docketEntries.length-1]?.date || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      break;

    case 'pending':
      html += `
        <h4>Pending Cases Report</h4>
        <table>
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Title</th>
              <th>Days Pending</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            ${cases.map(c => {
              const daysPending = Math.floor((new Date() - new Date(c.filingDate)) / (1000 * 60 * 60 * 24));
              return `
                <tr>
                  <td>${c.caseNumber}</td>
                  <td>${c.title}</td>
                  <td>${daysPending}</td>
                  <td>${c.docketEntries?.[c.docketEntries.length-1]?.date || 'N/A'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
      break;

    case 'closedCases':
      html += `
        <h4>Closed Cases Report</h4>
        <table>
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Title</th>
              <th>Filing Date</th>
              <th>Closing Date</th>
              <th>Disposition</th>
            </tr>
          </thead>
          <tbody>
            ${cases.map(c => {
              const closingEntry = c.docketEntries?.find(d => 
                d.description.toLowerCase().includes('closed') || 
                d.description.toLowerCase().includes('dismissed')
              );
              return `
                <tr>
                  <td>${c.caseNumber}</td>
                  <td>${c.title}</td>
                  <td>${c.filingDate}</td>
                  <td>${closingEntry?.date || 'N/A'}</td>
                  <td>${c.status}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
      break;

    case 'judgments':
      html += `
        <h4>Judgments Report</h4>
        <table>
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Title</th>
              <th>Judgment Type</th>
              <th>Judge</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${cases.map(c => `
              <tr>
                <td>${c.caseNumber}</td>
                <td>${c.title}</td>
                <td>${c.judgment?.type || 'N/A'}</td>
                <td>${c.judgment?.judge || 'N/A'}</td>
                <td>${c.judgment?.date || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      break;

    case 'hearings':
      html += `
        <h4>Hearings Calendar</h4>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Case Number</th>
              <th>Type</th>
              <th>Judge</th>
            </tr>
          </thead>
          <tbody>
            ${cases.flatMap(c => 
              (c.hearings || []).map(h => `
                <tr>
                  <td>${h.date}</td>
                  <td>${h.time}</td>
                  <td>${c.caseNumber}</td>
                  <td>${h.type}</td>
                  <td>${h.judge}</td>
                </tr>
              `)
            ).join('')}
          </tbody>
        </table>
      `;
      break;

    case 'fees':
      html += `
        <h4>Fees Report</h4>
        <table>
          <thead>
            <tr>
              <th>Case Number</th>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${cases.flatMap(c => 
              (c.fees || []).map(f => `
                <tr>
                  <td>${c.caseNumber}</td>
                  <td>${f.type}</td>
                  <td>$${f.amount}</td>
                  <td>${f.status}</td>
                  <td>${f.dueDate}</td>
                </tr>
              `)
            ).join('')}
          </tbody>
        </table>
      `;
      break;
  }

  html += '</div>';
  return html;
}

function createDashboard() {
  const dashboard = document.createElement('div');
  dashboard.className = 'dashboard';

  const widgets = [
    { id: 'totalCases', label: 'Total Cases', value: cases.length },
    { id: 'activeCases', label: 'Active Cases', value: cases.filter(c => c.status === 'Active').length },
    { id: 'pendingCases', label: 'Pending Cases', value: cases.filter(c => c.status === 'Pending').length },
    { id: 'closedCases', label: 'Closed Cases', value: cases.filter(c => c.status === 'Closed').length },
    { id: 'upcomingHearings', label: 'Upcoming Hearings', value: cases.flatMap(c => c.hearings || []).length },
    { id: 'unpaidFees', label: 'Unpaid Fees', value: cases.flatMap(c => c.fees || []).filter(f => f.status === 'Pending').length }
  ];

  widgets.forEach(widget => {
    const widgetElement = document.createElement('div');
    widgetElement.className = 'widget';
    widgetElement.id = widget.id;
    widgetElement.innerHTML = `
      <div class="widget-label">${widget.label}</div>
      <div class="widget-value">${widget.value}</div>
    `;
    dashboard.appendChild(widgetElement);
  });

  return dashboard.outerHTML;
}

function addVisualizations(reportType, cases) {
  const container = document.createElement('div');
  container.className = 'visualizations';

  const chartData = {
    labels: cases.map(c => c.caseNumber),
    datasets: [
      {
        label: 'Cases',
        data: cases.map(c => c.status === 'Active' ? 1 : 0),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const chartCanvas = document.createElement('canvas');
  container.appendChild(chartCanvas);

  new Chart(chartCanvas, {
    type: 'bar',
    data: chartData,
    options: chartOptions
  });

  return container.outerHTML;
}

function exportReport(reportType, cases, format) {
  let data;
  switch (format) {
    case 'PDF':
      data = generatePDF(reportType, cases);
      break;
    case 'Excel':
      data = generateExcel(reportType, cases);
      break;
    case 'CSV':
      data = generateCSV(reportType, cases);
      break;
    default:
      throw new Error('Unsupported export format');
  }

  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportType}.${format.toLowerCase()}`;
  a.click();
  URL.revokeObjectURL(url);
}

function generatePDF(reportType, cases) {
  const doc = new jsPDF();
  doc.text(`JISPEN Report - ${reportType}`, 10, 10);
  doc.autoTable({
    head: [['Case Number', 'Title', 'Filing Date', 'Status']],
    body: cases.map(c => [c.caseNumber, c.title, c.filingDate, c.status])
  });
  return doc.output();
}

function generateExcel(reportType, cases) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(cases.map(c => ({
    'Case Number': c.caseNumber,
    'Title': c.title,
    'Filing Date': c.filingDate,
    'Status': c.status
  })));
  XLSX.utils.book_append_sheet(workbook, worksheet, reportType);
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
}

function generateCSV(reportType, cases) {
  const rows = [
    ['Case Number', 'Title', 'Filing Date', 'Status'],
    ...cases.map(c => [c.caseNumber, c.title, c.filingDate, c.status])
  ];
  return rows.map(row => row.join(',')).join('\n');
}

export { generateReport, createDashboard, addVisualizations, exportReport };
