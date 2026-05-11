import { useState, useEffect } from 'react';
import { Users, Car, MapPin, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_clienti: 0,
    total_soferi: 0,
    total_curse: 0,
    venit_total: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5050/api/admin/dashboard-stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Eroare la aducerea statisticilor:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
      <p className="text-slate-500 mb-8">O privire de ansamblu asupra platformei RideShare.</p>

      {/* Grid-ul cu Carduri de Statistici */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card Clienți */}
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Clienți Activi</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total_clienti}</p>
          </div>
        </div>

        {/* Card Șoferi */}
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-full">
            <Car className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Șoferi Activi</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total_soferi}</p>
          </div>
        </div>

        {/* Card Curse */}
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Curse Totale</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total_curse}</p>
          </div>
        </div>

        {/* Card Venituri */}
        <div className="bg-white p-6 rounded-lg shadow-sm border flex items-center gap-4">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-full">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Venituri (RON)</p>
            <p className="text-2xl font-bold text-slate-800">{stats.venit_total} lei</p>
          </div>
        </div>

      </div>
    </div>
  );
}