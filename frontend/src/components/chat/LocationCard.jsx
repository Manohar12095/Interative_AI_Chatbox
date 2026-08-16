/**
 * LocationCard — renders an embedded map and Google Maps link for a location attachment.
 * Expects: { type: "location", name, lat, lng, map_url, description? }
 */
export default function LocationCard({ location }) {
  const { name, lat, lng, map_url, description } = location;

  const embedUrl = lat && lng
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(name)}&output=embed`;

  const mapsLink = map_url || (lat && lng
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`);

  return (
    <div
      className="rounded-2xl overflow-hidden mt-2"
      style={{ border: '1px solid var(--border-glass)', background: 'var(--bg-card)' }}
    >
      {/* Map embed */}
      <div className="relative" style={{ height: '200px' }}>
        <iframe
          title={name}
          src={embedUrl}
          width="100%"
          height="200"
          style={{ border: 'none', display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>
            📍 {name}
          </p>
          {description && (
            <p className="text-[11px] mt-0.5 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {description}
            </p>
          )}
        </div>
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
          style={{ background: 'var(--accent-gradient)', whiteSpace: 'nowrap' }}
        >
          🗺️ Open Maps
        </a>
      </div>
    </div>
  );
}
