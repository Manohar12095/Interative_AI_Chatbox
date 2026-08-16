import { X, FileText, Image as ImageIcon, Film, Music, Code } from 'lucide-react';

export default function AttachmentChip({ file, onRemove }) {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');
  const isPdf = file.type === 'application/pdf';
  const isCode = file.name.match(/\.(js|py|json|html|css|jsx|ts|tsx)$/i);

  let Icon = FileText;
  if (isImage) Icon = ImageIcon;
  else if (isVideo) Icon = Film;
  else if (isAudio) Icon = Music;
  else if (isCode) Icon = Code;

  return (
    <div
      className="relative flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] group animate-fade-slide-up"
      style={{
        background: 'var(--bg-card-hover)',
        border: '1px solid var(--border-glass)',
        color: 'var(--text-primary)',
        overflow: 'hidden'
      }}
    >
      {/* Progress Background */}
      {file.progress !== undefined && file.progress < 100 && (
        <div
          className="absolute left-0 top-0 bottom-0 bg-[var(--brand-primary-light)] opacity-20 transition-all duration-300"
          style={{ width: `${file.progress}%` }}
        />
      )}

      {/* Thumbnail or Icon */}
      <div className="relative z-10 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-black/20">
        {isImage && file.previewUrl ? (
          <img src={file.previewUrl} alt="preview" className="w-full h-full object-cover rounded" />
        ) : (
          <Icon size={12} style={{ color: isPdf ? '#FF4560' : 'var(--accent)' }} />
        )}
        
        {/* Progress Ring overlay for images/icons */}
        {file.progress !== undefined && file.progress < 100 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
            <svg className="w-4 h-4 transform -rotate-90">
              <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
              <circle
                cx="8" cy="8" r="6" stroke="white" strokeWidth="2" fill="none"
                strokeDasharray="37.7"
                strokeDashoffset={37.7 - (37.7 * file.progress) / 100}
                className="transition-all duration-300"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col justify-center max-w-[120px]">
        <span className="truncate font-medium leading-tight">{file.name}</span>
        <span className="text-[9px] leading-tight" style={{ color: 'var(--text-muted)' }}>
          {file.progress === 100 || file.progress === undefined
            ? `${(file.size / 1024).toFixed(1)} KB`
            : `${file.progress}%`}
        </span>
      </div>

      <button
        onClick={onRemove}
        className="relative z-10 p-0.5 rounded-md opacity-50 hover:opacity-100 hover:bg-white/10 transition-all"
      >
        <X size={12} />
      </button>
    </div>
  );
}
