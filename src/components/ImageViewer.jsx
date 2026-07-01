import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

export default function ImageViewer({ images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images]);

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2">
        <X size={32} />
      </button>

      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrev} 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 z-10 bg-black/50 rounded-full"
          >
            <ChevronLeft size={32} />
          </button>
          
          <button 
            onClick={handleNext} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 p-2 z-10 bg-black/50 rounded-full"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center">
        <img 
          src={images[currentIndex]} 
          alt={`View ${currentIndex + 1}`} 
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
          onClick={e => e.stopPropagation()} 
        />
        {images.length > 1 && (
          <div className="absolute bottom-[-30px] text-white/70 text-sm tracking-widest font-mono">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}
