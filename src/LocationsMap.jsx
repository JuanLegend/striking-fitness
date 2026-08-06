import { useEffect, useRef, useState } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function LocationsMap({ locations, selectedId, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRefs = useRef(new Map());
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;

    const initialize = async () => {
      try {
        const maplibre = await import('maplibre-gl');
        if (disposed || !containerRef.current) return;

        const map = new maplibre.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {
              openStreetMap: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors',
              },
            },
            layers: [{ id: 'openStreetMap', type: 'raster', source: 'openStreetMap' }],
          },
          center: [-76.5389, 3.4253],
          zoom: 13.4,
          pitch: 38,
          bearing: -9,
          attributionControl: false,
        });

        map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), 'bottom-right');
        map.addControl(new maplibre.AttributionControl({ compact: true }), 'bottom-left');
        map.on('error', (event) => {
          if (event.error) console.error(`[Striking Fitness map] ${event.error.message}`);
        });

        locations.forEach((location, index) => {
          const markerElement = document.createElement('button');
          markerElement.type = 'button';
          markerElement.className = `sf-map-marker${location.id === selectedId ? ' active' : ''}`;
          markerElement.setAttribute('aria-label', `Ver ${location.name}`);
          markerElement.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span>`;
          markerElement.addEventListener('click', () => onSelect(location.id));

          const popup = new maplibre.Popup({ offset: 28, closeButton: false, className: 'sf-map-popup' })
            .setText(`${location.name} · ${location.address}`);

          const marker = new maplibre.Marker({ element: markerElement, anchor: 'center' })
            .setLngLat(location.coordinates)
            .setPopup(popup)
            .addTo(map);

          markerRefs.current.set(location.id, { marker, markerElement, popup });
        });

        map.on('load', () => {
          if (!disposed) map.resize();
        });
        mapRef.current = map;
      } catch {
        if (!disposed) setFailed(true);
      }
    };

    initialize();
    return () => {
      disposed = true;
      markerRefs.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [locations, onSelect]);

  useEffect(() => {
    const location = locations.find((item) => item.id === selectedId);
    const markerData = markerRefs.current.get(selectedId);
    if (!location || !mapRef.current) return;

    markerRefs.current.forEach(({ markerElement, popup }, id) => {
      markerElement.classList.toggle('active', id === selectedId);
      if (id !== selectedId && popup.isOpen()) popup.remove();
    });

    mapRef.current.flyTo({ center: location.coordinates, zoom: 15.35, pitch: 44, bearing: selectedId === 'cedro' ? -12 : 10, duration: 1200, essential: true });
    if (markerData && !markerData.popup.isOpen()) markerData.popup.setLngLat(location.coordinates).addTo(mapRef.current);
  }, [locations, selectedId]);

  if (failed) {
    return (
      <div className="map-fallback" role="status">
        <span>Mapa no disponible</span>
        <p>Puedes abrir la ubicación de cada sede con los enlaces de navegación.</p>
      </div>
    );
  }

  return <div className="locations-map" ref={containerRef} aria-label="Mapa interactivo de las sedes Striking Fitness" />;
}
