const fs = require('fs');

// 1. Fix analyticsRoutes.js
const routesFile = 'backend/routes/analyticsRoutes.js';
fs.writeFileSync(routesFile, `
import express from 'express';
import { getStudentAnalytics, getClubHeadAnalytics, getAdminAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/student', getStudentAnalytics);
router.get('/clubhead', getClubHeadAnalytics);
router.get('/admin', getAdminAnalytics);

export default router;
`);

// 2. Fix analyticsController.js
const controllerFile = 'backend/controllers/analyticsController.js';
let controllerContent = fs.readFileSync(controllerFile, 'utf8');

controllerContent = controllerContent.replace(
  /const userId = req\.user\._id;/,
  `const userId = req.query.userId;\n    if (!userId) return res.status(400).json({ message: 'User ID is required' });`
);

controllerContent = controllerContent.replace(
  /const clubId = req\.user\._id;/,
  `const clubId = req.query.clubId;\n    if (!clubId) return res.status(400).json({ message: 'Club ID is required' });`
);

fs.writeFileSync(controllerFile, controllerContent);

// 3. Fix frontend analyticsStore.js to pass IDs
const storeFile = 'src/store/analyticsStore.js';
let storeContent = fs.readFileSync(storeFile, 'utf8');

storeContent = storeContent.replace(
  /fetchStudentAnalytics: async \(\) => \{/,
  `fetchStudentAnalytics: async (userId) => {\n    if (!userId) return;`
);
storeContent = storeContent.replace(
  /api\.get\('\/analytics\/student'\)/,
  `api.get(\`/analytics/student?userId=\${userId}\`)`
);

storeContent = storeContent.replace(
  /fetchClubHeadAnalytics: async \(\) => \{/,
  `fetchClubHeadAnalytics: async (clubId) => {\n    if (!clubId) return;`
);
storeContent = storeContent.replace(
  /api\.get\('\/analytics\/clubhead'\)/,
  `api.get(\`/analytics/clubhead?clubId=\${clubId}\`)`
);

fs.writeFileSync(storeFile, storeContent);

console.log('Fixed auth handling in analytics.');
