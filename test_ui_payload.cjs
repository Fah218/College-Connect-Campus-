const axios = require('axios');
const FormData = require('form-data');

async function test() {
  try {
    const fd = new FormData();
    const payload = {
      title: 'UI Test Event',
      shortDescription: 'test',
      description: 'test',
      startDate: '2026-07-20',
      startTime: '10:00',
      endDate: '2026-07-21',
      endTime: '18:00',
      registrationDeadlineDate: '2026-07-15',
      registrationDeadlineTime: '23:59',
      mode: 'Offline',
      location: 'Test Location',
      category: 'Hackathon',
      tags: [],
      maxParticipants: '100',
      participationType: 'Team',
      maxTeamSize: '4',
      capacity: '100',
      contactName: 'Test Name',
      contactEmail: 'test@test.com',
      contactPhone: '1234567890',
      eligibility: 'All Students',
      club: 'My Club',
      date: '2026-07-20',
      time: '10:00',
      clubName: 'My Club',
      status: 'pending'
    };
    fd.append('eventData', JSON.stringify(payload));

    const res = await axios.post('http://localhost:5001/api/events/create', fd, {
      headers: fd.getHeaders()
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
