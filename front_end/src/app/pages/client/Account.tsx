import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, MapPin, CreditCard, Save, X, Circle, Star, Settings, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';

declare global {
  interface Window {
    google: any;
  }
}

export default function ClientAccount() {
  const [client, setClient] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const addressInputRef = useRef<HTMLInputElement>(null);

  // Am scos autotip de aici
  const [prefs, setPrefs] = useState({
    notifications: true
  });

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const clientId = savedUser.id_client || savedUser.id;

      if (!clientId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5050/api/client-stats/${clientId}`);

      if (response.ok) {
        const data = await response.json();
        setClient(data);
        setEditData(data);
      }
    } catch (err) {
      console.error("Eroare la extragerea datelor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing && window.google && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'ro' }
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setEditData((prev: any) => ({ ...prev, adresa: place.formatted_address }));
        }
      });
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      if (data.success) {
        setClient(editData);
        setIsEditing(false);
        alert("Profil actualizat!");
      }
    } catch (err) {
      alert("Eroare la salvare.");
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm("Ești sigur că vrei să ștergi definitiv acest profil? Toate datele vor fi pierdute.")) return;

    try {
      const response = await fetch(`http://localhost:5050/api/delete-client/${client.id_client}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('user');
        alert("Contul a fost șters.");
        navigate('/login'); // Redirect la login
      }
    } catch (err) {
      alert("Eroare la ștergerea contului.");
    }
  };

  if (loading) return <div className="p-8 text-center text-primary font-bold">Loading profile...</div>;

  return (
      <div className="p-8 max-w-4xl mx-auto pb-20 relative">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Client Profile</h1>
          {!isEditing ? (
              <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-semibold"
              >
                Edit Profile
              </button>
          ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Save size={18} /> Save
                </button>
                <button onClick={() => { setIsEditing(false); setEditData(client); }} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  <X size={18} /> Cancel
                </button>
              </div>
          )}
        </div>

        {/* DATE PERSONALE */}
        <div className="bg-card rounded-lg p-8 border border-border shadow-md">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-3xl text-primary font-bold shadow-inner">
              {client.nume ? client.nume[0].toUpperCase() : 'C'}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-foreground">{client.nume}</h2>
              <p className="text-sm text-green-600 flex items-center gap-2 mt-2 font-medium">
                <Circle size={12} className="fill-green-600 text-green-600" /> Active Member
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1 font-medium">
                <Star size={16} className="text-yellow-500 fill-yellow-500" /> {client.rating} Driver Rating
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full"><Mail className="text-primary" size={20} /></div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Email</p>
                <p className="font-medium text-foreground/80">{client.mail}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full"><Phone className="text-primary" size={20} /></div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Phone Number</p>
                {isEditing ? (
                    <input
                        className="w-full bg-muted p-2 rounded border border-border outline-none focus:ring-1 focus:ring-primary"
                        value={editData.telefon || ''}
                        onChange={(e) => setEditData({...editData, telefon: e.target.value.replace(/[^0-9]/g, '')})}
                        placeholder="07XXXXXXXX"
                    />
                ) : (
                    <p className="font-medium text-foreground">{client.telefon || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full"><MapPin className="text-primary" size={20} /></div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Home Address</p>
                {isEditing ? (
                    <input
                        ref={addressInputRef}
                        className="w-full bg-muted p-2 rounded border border-border outline-none"
                        value={editData.adresa || ''}
                        onChange={(e) => setEditData({...editData, adresa: e.target.value})}
                    />
                ) : (
                    <p className="font-medium text-foreground truncate">{client.adresa || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full"><CreditCard className="text-primary" size={20} /></div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Payment Method</p>
                {isEditing ? (
                    <select
                        className="w-full bg-muted p-2 rounded border border-border outline-none"
                        value={editData.metoda_plata || ''}
                        onChange={(e) => setEditData({...editData, metoda_plata: e.target.value})}
                    >
                      <option value="Card">Card</option>
                      <option value="Cash">Cash</option>
                    </select>
                ) : (
                    <p className="font-medium text-foreground">{client.metoda_plata || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8">
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm flex flex-col justify-center">
            <div className="text-4xl text-primary font-light mb-1">{client.totalTrips || 0}</div>
            <div className="text-sm text-muted-foreground font-medium">Total Rides</div>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm flex flex-col justify-center text-accent">
            <div className="text-4xl font-light mb-1">{client.rating || 5.0}</div>
            <div className="text-sm text-muted-foreground font-medium">Rating</div>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm flex flex-col justify-center">
            <div className="text-4xl text-primary font-light mb-1">{(client.totalSpent || 0).toFixed(2)} lei</div>
            <div className="text-sm text-muted-foreground font-medium">Total Spent</div>
          </div>
        </div>

        {/* PREFERENCES - FARA AUTO TIP */}
        <div className="bg-card rounded-lg p-8 border border-border shadow-md mt-8">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-primary" size={24} />
            <h3 className="text-2xl font-bold text-foreground">Preferences</h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
            <div>
              <p className="font-bold text-foreground">SMS Notifications</p>
              <p className="text-sm text-muted-foreground">Receive ride updates via SMS</p>
            </div>
            <button
                onClick={() => setPrefs({...prefs, notifications: !prefs.notifications})}
                className={`w-12 h-6 rounded-full transition-colors relative ${prefs.notifications ? 'bg-primary' : 'bg-slate-400'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${prefs.notifications ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* DANGER ZONE - DELETE PROFILE */}
        <div className="mt-12 pt-8 border-t border-red-100 flex justify-center">
          <button
              onClick={handleDeleteProfile}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            <Trash2 size={20} />
            Delete My Profile
          </button>
        </div>

      </div>
  );
}