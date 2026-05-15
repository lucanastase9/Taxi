import { MapPin, Calendar, Star, Navigation } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ClientTrips() {
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Preluăm istoricul din baza de date când componenta se montează
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const clientId = savedUser.id_client || savedUser.id;

        if (!clientId) {
          console.error("Clientul nu este logat.");
          setLoading(false);
          return;
        }

        const response = await fetch(`https://untitled-i7lc.onrender.com`);
        if (response.ok) {
          const data = await response.json();
          setTrips(data);
        }
      } catch (error) {
        console.error("Eroare la conexiunea cu serverul:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Se încarcă istoricul curselor...</div>;
  }

  return (
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="mb-8 font-bold text-2xl text-gray-800">Recent Trips & Reviews</h1>

        {trips.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-xl border border-gray-100 text-gray-500">
              Nu ai nicio cursă finalizată momentan.
            </div>
        ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                  <div
                      key={trip.id}
                      className="bg-card rounded-lg border border-border overflow-hidden transition-all hover:shadow-md bg-white"
                  >
                    <div
                        className="p-6 cursor-pointer"
                        onClick={() => setSelectedTrip(selectedTrip === trip.id ? null : trip.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{trip.date}</span>
                            <span>•</span>
                            <span>{trip.time || 'Ora necunoscută'}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-700">{trip.from}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Navigation className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-700">{trip.to}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold mb-1 text-gray-800">{trip.price?.toFixed(2)} LEI</div>
                          <div className="text-sm text-gray-500 mb-2">
                            {trip.distance} km
                          </div>
                        </div>
                      </div>

                      {selectedTrip === trip.id && (
                          <div className="pt-4 border-t border-gray-100 space-y-3 bg-gray-50 p-4 rounded-b-lg mt-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Șofer:</span>
                              <span className="text-sm text-gray-800">{trip.driver}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Vehicul:</span>
                              <span className="text-sm text-gray-800">{trip.car}</span>
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* SECȚIUNEA DE STATISTICI DINAMICE */}
        {trips.length > 0 && (
            <div className="mt-8 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h3 className="mb-4 font-bold text-gray-800">Trip Statistics</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">{trips.length}</div>
                  <div className="text-sm text-gray-500">Total Curse</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {trips.reduce((sum, t) => sum + (t.price || 0), 0).toFixed(2)} LEI
                  </div>
                  <div className="text-sm text-gray-500">Total Cheltuit</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {(trips.reduce((sum, t) => sum + parseFloat(t.distance || 0), 0)).toFixed(1)} km
                  </div>
                  <div className="text-sm text-gray-500">Distanță Parcursă</div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}