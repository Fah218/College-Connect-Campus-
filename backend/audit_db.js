import mongoose from 'mongoose';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import JoinRequest from './models/JoinRequest.js';
import TeamRequest from './models/TeamRequest.js';

const MONGO_URI = "mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect";

async function runAudit() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  const dummyId = new mongoose.Types.ObjectId();
  const studentTeamsExplain = await TeamRequest.find({
    $or: [{ createdBy: dummyId }, { currentMembers: dummyId }]
  }).select('_id').explain('executionStats');
  
  console.log("\n--- Student Analytics: TeamRequest Query ---");
  console.log(studentTeamsExplain.executionStats ? studentTeamsExplain.executionStats.executionTimeMillis : studentTeamsExplain[0]?.executionStats?.executionTimeMillis);
  console.log(studentTeamsExplain.queryPlanner ? studentTeamsExplain.queryPlanner.winningPlan.stage : studentTeamsExplain[0]?.queryPlanner?.winningPlan?.stage);

  const clubHeadEventsExplain = await Event.find({
    clubName: { $regex: new RegExp(`^\\s*gdsc\\s*$`, 'i') }
  }).sort({ createdAt: -1 }).explain('executionStats');

  console.log("\n--- Club Head Analytics: Event Regex Query ---");
  console.log(clubHeadEventsExplain.executionStats ? clubHeadEventsExplain.executionStats.executionTimeMillis : clubHeadEventsExplain[0]?.executionStats?.executionTimeMillis);
  console.log(clubHeadEventsExplain.queryPlanner ? clubHeadEventsExplain.queryPlanner.winningPlan.stage : clubHeadEventsExplain[0]?.queryPlanner?.winningPlan?.stage);

  const adminEventsExplain = await Event.find({}).select('_id clubName status createdAt title').sort({ createdAt: -1 }).explain('executionStats');
  
  console.log("\n--- Admin Analytics: Event.find({}) ---");
  console.log(adminEventsExplain.executionStats ? adminEventsExplain.executionStats.executionTimeMillis : adminEventsExplain[0]?.executionStats?.executionTimeMillis);
  console.log(adminEventsExplain.queryPlanner ? adminEventsExplain.queryPlanner.winningPlan.stage : adminEventsExplain[0]?.queryPlanner?.winningPlan?.stage);

  const adminRegsExplain = await Registration.find({}).select('eventId studentId teamId participationType createdAt').explain('executionStats');

  console.log("\n--- Admin Analytics: Registration.find({}) ---");
  console.log(adminRegsExplain.executionStats ? adminRegsExplain.executionStats.executionTimeMillis : adminRegsExplain[0]?.executionStats?.executionTimeMillis);
  console.log(adminRegsExplain.queryPlanner ? adminRegsExplain.queryPlanner.winningPlan.stage : adminRegsExplain[0]?.queryPlanner?.winningPlan?.stage);

  process.exit(0);
}
runAudit();
