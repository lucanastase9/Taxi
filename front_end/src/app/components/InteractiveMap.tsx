import { useState, useRef } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';

interface Location {
  x: number;
  y: number;
  address: string;
}

interface InteractiveMapProps {
  pickup: Location | null;
  destination: Location | null;
  onPickupSelect: (location: Location) => void;
  onDestinationSelect: (location: Location) => void;
  onClearPickup: () => void;
  onClearDestination: () => void;
}

export default function InteractiveMap({
  pickup,
  destination,
  onPickupSelect,
  onDestinationSelect,
  onClearPickup,
  onClearDestination,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  const streets = [
    { name: 'Broadway', x1: 20, y1: 0, x2: 20, y2: 100 },
    { name: '5th Ave', x1: 40, y1: 0, x2: 40, y2: 100 },
    { name: 'Park Ave', x1: 60, y1: 0, x2: 60, y2: 100 },
    { name: 'Madison Ave', x1: 80, y1: 0, x2: 80, y2: 100 },
    { name: '42nd St', x1: 0, y1: 25, x2: 100, y2: 25 },
    { name: '34th St', x1: 0, y1: 50, x2: 100, y2: 50 },
    { name: '23rd St', x1: 0, y1: 75, x2: 100, y2: 75 },
  ];

  const landmarks = [
    { name: 'Central Park', x: 70, y: 15, icon: '🌳' },
    { name: 'Times Square', x: 45, y: 40, icon: '🏙️' },
    { name: 'Empire State', x: 35, y: 55, icon: '🏢' },
    { name: 'Brooklyn Bridge', x: 25, y: 85, icon: '🌉' },
  ];

  const getAddressFromPosition = (x: number, y: number): string => {
    const streets = ['Broadway', '5th Ave', 'Park Ave', 'Madison Ave', 'Lexington Ave'];
    const crossStreets = ['14th St', '23rd St', '34th St', '42nd St', '50th St', '59th St'];

    const streetIndex = Math.floor((x / 100) * streets.length);
    const crossStreetIndex = Math.floor((y / 100) * crossStreets.length);

    return `${streets[streetIndex]} & ${crossStreets[crossStreetIndex]}, New York`;
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const address = getAddressFromPosition(x, y);
    const location: Location = { x, y, address };

    if (!pickup) {
      onPickupSelect(location);
    } else if (!destination) {
      onDestinationSelect(location);
    }
  };

  return (
    <div className="relative h-full">
      <div
        ref={mapRef}
        className="absolute inset-0 bg-[#E8DCC8] cursor-crosshair"
        onClick={handleMapClick}
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid pattern */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(26, 40, 71, 0.05)" strokeWidth="0.2"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />

          {/* Streets */}
          {streets.map((street, i) => (
            <line
              key={`street-${i}`}
              x1={street.x1}
              y1={street.y1}
              x2={street.x2}
              y2={street.y2}
              stroke="#1a2847"
              strokeWidth="0.3"
              opacity="0.3"
            />
          ))}

          {/* Route line */}
          {pickup && destination && (
            <>
              <line
                x1={pickup.x}
                y1={pickup.y}
                x2={destination.x}
                y2={destination.y}
                stroke="#D4A574"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              <line
                x1={pickup.x}
                y1={pickup.y}
                x2={destination.x}
                y2={destination.y}
                stroke="#D4A574"
                strokeWidth="0.8"
                opacity="0.3"
              />
            </>
          )}

          {/* Pickup marker */}
          {pickup && (
            <g>
              <circle cx={pickup.x} cy={pickup.y} r="2" fill="#4ade80" opacity="0.3" />
              <circle cx={pickup.x} cy={pickup.y} r="1.2" fill="#22c55e" />
              <circle cx={pickup.x} cy={pickup.y} r="0.5" fill="white" />
            </g>
          )}

          {/* Destination marker */}
          {destination && (
            <g>
              <circle cx={destination.x} cy={destination.y} r="2" fill="#f87171" opacity="0.3" />
              <circle cx={destination.x} cy={destination.y} r="1.2" fill="#ef4444" />
              <circle cx={destination.x} cy={destination.y} r="0.5" fill="white" />
            </g>
          )}
        </svg>

        {/* Landmarks */}
        {landmarks.map((landmark, i) => (
          <div
            key={`landmark-${i}`}
            className="absolute text-2xl pointer-events-none"
            style={{
              left: `${landmark.x}%`,
              top: `${landmark.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {landmark.icon}
          </div>
        ))}

        {/* Pickup label */}
        {pickup && (
          <div
            className="absolute bg-card border border-border rounded-lg px-3 py-2 shadow-lg pointer-events-none"
            style={{
              left: `${pickup.x}%`,
              top: `${pickup.y}%`,
              transform: 'translate(-50%, -130%)',
            }}
          >
            <div className="flex items-center gap-2 whitespace-nowrap">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-sm">Pickup</span>
            </div>
          </div>
        )}

        {/* Destination label */}
        {destination && (
          <div
            className="absolute bg-card border border-border rounded-lg px-3 py-2 shadow-lg pointer-events-none"
            style={{
              left: `${destination.x}%`,
              top: `${destination.y}%`,
              transform: 'translate(-50%, -130%)',
            }}
          >
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Navigation className="w-4 h-4 text-red-500" />
              <span className="text-sm">Destination</span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions overlay */}
      {!pickup && !destination && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-card/90 backdrop-blur-sm rounded-lg p-6 border border-border">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="mb-2">Click on the map</h3>
            <p className="text-sm text-muted-foreground">
              First click sets pickup location<br />
              Second click sets destination
            </p>
          </div>
        </div>
      )}

      {/* Clear buttons */}
      {(pickup || destination) && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {pickup && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearPickup();
              }}
              className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg hover:bg-muted transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="text-sm">Clear Pickup</span>
              <X className="w-4 h-4" />
            </button>
          )}
          {destination && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearDestination();
              }}
              className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-red-500" />
              <span className="text-sm">Clear Destination</span>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Distance indicator */}
      {pickup && destination && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
          <div className="text-sm text-muted-foreground">Estimated distance</div>
          <div className="text-center">
            {(Math.sqrt(
              Math.pow(destination.x - pickup.x, 2) + Math.pow(destination.y - pickup.y, 2)
            ) * 0.1).toFixed(1)} mi
          </div>
        </div>
      )}
    </div>
  );
}
