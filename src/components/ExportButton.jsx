import { Download } from 'lucide-react'
import { format } from 'date-fns'

export default function ExportButton({ data, filename, type = 'csv' }) {
  const exportToCSV = () => {
    if (!data || data.length === 0) return
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => Object.values(row).join(',')).join('\n')
    const csv = `${headers}\n${rows}`
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }
  
  const exportToPDF = () => {
    // Simple PDF export using print
    const printWindow = window.open('', '', 'height=600,width=800')
    printWindow.document.write('<html><head><title>' + filename + '</title>')
    printWindow.document.write('<style>body{font-family:Arial;padding:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#3b82f6;color:white;}</style>')
    printWindow.document.write('</head><body>')
    printWindow.document.write('<h1>' + filename + '</h1>')
    printWindow.document.write('<table><thead><tr>')
    
    Object.keys(data[0]).forEach(key => {
      printWindow.document.write('<th>' + key + '</th>')
    })
    
    printWindow.document.write('</tr></thead><tbody>')
    
    data.forEach(row => {
      printWindow.document.write('<tr>')
      Object.values(row).forEach(val => {
        printWindow.document.write('<td>' + val + '</td>')
      })
      printWindow.document.write('</tr>')
    })
    
    printWindow.document.write('</tbody></table></body></html>')
    printWindow.document.close()
    printWindow.print()
  }
  
  const handleExport = () => {
    if (type === 'csv') {
      exportToCSV()
    } else {
      exportToPDF()
    }
  }
  
  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
    >
      <Download size={18} />
      Export {type.toUpperCase()}
    </button>
  )
}
