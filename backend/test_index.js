import mongoose from 'mongoose';
import Registration from './models/Registration.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect";

async function testIndex() {
  await mongoose.connect(MONGO_URI);
  const explain = await Registration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' }
  ]).explain('executionStats');
  console.log(JSON.stringify(explain, null, 2));
  process.exit(0);
}
testIndex();
