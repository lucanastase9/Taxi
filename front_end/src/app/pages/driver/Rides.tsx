import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, CheckCircle2, AlertTriangle, Star } from 'lucide-react';
import RideNotification from '../../components/RideNotification';

export default function DriverRides() {
  const [showNotification, setShowNotification] = useState(false);
  const [selectedRide, setSelectedRide] = useState<number | null>(null);

  // Stări pentru baza de date
  const [driverId, setDriverId] = useState<number | null>(null);
  const [availableRides, setAvailableRides] = useState<any[]>([]);
  const [activeRide, setActiveRide] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Stări pentru Recenzie
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    // Luăm ID-ul șoferului din LocalStorage
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const id = savedUser.id_sofer || savedUser.id;
    if (id) {
      setDriverId(id);
      loadDashboardData(id);
    } else {
      setLoading(false);
    }
  }, []);

  const loadDashboardData = async (id: number) => {
    setLoading(true);
    await checkActiveRide(id);
    await fetchAvailableRides();
    setLoading(false);
  };

  const fetchAvailableRides = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const categorieSofer = savedUser.categorie;

      const response = await fetch(`https://untitled-i7lc.onrender.com`, {
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableRides(data);
      }
    } catch (err) {
      console.error("Error fetching available rides:", err);
    }
  };

  const checkActiveRide = async (id: number) => {
    try {
      const response = await fetch(`https://untitled-i7lc.onrender.com`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setActiveRide(data); // Dacă are cursă activă, o setăm
      }
    } catch (err) {
      console.error("Error checking active ride:", err);
    }
  };

  // Logica pentru ACCEPTARE cursă
  const handleAcceptFromList = async (id_cursa: number) => {
    if (!driverId) return;

    try {
      const response = await fetch('https://untitled-i7lc.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_cursa: id_cursa, id_sofer: driverId })
      });

      const data = await response.json();
      if (data.success) {
        // Resetăm formularul de review
        setReviewRating(0);
        setReviewComment('');
        setReviewSubmitted(false);
        // Reîncărcăm datele pentru a afișa pop-up-ul de Cursă Activă
        loadDashboardData(driverId);
      } else {
        alert("Eroare la preluarea cursei: " + data.message);
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  // Logica pentru TRIMITERE RECENZIE CĂTRE CLIENT
  const handleSubmitReview = async () => {
    if (reviewRating === 0) return alert("Te rugăm să selectezi cel puțin o stea!");
    if (!activeRide || !driverId) return;

    try {
      const response = await fetch('https://untitled-i7lc.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sofer_id_sofer: driverId,
          client_id_client: activeRide.client_id_client,
          rating: reviewRating,
          comentarii: reviewComment
        })
      });

      const data = await response.json();
      if (data.success) {
        setReviewSubmitted(true);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Eroare trimitere recenzie:", err);
    }
  };

  // Logica pentru FINALIZARE cursă
  const handleEndRide = async () => {
    if (!driverId || !activeRide) return;

    try {
      const response = await fetch('https://untitled-i7lc.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_cursa: activeRide.id_cursa, id_sofer: driverId })
      });

      const data = await response.json();
      if (data.success) {
        setActiveRide(null);
        // Curățăm state-ul recenziei pentru curse viitoare
        setReviewRating(0);
        setReviewComment('');
        setReviewSubmitted(false);

        fetchAvailableRides();
        alert("Cursa a fost finalizată cu succes!");
      } else {
        alert("Eroare la finalizare: " + data.message);
      }
    } catch (err) {
      alert("Network error.");
    }
  };

  if (loading) return <div className="p-8 text-center text-primary">Loading rides...</div>;

  return (
      <div className="p-8 max-w-6xl mx-auto">

        {/* POP-UP CURSĂ ACTIVĂ (Dacă șoferul a acceptat o cursă) */}
        {activeRide ? (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 mb-10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="relative flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                </span>
                    Active Ride
                  </h2>
                  <p className="text-muted-foreground">You are currently in a ride with <span className="font-bold text-foreground">{activeRide.passengerName}</span>.</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-light text-primary">{activeRide.pret_estimat?.toFixed(2) || '0.00'} lei</div>
                  <div className="text-sm text-muted-foreground font-medium">Estimated Fare</div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8 bg-card p-6 rounded-lg border border-border">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-muted rounded-full text-accent"><MapPin size={24}/></div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-1">Pickup Location ID</p>
                    <p className="text-lg font-medium text-foreground">{activeRide.plecare}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-muted rounded-full text-primary"><Navigation size={24}/></div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold mb-1">Destination ID</p>
                    <p className="text-lg font-medium text-foreground">{activeRide.destinatie}</p>
                  </div>
                </div>
              </div>

              {/* === ZONA DE REVIEW PENTRU CLIENT === */}
              {!reviewSubmitted ? (
                  <div className="bg-card p-6 rounded-2xl border border-border shadow-sm mb-6">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                      <Star size={20} className="fill-yellow-500 text-yellow-500" />
                      <h3 className="font-bold text-lg text-foreground">Evaluează Clientul</h3>
                    </div>

                    <div className="flex gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                          <button key={star} onClick={() => setReviewRating(star)}>
                            <Star className={`w-8 h-8 transition-colors ${reviewRating >= star ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground hover:text-yellow-400'}`} />
                          </button>
                      ))}
                    </div>

                    <textarea
                        className="w-full bg-muted p-3 rounded-lg border border-border outline-none focus:border-primary mb-4 text-sm resize-none"
                        placeholder="Cum s-a comportat clientul? (Opțional)"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={2}
                    />

                    <button
                        onClick={handleSubmitReview}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                      Trimite Recenzia
                    </button>
                  </div>
              ) : (
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-200 mb-6 flex items-center justify-center gap-2 text-green-800 shadow-sm">
                    <CheckCircle2 size={20} />
                    <p className="font-bold">Recenzia pentru client a fost trimisă. Mulțumim!</p>
                  </div>
              )}

              <div className="flex justify-end mt-4">
                <button
                    onClick={handleEndRide}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-lg rounded-xl font-bold hover:opacity-90 transition-all shadow-md"
                >
                  <CheckCircle2 size={24} />
                  Finish Ride
                </button>
              </div>
            </div>
        ) : (
            <>
              {/* HEADER PENTRU LISTA DE CURSE (Afișat doar dacă NU are cursă activă) */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Available Rides</h1>
                <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-800 font-bold tracking-wide">ONLINE & READY</span>
                </div>
              </div>

              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="mb-1 font-semibold">You're in a high-demand area</div>
                    <div className="text-sm text-muted-foreground">
                      Refreshing list automatically...
                    </div>
                  </div>
                </div>
                <button onClick={fetchAvailableRides} className="px-4 py-2 text-sm bg-muted text-foreground rounded-lg hover:bg-muted/80 border border-border">
                  Refresh Now
                </button>
              </div>

              {/* LISTĂ CURSE DIN BAZA DE DATE */}
              <div className="space-y-4">
                {availableRides.map((ride) => (
                    <div
                        key={ride.id_cursa}
                        className="bg-card rounded-lg border border-border overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-xl text-primary font-bold">
                              {ride.passengerName ? ride.passengerName[0].toUpperCase() : 'C'}
                            </div>
                            <div>
                              <div className="mb-1 font-bold text-lg">{ride.passengerName || 'Client Necunoscut'}</div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Dist. Estimat: {ride.distanta || 'N/A'} km</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-light text-primary mb-1">{ride.pret_estimat?.toFixed(2) || '0.00'} lei</div>
                            <div className="text-sm font-semibold text-muted-foreground uppercase">{ride.durata_estimata || 0} Min Est.</div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4 bg-muted/50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Pickup Location</div>
                              <div className="text-sm font-medium">{ride.plecare}</div>
                            </div>
                          </div>
                          <div className="w-px h-4 bg-border ml-2.5"></div>
                          <div className="flex items-start gap-3">
                            <Navigation className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Destination</div>
                              <div className="text-sm font-medium">{ride.destinatie}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(ride.data_comanda).toLocaleDateString()} {ride.ora_comanda}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                                onClick={() => handleAcceptFromList(ride.id_cursa)}
                                className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-opacity"
                            >
                              Accept Ride
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                ))}
              </div>

              {availableRides.length === 0 && (
                  <div className="text-center py-16 bg-muted/20 border border-border rounded-xl">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="mb-2 text-xl font-bold">No rides available</h3>
                    <p className="text-sm text-muted-foreground">
                      Check back soon or move to a busier area.
                    </p>
                  </div>
              )}
            </>
        )}
      </div>
  );
}