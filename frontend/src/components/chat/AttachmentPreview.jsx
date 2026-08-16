import { FileText, Download, Play, Music, Code as CodeIcon } from 'lucide-react';
import CodeBlock from './CodeBlock';
import { useState } from 'react';

export default function AttachmentPreview({ file, onImageClick }) {
  const isImage = file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isVideo = file.type?.startsWith('video/') || file.name?.match(/\.(mp4|webm|mov)$/i);
  const isAudio = file.type?.startsWith('audio/') || file.name?.match(/\.(mp3|wav|ogg)$/i);
  const isPdf = file.type === 'application/pdf' || file.name?.endsWith('.pdf');
  const isCode = file.name?.match(/\.(js|py|json|html|css|jsx|ts|tsx)$/i);

  if (isImage) {
    return (
      <div 
        className="relative group cursor-pointer mb-2 rounded-xl overflow-hidden border"
        style={{ borderColor: 'var(--border-subtle)', maxWidth: '240px', maxHeight: '240px' }}
        onClick={() => onImageClick && onImageClick(file.url || file.previewUrl)}
      >
        <img 
          src={file.url || file.previewUrl} 
          alt={file.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="mb-2 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border-subtle)', maxWidth: '320px' }}>
        <video controls className="w-full" src={file.url || file.previewUrl} />
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="mb-2 p-2 rounded-xl border flex items-center gap-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-hover)', maxWidth: '320px' }}>
        <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] flex items-center justify-center flex-shrink-0 text-white">
          <Music size={14} />
        </div>
        <audio controls className="w-full h-8" src={file.url || file.previewUrl} />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="mb-2 p-3 rounded-xl border flex items-center justify-between gap-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-hover)', maxWidth: '280px' }}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded bg-red-500/10 text-red-500">
            <FileText size={16} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-medium truncate">{file.name}</span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              PDF Document • {(file.size / 1024 / 1024).toFixed(1)} MB
            </span>
          </div>
        </div>
        {file.url && (
          <a href={file.url} download target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <Download size={14} />
          </a>
        )}
      </div>
    );
  }

  if (isCode && file.content) {
    return (
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1 px-1">
          <CodeIcon size={12} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{file.name}</span>
        </div>
        <CodeBlock language={file.name.split('.').pop()} code={file.content} />
      </div>
    );
  }

  // Fallback for generic files
  return (
    <div className="mb-2 p-2.5 rounded-xl border flex items-center gap-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-card-hover)', maxWidth: '240px' }}>
      <FileText size={14} style={{ color: 'var(--accent)' }} />
      <span className="text-[12px] truncate">{file.name}</span>
    </div>
  );
}
