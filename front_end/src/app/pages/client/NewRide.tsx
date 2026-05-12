import { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Calendar, Clock, X, Check, Heart } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';

const center = { lat: 44.4268, lng: 26.1025 };
const libraries: ("places")[] = ['places'];

const BUCHAREST_BOUNDS = {
  north: 44.54,
  south: 44.33,
  west: 25.90,
  east: 26.25,
};

export default function ClientNewRide() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "PUNE_AICI_API_KEY_UL_TAU",
    libraries: libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedCar, setSelectedCar] = useState('standard');

  const [isScheduled, setIsScheduled] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // === NOILE STATE-URI PENTRU CURSA ACTIVĂ ȘI TIPS ===
  const [activeRide, setActiveRide] = useState<any | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(0);

  const pickupRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destRef = useRef<google.maps.places.Autocomplete | null>(null);

  const carTypes = [
    { id: 'economy', name: 'Economy', rate: 2.40, icon: '🚗' },
    { id: 'standard', name: 'Standard', rate: 2.90, icon: '🚙' },
    { id: 'premium', name: 'Premium', rate: 3.50, icon: '🚕' },
    { id: 'xl', name: 'XL', rate: 4.50, icon: '🚐' },
  ];

  // VERIFICAREA PERIODICĂ A CURSEI ACTIVE
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const clientId = savedUser.id_client || savedUser.id;

    if (clientId) {
      checkActiveRide(clientId);
      const interval = setInterval(() => checkActiveRide(clientId), 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const checkActiveRide = async (clientId: number) => {
    try {
      const res = await fetch(`http://localhost:5050/api/client-active-ride/${clientId}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setActiveRide(data);
        if (data && data.tips !== undefined) {
          setTipAmount(data.tips); // Sincronizăm bacșișul dacă există deja
        }
      }
    } catch (err) {
      console.error("Eroare verificare cursă:", err);
    }
  };

  // FUNCȚIE PENTRU ACTUALIZAREA TIPS-ULUI IN TIMP REAL
  const handleUpdateTip = async (amount: number) => {
    setTipAmount(amount);
    if (!activeRide) return;

    try {
      await fetch('http://localhost:5050/api/update-tip', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_cursa: activeRide.id_cursa, tips: amount })
      });
    } catch (err) {
      console.error("Eroare la adăugare tips:", err);
    }
  };

  // === RESTUL LOGICII GOOGLE MAPS RĂMÂNE LA FEL ===
  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng || activeRide) return; // Blocăm editarea hărții dacă e în cursă
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: e.latLng }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const address = results[0].formatted_address;
        if (!pickup) setPickup(address);
        else if (!destination) setDestination(address);
      }
    });
  };

  const handlePickupChanged = () => {
    const place = pickupRef.current?.getPlace();
    if (place && place.formatted_address) setPickup(place.formatted_address);
  };

  const handleDestinationChanged = () => {
    const place = destRef.current?.getPlace();
    if (place && place.formatted_address) setDestination(place.formatted_address);
  };

  const calculateRoute = async () => {
    if (!pickup || !destination) return;
    try {
      const directionsService = new google.maps.DirectionsService();
      const results = await directionsService.route({
        origin: pickup,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirectionsResponse(results);
      setDistance(results.routes[0].legs[0].distance?.text || '');
      setDuration(results.routes[0].legs[0].duration?.text || '');
    } catch (error) {
      console.error("Ruta nu poate fi calculată în interiorul limitelor.", error);
    }
  };

  useEffect(() => {
    if (pickup && destination) calculateRoute();
  }, [pickup, destination]);

  const handleRequestRide = async () => {
    if (!directionsResponse || !pickup || !destination) {
      alert('Te rog completează ambele adrese din sugestiile Google!');
      return;
    }

    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const clientId = savedUser.id_client || savedUser.id;

      if (!clientId) return alert("Eroare: Nu ești logat ca și client.");

      const distNum = parseFloat(distance.replace(/[^\d.]/g, ''));
      const durNum = parseFloat(duration.replace(/[^\d.]/g, ''));
      const car = carTypes.find(c => c.id === selectedCar);
      const finalPrice = car ? (distNum * car.rate) : (distNum * 2.90);

      const payload = {
        client_id_client: clientId,
        plecare: pickup,
        destinatie: destination,
        distanta: distNum,
        durata_estimata: durNum,
        pret_estimat: finalPrice,
        categorie: car ? car.name : 'Standard'
      };

      const response = await fetch('http://localhost:5050/api/create-ride', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        // La succes, forțăm o verificare a cursei pentru a încărca noul ecran imediat
        checkActiveRide(clientId);
      } else {
        alert("Eroare la plasarea comenzii: " + data.message);
      }
    } catch (err) {
      alert("Nu s-a putut trimite comanda. Verifică conexiunea cu serverul!");
    }
  };

  if (!isLoaded) return <div className="h-full flex items-center justify-center font-bold">Se încarcă...</div>;

  return (
      <div className="h-full flex flex-col md:flex-row relative">

        {/* MENIUL DIN STÂNGA - SE SCHIMBĂ DACĂ ARE CURSĂ ACTIVĂ */}
        {activeRide ? (
            <div className="w-full md:w-2/5 p-8 overflow-auto border-r border-border flex flex-col bg-background">
              <h1 className="mb-6 font-bold text-3xl">Cursa ta activă</h1>

              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <h2 className="text-xl font-bold">
                    {activeRide.status === 'Asteptare Sofer' ? 'Căutăm șofer...' : 'Șoferul este pe traseu'}
                  </h2>
                </div>

                <div className="space-y-4 text-sm mb-6">
                  <div className="flex gap-3 items-start">
                    <MapPin size={18} className="text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold text-muted-foreground uppercase text-xs">Preluare</p>
                      <p className="font-medium text-foreground">{activeRide.plecare}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Navigation size={18} className="text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-muted-foreground uppercase text-xs">Destinație</p>
                      <p className="font-medium text-foreground">{activeRide.destinatie}</p>
                    </div>
                  </div>
                </div>

                {activeRide.driverName && (
                    <div className="mt-6 pt-6 border-t border-border/50">
                      <p className="text-xs uppercase text-muted-foreground font-bold mb-2">Detalii Șofer</p>
                      <p className="text-lg font-bold">{activeRide.driverName}</p>
                      <p className="text-sm font-medium text-muted-foreground">{activeRide.model} • {activeRide.nr_inmatriculare}</p>
                    </div>
                )}
              </div>

              <div className="mt-auto bg-card p-6 rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Heart size={20} />
                  <h3 className="font-bold text-lg">Adaugă Bacșiș (Tips)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Poți ajusta valoarea bacșișului pe durata cursei.</p>
                <div className="flex gap-2">
                  {[0, 5, 10, 15, 20].map(amount => (
                      <button
                          key={amount}
                          onClick={() => handleUpdateTip(amount)}
                          className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                              tipAmount === amount
                                  ? 'bg-primary/10 text-primary border-primary shadow-sm'
                                  : 'bg-card border-border hover:bg-muted text-muted-foreground'
                          }`}
                      >
                        {amount > 0 ? `+${amount}` : '0'} Lei
                      </button>
                  ))}
                </div>
              </div>
            </div>
        ) : (
            <div className="w-full md:w-2/5 p-8 overflow-auto border-r border-border flex flex-col bg-background">
              <h1 className="mb-6 font-bold text-3xl">Start New Ride</h1>
              <div className="space-y-6 flex-1">
                <div>
                  <label className="block text-sm mb-2 font-bold uppercase text-muted-foreground">Pickup Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary z-10" />
                    <Autocomplete onLoad={(a) => (pickupRef.current = a)} onPlaceChanged={handlePickupChanged}>
                      <input
                          type="text"
                          value={pickup}
                          onChange={(e) => setPickup(e.target.value)}
                          placeholder="Click pe hartă sau scrie adresa..."
                          className="w-full pl-11 pr-4 py-3 bg-card rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary"
                      />
                    </Autocomplete>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2 font-bold uppercase text-muted-foreground">Destination</label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary z-10" />
                    <Autocomplete onLoad={(a) => (destRef.current = a)} onPlaceChanged={handleDestinationChanged}>
                      <input
                          type="text"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="Unde mergem?"
                          className="w-full pl-11 pr-4 py-3 bg-card rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary"
                      />
                    </Autocomplete>
                  </div>
                </div>

                {/* RESTUL CODULUI (Timp, Date, Vehicule, Request Buton) */}
                <div className="space-y-3">
                  {carTypes.map((car) => {
                    const distNum = distance ? parseFloat(distance.replace(/[^\d.]/g, '')) : 0;
                    const displayPrice = distNum > 0 ? (distNum * car.rate).toFixed(2) : (car.rate * 5).toFixed(2);
                    return (
                        <button key={car.id} onClick={() => setSelectedCar(car.id)} className={`w-full p-4 rounded-xl border flex items-center justify-between ${selectedCar === car.id ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' : 'border-border'}`}>
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{car.icon}</span>
                            <div className="text-left">
                              <div className="font-bold">{car.name}</div>
                              <div className="text-xs text-muted-foreground">{duration ? duration : 'Estimare...'} distanță</div>
                            </div>
                          </div>
                          <div className="text-xl font-bold">{displayPrice} LEI</div>
                        </button>
                    )
                  })}
                </div>
              </div>

              <button onClick={handleRequestRide} disabled={!directionsResponse} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg mt-6 shadow-lg disabled:opacity-50">
                Solicită Cursa
              </button>
            </div>
        )}

        {/* HARTA GOOGLE */}
        <div className="flex-1 relative min-h-[400px]">
          <GoogleMap
              center={center}
              zoom={13}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              onClick={onMapClick}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                restriction: { latLngBounds: BUCHAREST_BOUNDS, strictBounds: false },
              }}
              onLoad={setMap}
          >
            {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
          </GoogleMap>
        </div>
      </div>
  );
}