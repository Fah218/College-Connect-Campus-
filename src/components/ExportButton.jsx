import { Download } from 'lucide-react'
import { format } from 'date-fns'

export default function ExportButton({ data, filename, type = 'csv', className = '' }) {
  
  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '';
    const s = String(str);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) return
    
    const headers = Object.keys(data[0]).map(escapeCSV).join(',')
    const rows = data.map(row => Object.values(row).map(escapeCSV).join(',')).join('\n')
    const csv = `${headers}\n${rows}`
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }
  
  const exportToPDF = () => {
    if (!data || data.length === 0) return
    const printWindow = window.open('', '', 'height=800,width=1000')
    const dateStr = format(new Date(), 'PPpp')
    
    // Handle specific structured data if it uses the unified Section/Key/Value format (e.g. AdminEventDetailsPage)
    const hasSections = data[0].hasOwnProperty('Section') && data[0].hasOwnProperty('Key')
    
    let tablesHtml = ''
    
    if (hasSections) {
      const sections = {}
      data.forEach(row => {
        if (!sections[row.Section]) sections[row.Section] = []
        sections[row.Section].push(row)
      })
      
      Object.entries(sections).forEach(([section, rows]) => {
        tablesHtml += `<h2 class="section-title">${section}</h2>`
        tablesHtml += '<table><thead><tr><th style="width:30%;">Property</th><th>Details</th></tr></thead><tbody>'
        rows.forEach(r => {
          tablesHtml += `<tr><td style="font-weight:600;">${r.Key}</td><td>${r.Value !== null && r.Value !== undefined ? r.Value : ''}</td></tr>`
        })
        tablesHtml += '</tbody></table>'
      })
    } else {
      // Standard Flat Table
      tablesHtml += '<table><thead><tr>'
      Object.keys(data[0]).forEach(key => {
        tablesHtml += `<th>${key.replace(/([A-Z])/g, ' $1').trim()}</th>`
      })
      tablesHtml += '</tr></thead><tbody>'
      
      data.forEach(row => {
        tablesHtml += '<tr>'
        Object.values(row).forEach(val => {
          tablesHtml += `<td>${val !== null && val !== undefined ? val : ''}</td>`
        })
        tablesHtml += '</tr>'
      })
      tablesHtml += '</tbody></table>'
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              color: #1f2937;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              font-size: 24px;
              font-weight: 700;
              color: #111827;
              margin: 0 0 8px 0;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .meta {
              font-size: 14px;
              color: #6b7280;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              color: #374151;
              margin-top: 30px;
              margin-bottom: 12px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 8px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px;
              font-size: 13px;
            }
            th, td { 
              border: 1px solid #e5e7eb; 
              padding: 10px 14px; 
              text-align: left; 
            }
            th { 
              background: #f3f4f6; 
              color: #374151;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.05em;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
            }
            @media print {
              body { padding: 0; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              thead { display: table-header-group; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">${filename.replace(/_/g, ' ')}</h1>
            <div class="meta">Generated by College Campus Management System</div>
            <div class="meta">Date: ${dateStr}</div>
          </div>
          
          ${tablesHtml}
          
          <div class="footer">
            Confidential & Proprietary • Generated automatically via Platform Export
          </div>
        </body>
      </html>
    `
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Give external fonts time to load
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
    }, 500)
  }
  
  const handleExport = () => {
    if (type === 'csv') {
      exportToCSV()
    } else {
      exportToPDF()
    }
  }
  
  const buttonColors = type === 'csv' 
    ? "bg-green-600 hover:bg-green-700" 
    : "bg-red-600 hover:bg-red-700";

  return (
    <button
      onClick={handleExport}
      className={`flex items-center justify-center gap-2 px-4 py-2 text-white font-medium text-sm rounded-lg shadow-sm transition-colors ${buttonColors} ${className}`}
    >
      <Download size={16} />
      Export {type.toUpperCase()}
    </button>
  )
}
