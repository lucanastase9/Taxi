import { useState, useEffect } from 'react';

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({ id_sofer: null, nume: '', telefon: '', mail: '', parola: '', cnp: '' });
  const [isEditing, setIsEditing] = useState(false);

  const fetchDrivers = async () => {
    try {
      const res = await fetch('http://localhost:5050/api/admin/drivers');
      const data = await res.json();
      if (Array.isArray(data)) setDrivers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditing 
        ? `http://localhost:5050/api/admin/drivers/${formData.id_sofer}` 
        : 'http://localhost:5050/api/admin/drivers';
    const method = isEditing ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    fetchDrivers();
    setFormData({ id_sofer: null, nume: '', telefon: '', mail: '', parola: '', cnp: '' });
    setIsEditing(false);
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Dezactivezi acest șofer?")) return;
    await fetch(`http://localhost:5050/api/admin/drivers/${id}`, { method: 'DELETE' });
    fetchDrivers();
  };

  // NOU: Funcția de reactivare
  const handleActivate = async (id: number) => {
    if(!confirm("Re-activezi acest șofer?")) return;
    await fetch(`http://localhost:5050/api/admin/drivers/${id}/activate`, { method: 'PUT' });
    fetchDrivers();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestionare Șoferi</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-8 grid grid-cols-3 gap-4 items-end border">
        <div className="col-span-1">
          <label className="block text-sm">Nume</label>
          <input type="text" value={formData.nume || ''} onChange={e => setFormData({...formData, nume: e.target.value})} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input type="email" value={formData.mail || ''} onChange={e => setFormData({...formData, mail: e.target.value})} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm">Telefon</label>
          <input type="text" value={formData.telefon || ''} onChange={e => setFormData({...formData, telefon: e.target.value})} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm">CNP</label>
          <input type="text" value={formData.cnp || ''} onChange={e => setFormData({...formData, cnp: e.target.value})} className="w-full border p-2 rounded" required />
        </div>
        {!isEditing && (
          <div>
            <label className="block text-sm">Parolă</label>
            <input type="text" value={formData.parola || ''} onChange={e => setFormData({...formData, parola: e.target.value})} className="w-full border p-2 rounded" required />
          </div>
        )}
        <div className="flex gap-2">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex-1">
            {isEditing ? 'Salvează' : 'Adaugă'}
          </button>
          {isEditing && (
            <button type="button" onClick={() => {setIsEditing(false); setFormData({id_sofer:null, nume:'', telefon:'', mail:'', parola:'', cnp:''})}} className="bg-gray-400 text-white px-4 py-2 rounded">Anulează</button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Nume</th>
              <th className="p-4">Email</th>
              <th className="p-4">Status Activitate</th>
              <th className="p-4">Status Cont</th>
              <th className="p-4 text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d: any) => (
              <tr key={d.id_sofer} className="border-b">
                <td className="p-4">{d.nume}</td>
                <td className="p-4">{d.mail}</td>
                <td className="p-4 text-sm uppercase font-bold">{d.status}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${d.activ === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {d.activ === 1 ? 'Activ' : 'Inactiv'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => {setFormData(d); setIsEditing(true);}} className="text-blue-600 hover:underline">Editează</button>
                  
                  {/* Logică schimbată aici: arătăm buton diferit în funcție de status */}
                  {d.activ === 1 ? (
                    <button onClick={() => handleDelete(d.id_sofer)} className="text-red-600 hover:underline">Dezactivează</button>
                  ) : (
                    <button onClick={() => handleActivate(d.id_sofer)} className="text-green-600 font-bold hover:underline">Activează</button>
                  )}
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}