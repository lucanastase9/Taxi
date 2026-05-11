import { useState, useEffect } from 'react';

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const [formData, setFormData] = useState({ cod_discount: '', valoare: '', data_expirare: '', tip_valoare: 'procent' });

  const fetchDiscounts = async () => {
    try {
      const res = await fetch('http://localhost:5050/api/admin/discounts');
      const data = await res.json();
      if (Array.isArray(data)) setDiscounts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchDiscounts(); }, []);

  // Creare discount nou
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:5050/api/admin/discounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    fetchDiscounts();
    setFormData({ cod_discount: '', valoare: '', data_expirare: '', tip_valoare: 'procent' });
  };

  // Alocare discount unui client
  const handleAssign = async (id_discount: number) => {
    const id_client = prompt("Introduceți ID-ul Clientului care primește acest discount:");
    if (!id_client) return;

    try {
      const res = await fetch('http://localhost:5050/api/admin/assign-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id_client: parseInt(id_client), discount_id_discount: id_discount })
      });
      const data = await res.json();
      alert(data.message); // Arată dacă a reușit sau dacă îl are deja
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Campanii Promoționale & Discounturi</h2>

      {/* Formular Adăugare Discount */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm mb-8 grid grid-cols-4 gap-4 items-end border">
        <div>
          <label className="block text-sm mb-1">Cod (ex: TAXI20)</label>
          <input type="text" value={formData.cod_discount} onChange={e => setFormData({...formData, cod_discount: e.target.value.toUpperCase()})} className="w-full border p-2 rounded uppercase" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Valoare</label>
          <input type="number" value={formData.valoare} onChange={e => setFormData({...formData, valoare: e.target.value})} className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Tip (Procent / Sumă fixă)</label>
          <select value={formData.tip_valoare} onChange={e => setFormData({...formData, tip_valoare: e.target.value})} className="w-full border p-2 rounded">
            <option value="procent">Procent (%)</option>
            <option value="fix">Sumă Fixă (RON)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Data Expirare</label>
          <input type="datetime-local" value={formData.data_expirare} onChange={e => setFormData({...formData, data_expirare: e.target.value})} className="w-full border p-2 rounded" required />
        </div>
        <div className="col-span-4 mt-2">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">Adaugă Campanie</button>
        </div>
      </form>

      {/* Tabel Discounturi */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Cod Promoțional</th>
              <th className="p-4">Valoare</th>
              <th className="p-4">Expiră la</th>
              <th className="p-4 text-right">Acțiuni N:M</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((d: any) => (
              <tr key={d.id_discount} className="border-b">
                <td className="p-4 font-bold text-blue-600">{d.cod_discount}</td>
                <td className="p-4">{d.valoare} {d.tip_valoare === 'procent' ? '%' : 'RON'}</td>
                <td className="p-4">{new Date(d.data_expirare).toLocaleString('ro-RO')}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleAssign(d.id_discount)} className="bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition text-sm font-medium">
                    + Oferă unui Client
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}