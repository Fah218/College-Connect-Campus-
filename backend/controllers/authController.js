import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import ClubHead from '../models/ClubHead.js';
import ClubCode from '../models/ClubCode.js';
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
  const { role, name, email, password, ...otherData } = req.body;

  try {
    // Basic validation
    if (!role || !name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let savedUser;

    // Check role and save to respective collection
    if (role === 'Student') {
      const existing = await Student.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Student already exists' });
      
      const newUser = new Student({
        name, email, password: hashedPassword, ...otherData
      });
      savedUser = await newUser.save();
    } 
    else if (role === 'Admin') {
      const adminCount = await Admin.countDocuments();
      if (adminCount >= 1) {
        return res.status(403).json({ message: 'Admin registration is closed. The system admin has already been set up.' });
      }

      const existing = await Admin.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Admin already exists' });
      
      const newUser = new Admin({
        name, email, password: hashedPassword, ...otherData
      });
      savedUser = await newUser.save();
    } 
    else if (role === 'ClubHead') {
      const { inviteCode } = req.body;
      if (!inviteCode) {
        return res.status(400).json({ message: 'Club Head registration requires an access code.' });
      }

      const validCode = await ClubCode.findOne({ inviteCode, active: true });
      if (!validCode) {
        return res.status(400).json({ message: 'Invalid or inactive access code.' });
      }

      const existing = await ClubHead.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Club Head already exists' });
      
      const newUser = new ClubHead({
        name, email, password: hashedPassword, clubName: validCode.clubName, ...otherData
      });
      savedUser = await newUser.save();
    } 
    else {
      return res.status(400).json({ message: 'Invalid role selected.' });
    }

    // Exclude password from the returned user object
    const userToReturn = savedUser.toObject();
    delete userToReturn.password;

    res.status(201).json({ message: `${role} registered successfully!`, user: userToReturn });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    let user;
    if (role === 'Student') {
      user = await Student.findOne({ email });
    } else if (role === 'Admin') {
      user = await Admin.findOne({ email });
    } else if (role === 'ClubHead') {
      user = await ClubHead.findOne({ email });
    } else {
      return res.status(400).json({ message: 'Invalid role selected.' });
    }

    if (!user) {
      return res.status(404).json({ message: `No account found for this email as a ${role}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const userToReturn = user.toObject();
    delete userToReturn.password;

    res.status(200).json({ message: 'Login successful', user: userToReturn });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, password, ...updates } = req.body;
  
  try {
    let user;
    if (role === 'student' || role === 'Student') {
      user = await Student.findByIdAndUpdate(id, updates, { new: true });
    } else if (role === 'admin' || role === 'Admin') {
      user = await Admin.findByIdAndUpdate(id, updates, { new: true });
    } else if (role === 'club_head' || role === 'ClubHead') {
      user = await ClubHead.findByIdAndUpdate(id, updates, { new: true });
    } else {
      return res.status(400).json({ message: 'Invalid role provided for update.' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userToReturn = user.toObject();
    delete userToReturn.password;

    res.status(200).json({ message: 'Profile updated successfully', user: userToReturn });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ message: 'Server error during update', error: error.message });
  }
};

export const getClubHeads = async (req, res) => {
  try {
    const clubHeads = await ClubHead.find({}, '-password'); // Exclude passwords
    res.status(200).json(clubHeads);
  } catch (error) {
    console.error('Error fetching club heads:', error);
    res.status(500).json({ message: 'Server error fetching club heads' });
  }
};
