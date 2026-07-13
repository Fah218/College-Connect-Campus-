import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function testUpload() {
  const fd = new FormData();
  fd.append('eventData', JSON.stringify({ 
    title: 'Test', 
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
  
  fd.append('problemStatementPdf', fs.createReadStream('dummy.pdf'));
  
  try {
    const res = await axios.post('http://localhost:5001/api/events/create', fd, {
      headers: fd.getHeaders()
    });
    console.log('[PASS] Status:', res.status);
    console.log('[PASS] Data:', res.data);
  } catch (err) {
    if (err.response) {
      console.error(`[FAIL] ->`, err.response.data);
    } else {
      console.error(`[FAIL] ->`, err.message);
    }
  }
}

testUpload();
