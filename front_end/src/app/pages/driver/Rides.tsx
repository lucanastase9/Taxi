import { useState, useEffect } from 'react';
import { MapPin, Navigation, DollarSign, Clock, User } from 'lucide-react';
import RideNotification from '../../components/RideNotification';

export default function DriverRides() {
  const [showNotification, setShowNotification] = useState(false);
  const [selectedRide, setSelectedRide] = useState<number | null>(null);

  const nearbyRide = {
    pickup: '789 Broadway, New York',
    destination: 'Madison Square Garden',
    distance: '2.3 mi',
    fare: 15.50,
    passengerName: 'Jessica Brown',
  };

  const availableRides = [
    {
      id: 1,
      passengerName: 'Jessica Brown',
      pickup: '789 Broadway, New York',
      destination: 'Madison Square Garden',
      distance: '2.3 mi',
      estimatedFare: 15.50,
      requestedTime: '5 min ago',
      passengerRating: 4.9,
      distanceFromDriver: '0.8 km',
    },
    {
      id: 2,
      passengerName: 'Michael Chen',
      pickup: 'Penn Station, New York',
      destination: 'LaGuardia Airport',
      distance: '8.5 mi',
      estimatedFare: 42.00,
      requestedTime: '8 min ago',
      passengerRating: 4.7,
      distanceFromDriver: '1.2 km',
    },
    {
      id: 3,
      passengerName: 'Emma Davis',
      pickup: 'Wall Street, New York',
      destination: 'Brooklyn Heights',
      distance: '4.1 mi',
      estimatedFare: 22.50,
      requestedTime: '12 min ago',
      passengerRating: 5.0,
      distanceFromDriver: '2.5 km',
    },
    {
      id: 4,
      passengerName: 'David Martinez',
      pickup: 'Central Park West',
      destination: 'Rockefeller Center',
      distance: '1.8 mi',
      estimatedFare: 12.00,
      requestedTime: '15 min ago',
      passengerRating: 4.8,
      distanceFromDriver: '3.1 km',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleAcceptRide = () => {
    setShowNotification(false);
    alert('Ride accepted! Navigate to pickup location.');
  };

  const handleAcceptFromList = (rideId: number) => {
    alert(`Ride ${rideId} accepted! Navigate to pickup location.`);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <RideNotification
        show={showNotification}
        onClose={() => setShowNotification(false)}
        onAccept={handleAcceptRide}
        ride={nearbyRide}
      />

      <div className="flex items-center justify-between mb-8">
        <h1>Available Rides</h1>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">Online</span>
        </div>
      </div>

      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="mb-1">You're in a high-demand area</div>
            <div className="text-sm text-muted-foreground">
              More ride requests expected in the next hour
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {availableRides.map((ride) => (
          <div
            key={ride.id}
            className="bg-card rounded-lg border border-border overflow-hidden transition-all hover:shadow-md"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-lg text-primary">
                    {ride.passengerName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="mb-1">{ride.passengerName}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>⭐ {ride.passengerRating}</span>
                      <span>•</span>
                      <span>{ride.distanceFromDriver} away</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl mb-1">${ride.estimatedFare.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">{ride.distance}</div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Pickup</div>
                    <div className="text-sm">{ride.pickup}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-muted-foreground">Destination</div>
                    <div className="text-sm">{ride.destination}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Requested {ride.requestedTime}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedRide(selectedRide === ride.id ? null : ride.id)}
                    className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleAcceptFromList(ride.id)}
                    className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Accept
                  </button>
                </div>
              </div>

              {selectedRide === ride.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Estimated duration:</span>
                      <span className="ml-2">18 min</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Traffic:</span>
                      <span className="ml-2 text-accent">Light</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Surge pricing:</span>
                      <span className="ml-2">None</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Passenger notes:</span>
                      <span className="ml-2">None</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {availableRides.length === 0 && (
        <div className="text-center py-16">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2">No rides available</h3>
          <p className="text-sm text-muted-foreground">
            Check back soon or move to a busier area
          </p>
        </div>
      )}
    </div>
  );
}
