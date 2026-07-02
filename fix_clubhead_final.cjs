const fs = require('fs');
const filePath = 'src/pages/ClubHeadDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Insert ImageViewer render just before the final </div>
const oldEnd = `      </div>
    </div>
  )
}`;

const newEnd = `      </div>
      {/* Fullscreen ImageViewer */}
      {viewerImages && (
        <ImageViewer 
          images={viewerImages} 
          initialIndex={viewerIndex} 
          onClose={() => setViewerImages(null)} 
        />
      )}
    </div>
  )
}`;

if (content.includes(oldEnd)) {
  content = content.replace(oldEnd, newEnd);
  fs.writeFileSync(filePath, content);
  console.log("Successfully fixed ClubHeadDashboard ImageViewer rendering!");
} else {
  console.log("Failed to find the end of ClubHeadDashboard component");
}
