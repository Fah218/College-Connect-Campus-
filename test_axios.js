import axios from 'axios';
async function run() {
  try {
    const payload = {
        hackathonId: '123',
        createdBy: '456',
        title: 'Title',
        description: 'Offline Team',
        status: 'closed',
        offlineMembers: [],
        currentMembers: []
      };
    const response = await axios.post('http://localhost:5001/api/teams/request', payload);
    console.log(response.data);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
run();
