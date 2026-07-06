import ClubCode from '../models/ClubCode.js';
import ClubHead from '../models/ClubHead.js';

// Get all clubs
export const getClubs = async (req, res) => {
  try {
    const clubs = await ClubCode.find({});
    res.status(200).json({ clubs });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching clubs', error: error.message });
  }
};

// Archive or Unarchive a club (Targets ClubHead)
export const toggleArchiveClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { isArchived } = req.body;

    const updateFields = isArchived ? {
      isArchived: true,
      status: "Archived",
      archivedAt: new Date(),
      archivedBy: "Admin"
    } : {
      isArchived: false,
      status: "Active",
      $unset: { archivedAt: "", archivedBy: "" }
    };

    const club = await ClubHead.findByIdAndUpdate(
      id,
      updateFields,
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
