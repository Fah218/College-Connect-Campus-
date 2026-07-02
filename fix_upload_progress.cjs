const fs = require('fs');
const filePath = 'src/store/eventStore.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add uploadProgress to initial state
if (!content.includes('uploadProgress: 0,')) {
  content = content.replace(
    `isLoading: false,`,
    `isLoading: false,\n  uploadProgress: 0,`
  );
}

// 2. Add onUploadProgress to addEvent
const oldAxiosPost = `const response = await axios.post('http://localhost:5001/api/events/create', fd);`;
const newAxiosPost = `const response = await axios.post('http://localhost:5001/api/events/create', fd, {
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              set({ uploadProgress: percentCompleted });
            }
          });
          set({ uploadProgress: 0 });`;

if (content.includes(oldAxiosPost)) {
  content = content.replace(oldAxiosPost, newAxiosPost);
}

// 3. Add onUploadProgress to updateEvent
const oldAxiosPut = `const response = await axios.put(\`http://localhost:5001/api/events/\${id}\`, fd, {
              // axios automatically sets multipart boundary
            });`;
const newAxiosPut = `const response = await axios.put(\`http://localhost:5001/api/events/\${id}\`, fd, {
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                set({ uploadProgress: percentCompleted });
              }
            });
            set({ uploadProgress: 0 });`;

if (content.includes(oldAxiosPut)) {
  content = content.replace(oldAxiosPut, newAxiosPut);
}

fs.writeFileSync(filePath, content);
console.log('Added upload progress to eventStore!');
