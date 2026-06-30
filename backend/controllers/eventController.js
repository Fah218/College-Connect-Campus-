import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';
import path from 'path';

export const createEvent = async (req, res) => {
  try {
    console.log("---- CREATE EVENT HEADERS ----", req.headers);
    console.log("---- CREATE EVENT FILES ----", !!req.files, req.files ? Object.keys(req.files) : 'No files');
    console.log("---- CREATE EVENT BODY ----", !!req.body, Object.keys(req.body));
    let eventData = req.body.eventData ? JSON.parse(req.body.eventData) : req.body;
    console.log("---- RECEIVED EVENT CREATION ----");
    console.log("Is Multipart?", !!req.body.eventData);
    console.log("Files received:", req.files ? Object.keys(req.files) : 'None');
    
    // Prevent blob URLs from being saved
    if (eventData.bannerImage && eventData.bannerImage.startsWith('blob:')) delete eventData.bannerImage;
    if (eventData.additionalImage && eventData.additionalImage.startsWith('blob:')) delete eventData.additionalImage;
    if (eventData.additionalImages) {
       eventData.additionalImages = eventData.additionalImages.filter(img => !img.startsWith('blob:'));
    }


    const uploadToCloudinary = async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'college_campus/events'
        });
        fs.unlinkSync(file.path);
        return { url: result.secure_url, public_id: result.public_id };
      } catch (err) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw err;
      }
    };

    if (req.files) {
      if (req.files.bannerImage && req.files.bannerImage.length > 0) {
        const res = await uploadToCloudinary(req.files.bannerImage[0]);
        eventData.bannerImage = res.url;
        eventData.bannerImagePublicId = res.public_id;
      }
      if (req.files.additionalImages && req.files.additionalImages.length > 0) {
        eventData.additionalImages = [];
        eventData.additionalImagesPublicIds = [];
        for (const file of req.files.additionalImages) {
          const res = await uploadToCloudinary(file);
          eventData.additionalImages.push(res.url);
          eventData.additionalImagesPublicIds.push(res.public_id);
        }
      }
    }

    // Assuming you have the club head ID from authentication middleware or passed in body
    const newEvent = new Event(eventData);
    await newEvent.save();
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().lean();
    
    // Dynamically calculate individual/team/total counts using Registration
    const eventsWithAttendees = await Promise.all(events.map(async (event) => {
      const registrations = await Registration.find({ eventId: event._id }).populate('teamId');
      
      let individualCount = 0;
      let teamCount = 0;
      let totalParticipants = 0;

      for (const reg of registrations) {
        if (reg.participationType === 'Individual') {
          individualCount += 1;
          totalParticipants += 1;
        } else if (reg.participationType === 'Team' && reg.teamId) {
          teamCount += 1;
          const teamSize = 1 + (reg.teamId.currentMembers ? reg.teamId.currentMembers.length : 0);
          totalParticipants += teamSize;
        }
      }

      console.log(`Event [${event._id}] Stats:`, {
        eventId: event._id,
        individualCount,
        teamCount,
        teamParticipants: totalParticipants - individualCount,
        totalParticipants
      });

      return {
        ...event,
        individualCount,
        teamCount,
        totalParticipants,
        attendees: totalParticipants // fallback
      };
    }));

    res.status(200).json({
      success: true,
      events: eventsWithAttendees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = req.body.eventData ? JSON.parse(req.body.eventData) : req.body;
    
    // Prevent blob URLs from being saved
    if (updates.bannerImage && updates.bannerImage.startsWith('blob:')) delete updates.bannerImage;
    if (updates.additionalImage && updates.additionalImage.startsWith('blob:')) delete updates.additionalImage;
    if (updates.additionalImages) {
       updates.additionalImages = updates.additionalImages.filter(img => !img.startsWith('blob:'));
    }


    const uploadToCloudinary = async (file) => {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'college_campus/events'
        });
        fs.unlinkSync(file.path);
        return { url: result.secure_url, public_id: result.public_id };
      } catch (err) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw err;
      }
    };

    if (req.files) {
      if (req.files.bannerImage && req.files.bannerImage.length > 0) {
        const res = await uploadToCloudinary(req.files.bannerImage[0]);
        updates.bannerImage = res.url;
        updates.bannerImagePublicId = res.public_id;
      }
      if (req.files.additionalImages && req.files.additionalImages.length > 0) {
        updates.additionalImages = [];
        updates.additionalImagesPublicIds = [];
        for (const file of req.files.additionalImages) {
          const res = await uploadToCloudinary(file);
          updates.additionalImages.push(res.url);
          updates.additionalImagesPublicIds.push(res.public_id);
        }
      }
    }

    
    const updatedEvent = await Event.findByIdAndUpdate(id, updates, { new: true });
    
    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};


export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Helper to delete file locally (for backward compatibility)
    const deleteFile = (fileUrl) => {
      if (fileUrl && fileUrl.includes('/uploads/events/')) {
        const filename = fileUrl.split('/uploads/events/')[1];
        const filepath = path.join(process.cwd(), 'uploads/events', filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    };

    // Delete from Cloudinary
    if (event.bannerImagePublicId) {
      await cloudinary.uploader.destroy(event.bannerImagePublicId);
    }
    if (event.additionalImagesPublicIds && event.additionalImagesPublicIds.length > 0) {
      for (const pubId of event.additionalImagesPublicIds) {
        await cloudinary.uploader.destroy(pubId);
      }
    }

    deleteFile(event.bannerImage);
    if (event.additionalImages && event.additionalImages.length > 0) {
      event.additionalImages.forEach(deleteFile);
    }
    // backward comp for old additionalImage string
    if (event.additionalImage) {
       deleteFile(event.additionalImage);
    }

    await Event.findByIdAndDelete(id);
    
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event', error: error.message });
  }
};
