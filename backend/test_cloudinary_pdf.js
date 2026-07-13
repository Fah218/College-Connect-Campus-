import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

// Create a valid dummy PDF
const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
188
%%EOF`;

fs.writeFileSync('valid_dummy.pdf', pdfContent);

async function run() {
  const fd = new FormData();
  fd.append('eventData', JSON.stringify({ 
    title: 'Test PDF Corruption', 
    clubName: 'Test Club',
    eligibility: 'All',
    contactPhone: '1234567890',
    contactEmail: 'test@test.com',
    contactName: 'Test User',
    location: 'Test Location',
    registrationDeadlineTime: '12:00',
    registrationDeadlineDate: '2026-12-31',
    description: 'Test',
    shortDescription: 'Test'
  }));
  
  fd.append('problemStatementPdf', fs.createReadStream('valid_dummy.pdf'));
  
  console.log('Sending event creation request...');
  try {
    const res = await axios.post('http://localhost:5001/api/events/create', fd, {
      headers: fd.getHeaders()
    });
    
    console.log('[PASS] Event Created. PDF URL:', res.data.event.problemStatementPdf);
    
    // Download the PDF and check signature
    const pdfUrl = res.data.event.problemStatementPdf;
    if (!pdfUrl) {
      console.log('NO PDF URL RETURNED!');
      return;
    }
    
    console.log('Downloading PDF from Cloudinary to verify...');
    const downloadRes = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(downloadRes.data);
    
    const signature = buffer.slice(0, 5).toString();
    console.log('First 5 bytes:', signature);
    if (signature === '%PDF-') {
      console.log('SUCCESS: Cloudinary returned a valid PDF!');
    } else {
      console.log('ERROR: Cloudinary returned corrupted data. Expected %PDF-, got:', signature);
    }
    
  } catch (err) {
    if (err.response) {
      console.error(`[FAIL] ->`, err.response.data);
    } else {
      console.error(`[FAIL] ->`, err.message);
    }
  }
}

run();
