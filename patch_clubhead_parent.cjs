const fs = require('fs');
let path = 'src/pages/ClubHeadDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const oldSubmit = `  const handleSubmit = async (formData) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id || editingEvent._id, formData)
      addNotification({
        title: 'Event Updated',
        message: \`\${formData.title} has been updated\`,
        priority: 'low'
      })
    } else {
      try {
        await addEvent({ ...formData, club: user?.clubName || user?.name || 'My Club' })
        addNotification({
          title: 'Event Created',
          message: \`\${formData.title} has been submitted for approval\`,
          priority: 'medium'
        })
      } catch (error) {
        addNotification({
          title: 'Error',
          message: 'Failed to create event in database.',
          priority: 'high'
        })
      }
    }
    setShowModal(false)
    setEditingEvent(null)
  }`;

const newSubmit = `  const handleSubmit = async (formData) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id || editingEvent._id, formData)
        addNotification({
          title: 'Event Updated',
          message: \`\${formData.title} has been updated\`,
          priority: 'low'
        })
      } else {
        await addEvent({ ...formData, club: user?.clubName || user?.name || 'My Club' })
        addNotification({
          title: 'Event Created',
          message: \`\${formData.title} has been submitted for approval\`,
          priority: 'medium'
        })
      }
      setShowModal(false)
      setEditingEvent(null)
    } catch (error) {
      addNotification({
        title: 'Error',
        message: error.message || 'Operation failed. Please try again.',
        priority: 'high'
      })
    }
  }`;

content = content.replace(oldSubmit, newSubmit);
fs.writeFileSync(path, content);
