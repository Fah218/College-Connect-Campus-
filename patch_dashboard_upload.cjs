const fs = require('fs');
const path = 'src/pages/ClubHeadDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }`,
  `  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [field + 'File']: file });
    }
  }`
);

// We need to change the EventModal handleSubmit call to use FormData but wait, 
// the handleSubmit takes formData and calls updateEvent/addEvent.
// Those methods are in eventStore.js. It's much easier to intercept it inside eventStore.js!

fs.writeFileSync(path, content);
console.log("Patched handleImageUpload in ClubHeadDashboard.jsx");
