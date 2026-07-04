const axios = require('axios');
async function run() {
  try {
    const payload = {
      hackathonId: "6a43fc4b714558126b5dcd29",
      createdBy: "6643fc4b714558126b5dcd29", // fake objectid
      title: "Test",
      description: "Test",
      offlineMembers: [ { id: 'offline_foo@bar.com', email: 'foo@bar.com', name: 'foo' } ],
      currentMembers: []
    };
    await axios.post('http://localhost:5001/api/teams/request', payload);
    console.log("Success");
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
run();
