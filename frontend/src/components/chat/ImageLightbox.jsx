import { X } from 'lucide-react';

export default function ImageLightbox({ src, onClose }) {
  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors"
        onClick={onClose}
      >
        <X size={24} />
      </button>
      <img 
        src={src} 
        alt="Fullscreen view" 
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
