import ClubCode from '../models/ClubCode.js';

// Get all clubs
export const getClubs = async (req, res) => {
  try {
    const clubs = await ClubCode.find({});
    res.status(200).json({ clubs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clubs', error: error.message });
  }
};

// Archive or Unarchive a club
export const toggleArchiveClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;

    const club = await ClubCode.findByIdAndUpdate(
      id,
      { isArchived },
      { new: true }
    );

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    res.status(200).json({ message: `Club ${isArchived ? 'archived' : 'restored'} successfully`, club });
  } catch (error) {
    res.status(500).json({ message: 'Error updating club archive status', error: error.message });
  }
};
