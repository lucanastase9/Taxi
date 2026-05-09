import { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Calendar, Clock, X, Check } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Autocomplete, DirectionsRenderer } from '@react-google-maps/api';

const center = { lat: 44.4268, lng: 26.1025 };
const libraries: ("places")[] = ['places'];

// Restricționăm harta la zona Bucureștiului
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

  const pickupRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destRef = useRef<google.maps.places.Autocomplete | null>(null);

  const carTypes = [
    { id: 'economy', name: 'Economy', rate: 2.40, icon: '🚗' },
    { id: 'standard', name: 'Standard', rate: 2.90, icon: '🚙' },
    { id: 'premium', name: 'Premium', rate: 3.50, icon: '🚕' },
    { id: 'xl', name: 'XL', rate: 4.50, icon: '🚐' },
  ];

  const onMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: e.latLng }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const address = results[0].formatted_address;

        if (!pickup) {
          setPickup(address);
        } else if (!destination) {
          setDestination(address);
        }
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

  const handleConfirmSchedule = () => {
    if (scheduledDateTime) {
      setIsScheduled(true);
      setShowScheduleModal(false);
    }
  };

  const handleRequestRide = async () => {
    if (!directionsResponse || !pickup || !destination) {
      alert('Te rog completează ambele adrese din sugestiile Google!');
      return;
    }

    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const clientId = savedUser.id_client || savedUser.id;

      if (!clientId) {
        alert("Eroare: Nu ești logat ca și client.");
        return;
      }


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
        alert("Comanda a fost plasată cu succes! Căutăm un șofer...");
      } else {
        alert("Eroare la plasarea comenzii: " + data.message);
      }
    } catch (err) {
      console.error("Eroare rețea:", err);
      alert("Nu s-a putut trimite comanda. Verifică conexiunea cu serverul!");
    }
  };

  if (!isLoaded) return <div className="h-full flex items-center justify-center font-bold">Se încarcă...</div>;

  return (
      <div className="h-full flex flex-col md:flex-row relative">

        {/* MODAL PROGRAMARE */}
        {showScheduleModal && (
            <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="text-xl font-bold">Programează cursă</h3>
                  <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-muted rounded-full">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-8">
                  <input
                      type="datetime-local"
                      className="w-full p-4 bg-muted border border-border rounded-xl outline-none"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                  />
                </div>
                <div className="p-6 bg-muted/50 flex gap-3">
                  <button onClick={() => setShowScheduleModal(false)} className="flex-1 py-3 border border-border rounded-xl">Anulează</button>
                  <button onClick={handleConfirmSchedule} className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold">Confirmă</button>
                </div>
              </div>
            </div>
        )}

        {/* MENIUL DIN STÂNGA */}
        <div className="w-full md:w-2/5 p-8 overflow-auto border-r border-border flex flex-col bg-background">
          <h1 className="mb-6 font-bold text-3xl">Start New Ride</h1>

          <div className="space-y-6 flex-1">
            {/* PICKUP */}
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
                {pickup && <X size={16} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground" onClick={() => {setPickup(''); setDirectionsResponse(null);}} />}
              </div>
            </div>

            {/* DESTINAȚIE */}
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
                {destination && <X size={16} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground" onClick={() => {setDestination(''); setDirectionsResponse(null);}} />}
              </div>
            </div>

            {/* INFO RUTĂ */}
            {distance && duration && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex justify-between items-center text-green-800">
                  <div><p className="text-xs font-bold uppercase">Timp</p><p className="text-xl font-bold">{duration}</p></div>
                  <div><p className="text-xs font-bold uppercase">Distanță</p><p className="text-xl font-bold">{distance}</p></div>
                </div>
            )}

            {/* CÂND? */}
            <div className="flex gap-2">
              <button onClick={() => setIsScheduled(false)} className={`flex-1 py-3 rounded-xl border flex flex-col items-center transition-all ${!isScheduled ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' : 'border-border text-muted-foreground'}`}>
                <Clock className="w-5 h-5 mb-1" /><span className="text-xs font-bold">Acum</span>
              </button>
              <button onClick={() => setShowScheduleModal(true)} className={`flex-1 py-3 rounded-xl border flex flex-col items-center transition-all ${isScheduled ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' : 'border-border text-muted-foreground'}`}>
                <Calendar className="w-5 h-5 mb-1" /><span className="text-xs font-bold">{isScheduled ? scheduledDateTime.split('T')[1] : 'Programează'}</span>
              </button>
            </div>

            {/* VEHICULE */}
            <div className="space-y-3">
              {carTypes.map((car) => {
                // Extragem cifrele din distanță; dacă nu există, punem 5km implicit
                const distNum = distance ? parseFloat(distance.replace(/[^\d.]/g, '')) : 0;
                const displayPrice = distNum > 0 ? (distNum * car.rate).toFixed(2) : (car.rate * 5).toFixed(2);

                return (
                    <button key={car.id} onClick={() => setSelectedCar(car.id)} className={`w-full p-4 rounded-xl border flex items-center justify-between ${selectedCar === car.id ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' : 'border-border'}`}>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{car.icon}</span>
                        <div className="text-left">
                          <div className="font-bold">{car.name}</div>
                          {/* Afișăm timpul estimativ real calculat de Google Maps dacă avem rută */}
                          <div className="text-xs text-muted-foreground">{duration ? duration : 'Estimare...'} distanță</div>
                        </div>
                      </div>
                      {/* Afișăm LEI cu prețul calculat dinamic */}
                      <div className="text-xl font-bold">{displayPrice} LEI</div>
                    </button>
                )
              })}
            </div>
          </div>

          <button onClick={handleRequestRide} disabled={!directionsResponse} className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg mt-6 shadow-lg disabled:opacity-50">
            {isScheduled ? "Confirmă Programarea" : "Solicită Cursa"}
          </button>
        </div>

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
                restriction: {
                  latLngBounds: BUCHAREST_BOUNDS,
                  strictBounds: false,
                },
              }}
              onLoad={setMap}
          >
            {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
          </GoogleMap>
        </div>
      </div>
  );
}