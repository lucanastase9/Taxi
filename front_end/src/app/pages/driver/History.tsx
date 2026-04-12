import { useState } from 'react';
import { Calendar, DollarSign, TrendingUp, Filter, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DriverHistory() {
  const [filterPeriod, setFilterPeriod] = useState('week');
  const [showFilters, setShowFilters] = useState(false);

  const trips = [
    {
      id: 1,
      date: '2026-04-12',
      time: '14:30',
      passenger: 'Sarah Johnson',
      from: 'Times Square',
      to: 'JFK Airport',
      distance: '16.2 mi',
      duration: '42 min',
      fare: 52.00,
      tip: 8.00,
      rating: 5,
      review: 'Great driver!',
    },
    {
      id: 2,
      date: '2026-04-12',
      time: '11:15',
      passenger: 'Michael Chen',
      from: 'Brooklyn Bridge',
      to: 'Central Park',
      distance: '5.3 mi',
      duration: '18 min',
      fare: 22.50,
      tip: 4.50,
      rating: 5,
      review: null,
    },
    {
      id: 3,
      date: '2026-04-11',
      time: '18:45',
      passenger: 'Emma Davis',
      from: 'Grand Central',
      to: 'LaGuardia Airport',
      distance: '8.7 mi',
      duration: '28 min',
      fare: 38.00,
      tip: 6.00,
      rating: 4,
      review: 'Good service',
    },
    {
      id: 4,
      date: '2026-04-11',
      time: '15:20',
      passenger: 'David Martinez',
      from: 'Wall Street',
      to: 'SoHo',
      distance: '2.1 mi',
      duration: '12 min',
      fare: 14.00,
      tip: 2.00,
      rating: 5,
      review: null,
    },
    {
      id: 5,
      date: '2026-04-10',
      time: '09:00',
      passenger: 'Lisa Anderson',
      from: 'Penn Station',
      to: 'Newark Airport',
      distance: '14.5 mi',
      duration: '35 min',
      fare: 48.00,
      tip: 10.00,
      rating: 5,
      review: 'Very professional',
    },
  ];

  const weeklyEarnings = [
    { day: 'Mon', amount: 145 },
    { day: 'Tue', amount: 182 },
    { day: 'Wed', amount: 156 },
    { day: 'Thu', amount: 198 },
    { day: 'Fri', amount: 234 },
    { day: 'Sat', amount: 287 },
    { day: 'Sun', amount: 165 },
  ];

  const totalEarnings = trips.reduce((sum, trip) => sum + trip.fare + trip.tip, 0);
  const totalTrips = trips.length;
  const avgEarningsPerTrip = totalEarnings / totalTrips;
  const totalDistance = trips.reduce((sum, trip) => sum + parseFloat(trip.distance), 0);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1>Trip History</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-card rounded-lg p-6 border border-border mb-8">
          <h3 className="mb-4">Filter Options</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterPeriod('week')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterPeriod === 'week'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setFilterPeriod('month')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterPeriod === 'month'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilterPeriod('year')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterPeriod === 'year'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              This Year
            </button>
            <button
              onClick={() => setFilterPeriod('custom')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterPeriod === 'custom'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Total Earnings</span>
          </div>
          <div className="text-3xl mb-1">${totalEarnings.toFixed(2)}</div>
          <div className="flex items-center gap-1 text-sm text-accent">
            <TrendingUp className="w-4 h-4" />
            <span>+12.5% from last week</span>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Total Trips</span>
          </div>
          <div className="text-3xl mb-1">{totalTrips}</div>
          <div className="text-sm text-muted-foreground">
            {totalDistance.toFixed(1)} miles driven
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Avg per Trip</span>
          </div>
          <div className="text-3xl mb-1">${avgEarningsPerTrip.toFixed(2)}</div>
          <div className="text-sm text-muted-foreground">
            Including tips
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-2 mb-2 text-muted-foreground">
            <Star className="w-4 h-4" />
            <span className="text-sm">Avg Rating</span>
          </div>
          <div className="text-3xl mb-1">
            {(trips.reduce((sum, t) => sum + t.rating, 0) / trips.length).toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">
            From {totalTrips} trips
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border mb-8">
        <h3 className="mb-6">Weekly Earnings</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weeklyEarnings}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26, 40, 71, 0.1)" />
            <XAxis dataKey="day" stroke="#5a6b8c" tick={{ fill: '#5a6b8c' }} />
            <YAxis stroke="#5a6b8c" tick={{ fill: '#5a6b8c' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FEFDFB',
                border: '1px solid rgba(26, 40, 71, 0.15)',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="amount" fill="#D4A574" radius={[8, 8, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-lg p-6 border border-border mb-8">
        <h3 className="mb-6">Trip Details</h3>
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="mb-2">{trip.passenger}</div>
                  <div className="text-sm text-muted-foreground">
                    {trip.date} • {trip.time}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl mb-1">${(trip.fare + trip.tip).toFixed(2)}</div>
                  <div className="flex items-center gap-1 justify-end">
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

              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Route:</span>
                  <span className="ml-2">{trip.from} → {trip.to}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="ml-2">{trip.distance}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fare:</span>
                  <span className="ml-2">${trip.fare.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tip:</span>
                  <span className="ml-2 text-accent">${trip.tip.toFixed(2)}</span>
                </div>
              </div>

              {trip.review && (
                <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                  <span className="text-muted-foreground">Review: </span>
                  {trip.review}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
