const fs = require('fs');
let content = fs.readFileSync('src/pages/ClubHeadDashboard.jsx', 'utf8');

// Add isSubmitting state to EventModal
content = content.replace(
  `  const [formData, setFormData] = useState(event || {`,
  `  const [isSubmitting, setIsSubmitting] = useState(false);\n  const [formData, setFormData] = useState(event || {`
);

// Update handleSubmit
const newSubmit = `  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const finalData = {
      ...formData,
      date: formData.startDate,
      time: formData.startTime,
      capacity: formData.maxParticipants || formData.capacity
    }
    try {
      await onSubmit(finalData)
    } finally {
      setIsSubmitting(false)
    }
  }`;

content = content.replace(
  /const handleSubmit = \(e\) => \{[\s\S]*?onSubmit\(finalData\)\s*\}/,
  newSubmit
);

// Update the submit button UI in EventModal
content = content.replace(
  `<button type="submit" className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700">`,
  `<button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}`
);
content = content.replace(
  `{event ? 'Update Event' : 'Submit Event'}`,
  `{isSubmitting ? 'Processing...' : event ? 'Update Event' : 'Submit Event'}`
);

fs.writeFileSync('src/pages/ClubHeadDashboard.jsx', content);
