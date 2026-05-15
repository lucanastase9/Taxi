import { useState, useEffect } from 'react';

export default function AdminHistory() {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:5050/api/admin/history');
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  // Funcție pentru a colora statusul cursei
  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const s = status.toLowerCase();
    if (s.includes('finalizat') || s.includes('completed')) return 'bg-green-100 text-green-800';
    if (s.includes('anulat') || s.includes('canceled')) return 'bg-red-100 text-red-800';
    if (s.includes('curs') || s.includes('waiting')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Istoric Curse</h2>
      <p className="text-slate-500 mb-6">Această listă reunește date din tabelele Cursă, Client, Șofer și Plată.</p>

      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Client</th>
              <th className="p-4">Șofer</th>
              <th className="p-4">Traseu (Plecare → Destinație)</th>
              <th className="p-4">Dată Comandă</th>
              <th className="p-4">Preț & Plată</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h: any) => (
              <tr key={h.id_cursa} className="border-b hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-400">#{h.id_cursa}</td>
                <td className="p-4 font-medium text-slate-800">{h.nume_client}</td>
                <td className="p-4 font-medium text-slate-800">{h.nume_sofer}</td>
                <td className="p-4 text-sm">
                  <span className="font-semibold text-blue-600">{h.plecare}</span>
                  <span className="mx-2 text-slate-400">→</span>
                  <span className="font-semibold text-purple-600">{h.destinatie}</span>
                </td>
                <td className="p-4 text-sm">
                    {new Date(h.data_comanda).toLocaleDateString('ro-RO')}
                </td>
                <td className="p-4">
                  <div className="font-bold text-slate-800">
                    {h.pret_final ? `${h.pret_final} RON` : 'N/A'}
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    {h.metoda_plata || 'Neprecizat'}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(h.status)}`}>
                    {h.status || 'Necunoscut'}
                  </span>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">Nu există curse înregistrate în sistem.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}