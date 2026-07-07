import axios from 'axios';
import FormData from 'form-data';
(async () => {
  try {
    const payload = {
      title: 'Test Event',
      shortDescription: 'Test',
      description: 'Test',
      registrationDeadlineDate: '2026-07-08',
      registrationDeadlineTime: '23:59',
      location: 'Test Location',
      category: 'Workshop',
      status: 'pending',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      eligibility: 'All Students',
      clubName: 'Test Club'
    };
    const fd = new FormData();
    fd.append('eventData', JSON.stringify(payload));
    const res = await axios.post('http://localhost:5001/api/events/create', fd, {
      headers: fd.getHeaders()
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
})();
