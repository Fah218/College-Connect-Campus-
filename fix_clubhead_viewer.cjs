const fs = require('fs');
const filePath = 'src/pages/ClubHeadDashboard.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add ImageViewer import
if (!content.includes('import ImageViewer')) {
  content = content.replace(
    `import ParticipantsModal from '../components/ParticipantsModal'`,
    `import ParticipantsModal from '../components/ParticipantsModal'\nimport ImageViewer from '../components/ImageViewer'`
  );
}

// Add state variables
if (!content.includes('const [viewerImages, setViewerImages] = useState(null)')) {
  content = content.replace(
    `const [viewingParticipants, setViewingParticipants] = useState(null)`,
    `const [viewingParticipants, setViewingParticipants] = useState(null)\n  const [viewerImages, setViewerImages] = useState(null)\n  const [viewerIndex, setViewerIndex] = useState(0)`
  );
}

// Make Existing Gallery Images clickable
const oldGalleryHTML = `<div key={idx} className="relative group overflow-hidden rounded-lg border aspect-[4/3]">
                          <img src={imgUrl} alt={\`Gallery \${idx}\`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(idx)}`;

const newGalleryHTML = `<div key={idx} className="relative group overflow-hidden rounded-lg border aspect-[4/3] cursor-pointer" onClick={() => { setViewerImages(formData.additionalImages); setViewerIndex(idx); }}>
                          <img src={imgUrl} alt={\`Gallery \${idx}\`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveExistingImage(idx); }}`;

if (content.includes(oldGalleryHTML)) {
  content = content.replace(oldGalleryHTML, newGalleryHTML);
}

// Render ImageViewer at the very end of ClubHeadDashboard return
// Looking for the closing </div> of the main return
const oldReturnEnd = `      {viewingEvent && (
        <EventViewModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onEdit={() => { setEditingEvent(viewingEvent); setShowModal(true); setViewingEvent(null); }}
          onDelete={(id) => { deleteEvent(id); setViewingEvent(null); }}
        />
      )}
    </div>
  )
}`;

const newReturnEnd = `      {viewingEvent && (
        <EventViewModal
          event={viewingEvent}
          onClose={() => setViewingEvent(null)}
          onEdit={() => { setEditingEvent(viewingEvent); setShowModal(true); setViewingEvent(null); }}
          onDelete={(id) => { deleteEvent(id); setViewingEvent(null); }}
        />
      )}
      
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

if (content.includes(oldReturnEnd)) {
  content = content.replace(oldReturnEnd, newReturnEnd);
}

fs.writeFileSync(filePath, content);
console.log('Fixed ClubHeadDashboard Gallery Viewer!');
