import mongoose from 'mongoose';
import Event from './models/Event.js';
import Registration from './models/Registration.js';
import JoinRequest from './models/JoinRequest.js';
import TeamRequest from './models/TeamRequest.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect";

async function createIndexes() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Event Indexes
    await Event.collection.createIndex({ status: 1 });
    await Event.collection.createIndex({ createdAt: -1 });
    await Event.collection.createIndex({ clubName: 1, createdAt: -1 });
    console.log("Event indexes created");

    // Registration Indexes
    await Registration.collection.createIndex({ teamId: 1 });
    await Registration.collection.createIndex({ studentId: 1 });
    console.log("Registration indexes created");

    // TeamRequest Indexes
    await TeamRequest.collection.createIndex({ createdBy: 1 });
    await TeamRequest.collection.createIndex({ currentMembers: 1 });
    console.log("TeamRequest indexes created");

  } catch (err) {
    console.error("Error:", err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

createIndexes();
