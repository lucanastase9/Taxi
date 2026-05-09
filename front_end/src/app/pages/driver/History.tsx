import { useState, useEffect } from 'react';
import { Calendar, DollarSign, TrendingUp, Gift } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DriverHistory() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const driverId = savedUser.id_sofer || savedUser.id;

      if (!driverId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5050/api/driver-history/${driverId}`, {
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setTrips(data);
      }
    } catch (err) {
      console.error("Error fetching trip history:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- CALCULE DINAMICE BAZATE PE BAZA DE DATE ---
  const totalEarnings = trips.reduce((sum, trip) => sum + (Number(trip.fare) || 0) + (Number(trip.tip) || 0), 0);
  const totalTips = trips.reduce((sum, trip) => sum + (Number(trip.tip) || 0), 0);
  const totalTrips = trips.length;
  const avgEarningsPerTrip = totalTrips > 0 ? totalEarnings / totalTrips : 0;
  const totalDistance = trips.reduce((sum, trip) => sum + (Number(trip.distance) || 0), 0);

  // --- GENERARE GRAFIC (Grupat pe zilele săptămânii) ---
  const generateChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = [
      { day: 'Mon', amount: 0 }, { day: 'Tue', amount: 0 }, { day: 'Wed', amount: 0 },
      { day: 'Thu', amount: 0 }, { day: 'Fri', amount: 0 }, { day: 'Sat', amount: 0 },
      { day: 'Sun', amount: 0 }
    ];

    trips.forEach(trip => {
      if (trip.date) {
        const dateObj = new Date(trip.date);
        const dayName = days[dateObj.getDay()];
        const earnings = (Number(trip.fare) || 0) + (Number(trip.tip) || 0);

        const dayEntry = chartData.find(d => d.day === dayName);
        if (dayEntry) {
          dayEntry.amount += earnings;
        }
      }
    });
    return chartData;
  };

  const weeklyEarnings = generateChartData();

  if (loading) return <div className="p-8 text-center text-primary font-bold text-lg">Loading history...</div>;

  return (
      <div className="p-8 max-w-6xl mx-auto pb-24">
        {/* AM ELIMINAT BUTONUL ȘI STAREA DE FILTRE CONFORM CERINȚEI */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Trip History</h1>
        </div>

        {/* CARDURI DE STATISTICI */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">Total Earnings</span>
            </div>
            <div className="text-3xl font-light text-primary mb-1">{totalEarnings.toFixed(2)} lei</div>
            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>All completed trips</span>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">Total Trips</span>
            </div>
            <div className="text-3xl font-light text-primary mb-1">{totalTrips}</div>
            <div className="text-sm text-muted-foreground font-medium">
              {totalDistance.toFixed(1)} km driven
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">Avg per Trip</span>
            </div>
            <div className="text-3xl font-light text-primary mb-1">{avgEarningsPerTrip.toFixed(2)} lei</div>
            <div className="text-sm text-muted-foreground font-medium">
              Including tips
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
              <Gift className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold uppercase tracking-wide">Total Tips</span>
            </div>
            <div className="text-3xl font-light text-primary mb-1">{totalTips.toFixed(2)} lei</div>
            <div className="text-sm text-muted-foreground font-medium">
              Received from clients
            </div>
          </div>
        </div>

        {/* GRAFIC SĂPTĂMÂNAL (Calculat dinamic) */}
        <div className="bg-card rounded-lg p-8 border border-border mb-8 shadow-sm">
          <h3 className="mb-6 text-xl font-bold">Weekly Earnings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyEarnings}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26, 40, 71, 0.1)" vertical={false} />
              <XAxis dataKey="day" stroke="#5a6b8c" tick={{ fill: '#5a6b8c', fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#5a6b8c" tick={{ fill: '#5a6b8c' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value} lei`} />
              <Tooltip
                  cursor={{ fill: 'rgba(212, 165, 116, 0.1)' }}
                  contentStyle={{
                    backgroundColor: '#FEFDFB',
                    border: '1px solid rgba(26, 40, 71, 0.15)',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    color: '#1A2847'
                  }}
                  formatter={(value: number) => [`${value.toFixed(2)} lei`, 'Earnings']}
              />
              <Bar dataKey="amount" fill="#D4A574" radius={[6, 6, 0, 0]} isAnimationActive={true} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LISTA CURSELOR DINAMICĂ */}
        <div className="bg-card rounded-lg p-8 border border-border shadow-sm">
          <h3 className="mb-6 text-xl font-bold">Trip Details</h3>

          {trips.length === 0 ? (
              <p className="text-muted-foreground italic text-center py-8">Nu ai nicio cursă finalizată încă.</p>
          ) : (
              <div className="space-y-6">
                {trips.map((trip) => {
                  const tripDate = new Date(trip.date).toLocaleDateString();
                  const totalAmount = (Number(trip.fare) || 0) + (Number(trip.tip) || 0);

                  return (
                      <div key={trip.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-lg text-primary font-bold">
                              {trip.passenger ? trip.passenger[0].toUpperCase() : 'C'}
                            </div>
                            <div>
                              <div className="mb-1 font-bold text-lg text-foreground">{trip.passenger}</div>
                              <div className="text-sm font-medium text-muted-foreground">
                                {tripDate} • {trip.time}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-light text-primary">{totalAmount.toFixed(2)} lei</div>
                            <span className="text-xs font-bold uppercase tracking-widest text-green-600 bg-green-100 px-3 py-1 rounded-full">Completed</span>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-4 gap-4 text-sm bg-muted/40 p-4 rounded-lg">
                          <div className="md:col-span-2">
                            <span className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">Route:</span>
                            <span className="ml-2 font-medium">Zona {trip.from_zone} → Zona {trip.to_zone}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">Distance:</span>
                            <span className="ml-2 font-medium">{trip.distance} km</span>
                          </div>
                          <div className="text-right">
                            <span className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">Fare + Tip:</span>
                            <span className="ml-2 font-medium">{Number(trip.fare).toFixed(2)} lei + <span className="text-accent">{Number(trip.tip).toFixed(2)} lei</span></span>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
          )}
        </div>
      </div>
  );
}