import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

fs.writeFileSync('dummy.png', 'fake image data');
fs.writeFileSync('dummy.pdf', 'fake pdf data');

async function testUpload(name, files) {
  const fd = new FormData();
  fd.append('eventData', JSON.stringify({ title: 'Test', clubName: 'Test Club' }));
  
  if (files.banner) fd.append('bannerImage', fs.createReadStream('dummy.png'));
  if (files.additional) {
      for(let i=0; i<files.additional; i++) {
          fd.append('additionalImages', fs.createReadStream('dummy.png'));
      }
  }
  if (files.pdf) fd.append('problemStatementPdf', fs.createReadStream('dummy.pdf'));
  
  try {
    const res = await axios.post('http://localhost:5001/api/events/create', fd, {
      headers: fd.getHeaders()
    });
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name} ->`, err.response ? err.response.data : err.message);
  }
}

async function runAll() {
  await testUpload('No files', {});
  await testUpload('Banner only', { banner: true });
  await testUpload('Additional images only', { additional: 2 });
  await testUpload('PDF only', { pdf: true });
  await testUpload('All together', { banner: true, additional: 2, pdf: true });
  
  fs.unlinkSync('dummy.png');
  fs.unlinkSync('dummy.pdf');
}

runAll();
