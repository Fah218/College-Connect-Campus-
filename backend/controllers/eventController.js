import Event from '../models/Event.js';

export const createEvent = async (req, res) => {
  try {
    const eventData = req.body;
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
    const events = await Event.find();
    res.status(200).json({
      success: true,
      events
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
    const updates = req.body;
    
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
