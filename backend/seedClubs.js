import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ClubCode from './models/ClubCode.js';

dotenv.config();

const clubs = [
  { clubName: "Kalakrit Club", inviteCode: "KALAKRIT26", active: true },
  { clubName: "CodeChef Chapter", inviteCode: "CODECHEF26", active: true },
  { clubName: "E-Cell", inviteCode: "ECELL26", active: true },
  { clubName: "Technovation Club", inviteCode: "TECHNOVATION26", active: true },
  { clubName: "Arcade AR/VR & E-Gaming Club", inviteCode: "ARCADE26", active: true },
  { clubName: "Auto Innovators Club", inviteCode: "AUTO26", active: true },
  { clubName: "BitGuild Coding Club", inviteCode: "BITGUILD26", active: true },
  { clubName: "DataVerse DS & AI Club", inviteCode: "DATAVERSE26", active: true },
  { clubName: "Drone & Robotics Club", inviteCode: "DRONE26", active: true },
  { clubName: "Software Development Club", inviteCode: "SDC26", active: true },
  { clubName: "Technovation Networking Club", inviteCode: "NETWORK26", active: true },
  { clubName: "Creative & Tourism Club", inviteCode: "TOURISM26", active: true },
  { clubName: "NSS Club", inviteCode: "NSS26", active: true },
  { clubName: "Picturesque Club", inviteCode: "PICTURE26", active: true },
  { clubName: "Minerva Literature Club", inviteCode: "MINERVA26", active: true },
  { clubName: "SYC & Yoga Club", inviteCode: "YOGA26", active: true },
  { clubName: "Sports Club", inviteCode: "SPORTS26", active: true },
  { clubName: "Samvaad Club", inviteCode: "SAMVAAD26", active: true },
  { clubName: "12 Pixels Photography Club", inviteCode: "PIXELS26", active: true }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://fahadsaniya666_db_user:DEQ9ZrVFdfnIPf9D@campus-connect.87c4iny.mongodb.net/test?appName=Campus-connect');
    console.log('MongoDB connected for seeding...');

    // Clear existing to avoid duplicate key errors during dev
    await ClubCode.deleteMany({});
    
    await ClubCode.insertMany(clubs);
    console.log('Successfully seeded Club Codes!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
