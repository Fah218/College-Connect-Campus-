import axios from 'axios';
import FormData from 'form-data';
(async () => {
  try {
    const payload = {
      title: 'Valid Title',
      shortDescription: 'Valid',
      description: 'Valid',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      registrationDeadlineDate: '2026-07-08',
      registrationDeadlineTime: '23:59',
      mode: 'Offline',
      location: 'Test',
      category: 'Workshop',
      tags: [],
      maxParticipants: '',
      participationType: 'Individual',
      maxTeamSize: '',
      bannerImage: '',
      additionalImage: '',
      capacity: 50,
      contactName: 'Test',
      contactEmail: 'test@example.com',
      contactPhone: '123',
      eligibility: 'All Students',
      prizePool: '',
      teamSizeMin: '',
      teamFormationAllowed: true,
      winnerRewards: '',
      problemStatementPdf: '',
      domains: '',
      competitionType: '',
      rules: '',
      speakerName: '',
      speakerDesignation: '',
      organization: '',
      certificateProvided: false,
      seminarTopic: '',
      clubName: 'My Club',
      status: 'pending'
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
