import axios from 'axios';
import FormData from 'form-data';
(async () => {
  try {
    const payload = {
      title: 'Test Event Full',
      shortDescription: 'Test',
      description: 'Test',
      startDate: '2026-07-08',
      startTime: '12:00',
      endDate: '2026-07-09',
      endTime: '12:00',
      registrationDeadlineDate: '2026-07-08',
      registrationDeadlineTime: '23:59',
      location: 'Test Location',
      category: 'Workshop',
      status: 'pending',
      contactName: 'Test Contact',
      contactEmail: 'test@example.com',
      contactPhone: '1234567890',
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
