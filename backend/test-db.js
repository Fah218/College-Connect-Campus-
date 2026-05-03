import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const testDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    const students = await mongoose.connection.db.collection('students').find().toArray();
    const clubHeads = await mongoose.connection.db.collection('clubheads').find().toArray();
    console.log('Students:', students);
    console.log('ClubHeads:', clubHeads);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
testDb();
