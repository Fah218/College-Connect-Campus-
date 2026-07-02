const fs = require('fs');
const filePath = 'src/pages/HackathonPage.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the lucide-react import line to include Maximize2
content = content.replace(
  `import { Calendar, Clock, Users, Trophy, Search, X, SlidersHorizontal, ChevronRight, Check } from 'lucide-react'`,
  `import { Calendar, Clock, Users, Trophy, Search, X, SlidersHorizontal, ChevronRight, Check, Maximize2 } from 'lucide-react'`
);

fs.writeFileSync(filePath, content);
console.log('Fixed HackathonPage.jsx import!');
