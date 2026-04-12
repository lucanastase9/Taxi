import { useState } from 'react';
import { MapPin, Navigation, Calendar, Clock, Car } from 'lucide-react';
import InteractiveMap from '../../components/InteractiveMap';

interface Location {
  x: number;
  y: number;
  address: string;
}

export default function ClientNewRide() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [selectedCar, setSelectedCar] = useState('standard');
  const [scheduledTime, setScheduledTime] = useState('now');

  const carTypes = [
    { id: 'economy', name: 'Economy', price: 12, time: '3 min', capacity: 4, icon: '🚗' },
    { id: 'standard', name: 'Standard', price: 18, time: '5 min', capacity: 4, icon: '🚙' },
    { id: 'premium', name: 'Premium', price: 28, time: '7 min', capacity: 4, icon: '🚕' },
    { id: 'xl', name: 'XL', price: 35, time: '8 min', capacity: 6, icon: '🚐' },
  ];

  const handleRequestRide = () => {
    alert('Ride requested! Finding nearby drivers...');
  };

  const handlePickupSelect = (location: Location) => {
    setPickupLocation(location);
    setPickup(location.address);
  };

  const handleDestinationSelect = (location: Location) => {
    setDestinationLocation(location);
    setDestination(location.address);
  };

  const handleClearPickup = () => {
    setPickupLocation(null);
    setPickup('');
  };

  const handleClearDestination = () => {
    setDestinationLocation(null);
    setDestination('');
  };

  const handlePickupInputChange = (value: string) => {
    setPickup(value);
    if (value.length > 5) {
      // Simulate geocoding - place marker at a position based on the text
      const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      setPickupLocation({
        x: (hash % 70) + 15,
        y: (hash % 70) + 15,
        address: value,
      });
    } else if (value === '') {
      setPickupLocation(null);
    }
  };

  const handleDestinationInputChange = (value: string) => {
    setDestination(value);
    if (value.length > 5) {
      // Simulate geocoding - place marker at a position based on the text
      const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      setDestinationLocation({
        x: (hash % 70) + 15,
        y: (hash % 70) + 15,
        address: value,
      });
    } else if (value === '') {
      setDestinationLocation(null);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-2/5 p-8 overflow-auto border-r border-border">
        <h1 className="mb-6">Start New Ride</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm mb-2">Pickup Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={pickup}
                onChange={(e) => handlePickupInputChange(e.target.value)}
                placeholder="Enter pickup location or click on map"
                className="w-full pl-11 pr-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Destination</label>
            <div className="relative">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={destination}
                onChange={(e) => handleDestinationInputChange(e.target.value)}
                placeholder="Where to? (type or click on map)"
                className="w-full pl-11 pr-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">When</label>
            <div className="flex gap-2">
              <button
                onClick={() => setScheduledTime('now')}
                className={`flex-1 py-3 rounded-lg border transition-colors ${
                  scheduledTime === 'now'
                    ? 'border-accent bg-accent/10 text-primary'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <Clock className="w-4 h-4 mx-auto mb-1" />
                <div className="text-sm">Now</div>
              </button>
              <button
                onClick={() => setScheduledTime('later')}
                className={`flex-1 py-3 rounded-lg border transition-colors ${
                  scheduledTime === 'later'
                    ? 'border-accent bg-accent/10 text-primary'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <Calendar className="w-4 h-4 mx-auto mb-1" />
                <div className="text-sm">Schedule</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-3">Select Vehicle</label>
            <div className="space-y-3">
              {carTypes.map((car) => (
                <button
                  key={car.id}
                  onClick={() => setSelectedCar(car.id)}
                  className={`w-full p-4 rounded-lg border transition-all ${
                    selectedCar === car.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{car.icon}</span>
                      <div className="text-left">
                        <div className="mb-1">{car.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {car.time} away • {car.capacity} seats
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl">${car.price}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleRequestRide}
            disabled={!pickup || !destination}
            className="w-full bg-primary text-primary-foreground py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Ride
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <InteractiveMap
          pickup={pickupLocation}
          destination={destinationLocation}
          onPickupSelect={handlePickupSelect}
          onDestinationSelect={handleDestinationSelect}
          onClearPickup={handleClearPickup}
          onClearDestination={handleClearDestination}
        />
      </div>
    </div>
  );
}
