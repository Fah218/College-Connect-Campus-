const axios = require('axios');
const FormData = require('form-data');

async function test() {
  try {
    const fd = new FormData();
    const payload = {
      title: "Test Event",
      clubName: "Tech Club",
      date: "2026-07-10",
      time: "12:00",
      shortDescription: "Test",
      description: "Test description",
      registrationDeadlineDate: "2026-07-09",
      registrationDeadlineTime: "23:59",
      location: "TBA",
      category: "Workshop",
      status: "pending"
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
