import { useEffect, useState, useRef } from 'react';
import { Mail, Phone, MapPin, CreditCard, AlertCircle, Navigation, User, Car, History, Star, LogOut, CheckCircle } from 'lucide-react';

export default function ClientAccount() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    telefon: '',
    adresa: '',
    metoda_plata: ''
  });

  const [prefs, setPrefs] = useState({
    notifications: true,
    autotip: false
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setFormData({
        telefon: parsedUser.telefon || '',
        adresa: parsedUser.adresa || '',
        metoda_plata: parsedUser.metoda_plata || ''
      });
    }
  }, []);

  useEffect(() => {
    if (isEditing && window.google && addressInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'ro' }
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) setFormData(p => ({ ...p, adresa: place.formatted_address }));
      });
    }
  }, [isEditing]);

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id_client: user.id_client }),
      });
      const data = await response.json();
      if (data.success) {
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Confirmare vizuală
        setIsEditing(false); // Ieșim din modul editare (nu mai sunt editabile)
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000); // Mesajul dispare după 3 secunde
      }
    } catch (err) {
      alert("Eroare la conexiunea cu serverul.");
    }
  };

  if (!user) return null;

  const isProfileComplete = formData.telefon && formData.adresa && formData.metoda_plata;

  return (
    <div className="flex-1 p-10 bg-[#f8f5f0] min-h-screen">
      <header className="mb-8 flex justify-between items-center max-w-5xl">
        <h1 className="text-2xl font-semibold text-gray-800">Account client</h1>
        {showSuccess && (
          <div className="flex items-center gap-2 text-green-600 font-medium animate-bounce">
            <CheckCircle size={18} /> Date salvate cu succes!
          </div>
        )}
      </header>

      <div className="max-w-5xl space-y-6">
        {/* CARD PRINCIPAL */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative">
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`absolute top-8 right-8 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-[#1e293b] text-white hover:bg-slate-700'
            }`}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>

          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-full bg-[#e5d5bc] flex items-center justify-center text-xl font-bold text-[#8a7a5f]">
              {user.nume?.split(' ').map((n:any) => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{user.nume}</h2>
              <p className="text-sm text-gray-500">Member since January 2024</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-y-8 gap-x-12">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-gray-400" />
              <div>
                <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Email</p>
                <p className="text-sm text-gray-700">{user.mail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={18} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Phone</p>
                {isEditing ? (
                  <input 
                    className="text-sm border-b-2 border-blue-400 outline-none w-full bg-blue-50/50 p-1" 
                    value={formData.telefon} 
                    onChange={e => setFormData({...formData, telefon: e.target.value})}
                    autoFocus
                  />
                ) : (
                  <p className="text-sm text-gray-700 font-medium">{user.telefon || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Address</p>
                {isEditing ? (
                  <div className="flex gap-2">
                    <input 
                      ref={addressInputRef} 
                      className="text-sm border-b-2 border-blue-400 outline-none flex-1 bg-blue-50/50 p-1" 
                      value={formData.adresa} 
                      onChange={e => setFormData({...formData, adresa: e.target.value})} 
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 font-medium">{user.adresa || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-gray-400" />
              <div className="flex-1">
                <p className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">Payment Method</p>
                {isEditing ? (
                  <input 
                    className="text-sm border-b-2 border-blue-400 outline-none w-full bg-blue-50/50 p-1" 
                    placeholder="Full card number" 
                    value={formData.metoda_plata} 
                    onChange={e => setFormData({...formData, metoda_plata: e.target.value})} 
                  />
                ) : (
                  <p className="text-sm text-gray-700 font-medium italic">•••• •••• •••• {user.metoda_plata?.slice(-4) || 'XXXX'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800">47</h3>
            <p className="text-xs text-gray-500 mt-1">Total Rides</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm border-l-4 border-l-blue-500">
            <h3 className="text-2xl font-bold text-gray-800">4.8</h3>
            <p className="text-xs text-gray-500 mt-1">Average Rating</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-800">$1,247</h3>
            <p className="text-xs text-gray-500 mt-1">Total Spent</p>
          </div>
        </div>

        {/* PREFERENCES */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-6 uppercase tracking-widest">Preferences</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Notifications</p>
                <p className="text-xs text-gray-500">Receive ride updates via SMS</p>
              </div>
              <button 
                onClick={() => setPrefs({...prefs, notifications: !prefs.notifications})}
                className={`w-10 h-5 rounded-full transition-colors relative ${prefs.notifications ? 'bg-[#c5a880]' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${prefs.notifications ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">Auto-tip</p>
                <p className="text-xs text-gray-500">Automatically add 15% tip</p>
              </div>
              <button 
                onClick={() => setPrefs({...prefs, autotip: !prefs.autotip})}
                className={`w-10 h-5 rounded-full transition-colors relative ${prefs.autotip ? 'bg-[#c5a880]' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${prefs.autotip ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* CTA BUTON */}
        <div className={`p-6 rounded-xl border-2 flex items-center justify-between transition-all ${isProfileComplete ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-200 opacity-50'}`}>
          <div className="flex items-center gap-3">
            {!isProfileComplete && <AlertCircle className="text-red-500" size={20} />}
            <p className="text-sm font-semibold text-gray-700">
              {isProfileComplete ? 'Profil activat! Poți solicita o cursă.' : 'Completează Phone, Address și Payment pentru a activa contul.'}
            </p>
          </div>
          <button 
            disabled={!isProfileComplete} 
            className={`px-8 py-3 rounded-lg font-bold transition-all ${isProfileComplete ? 'bg-[#1e293b] text-white shadow-lg hover:scale-105' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            REQUEST RIDE
          </button>
        </div>
      </div>
    </div>
  );
}