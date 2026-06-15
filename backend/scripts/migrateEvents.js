import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';

// Load env vars
dotenv.config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-connect';

const migrateEvents = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected for migration...');

    const events = await Event.find({});
    let updatedCount = 0;

    for (const event of events) {
      let needsUpdate = false;

      if (!event.contactName) {
        event.contactName = 'Admin';
        needsUpdate = true;
      }
      if (!event.contactEmail) {
        event.contactEmail = 'admin@campusconnect.com';
        needsUpdate = true;
      }
      if (!event.contactPhone) {
        event.contactPhone = '0000000000';
        needsUpdate = true;
      }
      if (!event.eligibility) {
        event.eligibility = 'All Students';
        needsUpdate = true;
      }

      if (needsUpdate) {
        // We use $set to bypass validation just in case other fields are missing too,
        // but since we are populating the required fields, save() would also work.
        // We will use save() to ensure all schema validations pass for the updated document.
        try {
            await event.save();
            updatedCount++;
        } catch (saveError) {
            console.log(`Could not save event ${event._id} with normal save, falling back to updateOne...`, saveError.message);
            await Event.updateOne({ _id: event._id }, {
                $set: {
                    contactName: event.contactName,
                    contactEmail: event.contactEmail,
                    contactPhone: event.contactPhone,
                    eligibility: event.eligibility
                }
            });
            updatedCount++;
        }
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} events.`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateEvents();
