import { useState, useEffect } from 'react';

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({ id_client: null, nume: '', nr_tel: '', mail: '', parola: '' });
  const [isEditing, setIsEditing] = useState(false);

  // STATE-URI NOI PENTRU CĂUTARE ȘI FILTRARE
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Modificăm fetch-ul pentru a trimite parametrii prin URL
  const fetchClients = async () => {
    try {
      // Construim URL-ul cu parametrii dinamici
      const queryParams = new URLSearchParams({
        search: searchTerm,
        status: filterStatus,
        sort: sortBy
      }).toString();

      const res = await fetch(`http://localhost:5050/api/admin/clients?${queryParams}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
      }
    } catch (err) {
      console.error("Eroare frontend la fetch:", err);
    }
  };

  // Se reapelează automat când se schimbă ceva în filtre
  useEffect(() => {
    fetchClients();
  }, [searchTerm, filterStatus, sortBy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing 
        ? `http://localhost:5050/api/admin/clients/${formData.id_client}` 
        : 'http://localhost:5050/api/admin/clients';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      fetchClients();
      setFormData({ id_client: null, nume: '', nr_tel: '', mail: '', parola: '' });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Ești sigur că vrei să dezactivezi acest client?")) return;
    await fetch(`http://localhost:5050/api/admin/clients/${id}`, { method: 'DELETE' });
    fetchClients();
  };

  const handleActivate = async (id: number) => {
    if(!confirm("Re-activezi acest client?")) return;
    await fetch(`http://localhost:5050/api/admin/clients/${id}/activate`, { method: 'PUT' });
    fetchClients();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestionare Clienți</h2>

      {/* FORMULAR ADĂUGARE/EDITARE */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-8 flex gap-4 items-end border">
        <div className="flex-1">
          <label className="block text-sm mb-1">Nume Complet</label>
          <input type="text" value={formData.nume || ''} onChange={e => setFormData({...formData, nume: e.target.value})} className="w-full border p-2 rounded" required />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">Email</label>
          <input type="email" value={formData.mail || ''} onChange={e => setFormData({...formData, mail: e.target.value})} className="w-full border p-2 rounded" required />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">Telefon</label>
          <input type="number" value={formData.nr_tel || ''} onChange={e => setFormData({...formData, nr_tel: e.target.value})} className="w-full border p-2 rounded" required />
        </div>
        {!isEditing && (
          <div className="flex-1">
            <label className="block text-sm mb-1">Parolă</label>
            <input type="text" value={formData.parola || ''} onChange={e => setFormData({...formData, parola: e.target.value})} className="w-full border p-2 rounded" required />
          </div>
        )}
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">
          {isEditing ? 'Salvează' : 'Adaugă'}
        </button>
        {isEditing && (
          <button type="button" onClick={() => { setIsEditing(false); setFormData({id_client: null, nume:'', nr_tel:'', mail:'', parola:''}) }} className="bg-gray-400 text-white px-4 py-2 rounded">Anulează</button>
        )}
      </form>

      {/* ZONA DE CĂUTARE ȘI FILTRARE (NOU) */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex gap-4 items-center border">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Caută după nume sau email..." 
            className="w-full border p-2 rounded bg-slate-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select className="border p-2 rounded bg-slate-50" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Toți Clienții</option>
            <option value="1">Doar Activi</option>
            <option value="0">Doar Inactivi</option>
          </select>
        </div>
        <div>
          <select className="border p-2 rounded bg-slate-50" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="id_desc">Cei mai noi primii</option>
            <option value="nume_asc">Alfabetic (A-Z)</option>
            <option value="km_desc">Cei mai mulți KM</option>
          </select>
        </div>
      </div>

      {/* Tabel Clienți */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Nume</th>
              <th className="p-4">Email</th>
              <th className="p-4">KM Parcurși</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c: any) => (
              <tr key={c.id_client} className="border-b">
                <td className="p-4">#{c.id_client}</td>
                <td className="p-4 font-medium">{c.nume}</td>
                <td className="p-4">{c.mail}</td>
                <td className="p-4 font-bold text-slate-500">{c.km_parcursi} km</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${c.activ === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.activ === 1 ? 'Activ' : 'Inactiv'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => { setFormData(c); setIsEditing(true); }} className="text-blue-600 hover:underline">Editează</button>
                  
                  {c.activ === 1 ? (
                    <button onClick={() => handleDelete(c.id_client)} className="text-red-600 hover:underline">Dezactivează</button>
                  ) : (
                    <button onClick={() => handleActivate(c.id_client)} className="text-green-600 font-bold hover:underline">Activează</button>
                  )}
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">Niciun client nu a fost găsit.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}