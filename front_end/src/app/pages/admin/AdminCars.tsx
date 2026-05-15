import { useState, useEffect } from 'react';

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [freeDrivers, setFreeDrivers] = useState([]);
  const [formData, setFormData] = useState({
    sofer_id_sofer: '', nr_inmatriculare: '', model: '', categorie: 'Standard', culoare: '', an_fabricare: 2024
  });

  const fetchData = async () => {
    try {
      const resCars = await fetch('http://localhost:5050/api/admin/cars');
      const dataCars = await resCars.json();
      if (Array.isArray(dataCars)) setCars(dataCars);

      const resDrivers = await fetch('http://localhost:5050/api/admin/drivers-without-cars');
      const dataDrivers = await resDrivers.json();
      if (Array.isArray(dataDrivers)) setFreeDrivers(dataDrivers);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sofer_id_sofer) return alert("Trebuie să selectezi un șofer liber!");

    await fetch('http://localhost:5050/api/admin/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    fetchData(); // Refresh la ambele liste
    setFormData({ sofer_id_sofer: '', nr_inmatriculare: '', model: '', categorie: 'Standard', culoare: '', an_fabricare: 2024 });
  };

  const handleDelete = async (sofer_id: number) => {
    if(!confirm("Ștergi această mașină? Șoferul va rămâne fără vehicul.")) return;
    await fetch(`http://localhost:5050/api/admin/cars/${sofer_id}`, { method: 'DELETE' });
    fetchData();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Flota Auto (Relație 1:1)</h2>

      {/* Formular */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-8 grid grid-cols-3 gap-4 items-end border">
        
        <div className="col-span-3 md:col-span-1">
          <label className="block text-sm font-bold text-blue-600 mb-1">Asignează unui Șofer Liber</label>
          <select 
            value={formData.sofer_id_sofer} 
            onChange={e => setFormData({...formData, sofer_id_sofer: e.target.value})} 
            className="w-full border p-2 rounded bg-blue-50" required
          >
            <option value="">-- Alege Șofer --</option>
            {freeDrivers.map((d: any) => (
              <option key={d.id_sofer} value={d.id_sofer}>{d.nume} (ID: {d.id_sofer})</option>
            ))}
            {freeDrivers.length === 0 && <option value="" disabled>Niciun șofer liber disponibil!</option>}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Nr. Înmatriculare</label>
          <input type="text" value={formData.nr_inmatriculare} onChange={e => setFormData({...formData, nr_inmatriculare: e.target.value.toUpperCase()})} className="w-full border p-2 rounded uppercase" placeholder="B 123 ABC" required />
        </div>
        
        <div>
          <label className="block text-sm mb-1">Model Mașină</label>
          <input type="text" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full border p-2 rounded" placeholder="Dacia Logan" required />
        </div>

        <div>
          <label className="block text-sm mb-1">Categorie</label>
          <select value={formData.categorie} onChange={e => setFormData({...formData, categorie: e.target.value})} className="w-full border p-2 rounded">
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
            <option value="Electric">Electric</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Culoare</label>
          <input type="text" value={formData.culoare} onChange={e => setFormData({...formData, culoare: e.target.value})} className="w-full border p-2 rounded" required />
        </div>

        <div>
          <button type="submit" disabled={freeDrivers.length === 0} className="w-full bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400">
            Adaugă Vehicul
          </button>
        </div>
      </form>

      {/* Tabel */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Nr. Înmatriculare</th>
              <th className="p-4">Model & Culoare</th>
              <th className="p-4">Categorie</th>
              <th className="p-4 font-bold text-blue-600">Șofer Asignat</th>
              <th className="p-4 text-right">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((c: any) => (
              <tr key={c.nr_inmatriculare} className="border-b">
                <td className="p-4 font-bold uppercase">{c.nr_inmatriculare}</td>
                <td className="p-4">{c.model} ({c.culoare})</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${c.categorie === 'Premium' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {c.categorie}
                    </span>
                </td>
                <td className="p-4 font-medium">{c.nume_sofer}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(c.sofer_id_sofer)} className="text-red-600 hover:underline text-sm font-medium">Elimină</button>
                </td>
              </tr>
            ))}
            {cars.length === 0 && (
                <tr><td colSpan={5} className="p-4 text-center text-gray-500">Nu există mașini înregistrate.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}