const fs = require('fs');
const path = 'backend/routes/eventRoutes.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `import { createEvent, getEvents, updateEvent } from '../controllers/eventController.js';`,
  `import { createEvent, getEvents, updateEvent, deleteEvent } from '../controllers/eventController.js';\nimport { upload } from '../middleware/uploadMiddleware.js';`
);

content = content.replace(
  `router.post('/create', createEvent);`,
  `router.post('/create', upload.fields([{ name: 'bannerImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 5 }]), createEvent);`
);

content = content.replace(
  `router.put('/:id', updateEvent);`,
  `router.put('/:id', upload.fields([{ name: 'bannerImage', maxCount: 1 }, { name: 'additionalImages', maxCount: 5 }]), updateEvent);`
);

if (!content.includes('router.delete')) {
  content = content.replace(
    `export default router;`,
    `// Delete an event\nrouter.delete('/:id', deleteEvent);\n\nexport default router;`
  );
}

fs.writeFileSync(path, content);
console.log("Patched eventRoutes.js");
