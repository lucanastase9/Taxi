import { MapPin, Calendar, Star, DollarSign, Navigation } from 'lucide-react';
import { useState } from 'react';

export default function ClientTrips() {
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);

  const trips = [
    {
      id: 1,
      date: '2026-04-10',
      time: '14:30',
      from: '123 Main St, New York',
      to: 'Central Park, New York',
      driver: 'Michael Smith',
      car: 'Toyota Camry - ABC 1234',
      price: 18.50,
      distance: '3.2 mi',
      duration: '15 min',
      rating: 5,
      review: 'Great driver, very professional!',
    },
    {
      id: 2,
      date: '2026-04-08',
      time: '09:15',
      from: 'JFK Airport',
      to: '123 Main St, New York',
      driver: 'Sarah Johnson',
      car: 'Honda Accord - XYZ 5678',
      price: 45.00,
      distance: '15.8 mi',
      duration: '35 min',
      rating: 4,
      review: 'Good ride, arrived on time.',
    },
    {
      id: 3,
      date: '2026-04-05',
      time: '18:45',
      from: 'Times Square, New York',
      to: 'Brooklyn Bridge',
      driver: 'David Lee',
      car: 'Tesla Model 3 - DEF 9012',
      price: 22.00,
      distance: '5.1 mi',
      duration: '20 min',
      rating: 5,
      review: 'Smooth ride, great conversation!',
    },
    {
      id: 4,
      date: '2026-04-02',
      time: '12:00',
      from: 'Grand Central Terminal',
      to: 'Empire State Building',
      driver: 'Emily Chen',
      car: 'Nissan Altima - GHI 3456',
      price: 12.00,
      distance: '1.5 mi',
      duration: '8 min',
      rating: 4,
      review: null,
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="mb-8">Recent Trips & Reviews</h1>

      <div className="space-y-4">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="bg-card rounded-lg border border-border overflow-hidden transition-all hover:shadow-md"
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() => setSelectedTrip(selectedTrip === trip.id ? null : trip.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{trip.date}</span>
                    <span>•</span>
                    <span>{trip.time}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                      <span className="text-sm">{trip.from}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Navigation className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                      <span className="text-sm">{trip.to}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl mb-1">${trip.price.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {trip.distance} • {trip.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`trip-${trip.id}-star-${i}`}
                        className={`w-4 h-4 ${
                          i < trip.rating ? 'fill-accent text-accent' : 'text-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {selectedTrip === trip.id && (
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Driver:</span>
                    <span className="text-sm">{trip.driver}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Vehicle:</span>
                    <span className="text-sm">{trip.car}</span>
                  </div>
                  {trip.review && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Your review:</div>
                      <div className="text-sm bg-muted p-3 rounded-lg">{trip.review}</div>
                    </div>
                  )}
                  {!trip.review && (
                    <button className="text-sm text-accent hover:underline">
                      Add a review
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-card rounded-lg p-6 border border-border">
        <h3 className="mb-4">Trip Statistics</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl mb-1">{trips.length}</div>
            <div className="text-sm text-muted-foreground">Total Trips</div>
          </div>
          <div>
            <div className="text-2xl mb-1">
              ${trips.reduce((sum, t) => sum + t.price, 0).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </div>
          <div>
            <div className="text-2xl mb-1">
              {(trips.reduce((sum, t) => sum + parseFloat(t.distance), 0)).toFixed(1)} mi
            </div>
            <div className="text-sm text-muted-foreground">Distance Traveled</div>
          </div>
          <div>
            <div className="text-2xl mb-1">
              {(trips.reduce((sum, t) => sum + t.rating, 0) / trips.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Avg Rating Given</div>
          </div>
        </div>
      </div>
    </div>
  );
}
