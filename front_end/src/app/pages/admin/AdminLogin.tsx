import { useState } from 'react';
import { useNavigate } from 'react-router';

export default function AdminLogin() {
  const [parola, setParola] = useState('');
  const [eroare, setEroare] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEroare('');

    try {
      const res = await fetch('http://localhost:5050/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parola })
      });
      
      const data = await res.json();

      if (data.success) {
        // Salvăm în browser dovada că adminul este logat
        localStorage.setItem('isAdminAuth', 'true');
        // Îl trimitem către panoul de gestionare
        navigate('/admin/clients');
      } else {
        setEroare(data.message);
      }
    } catch (err) {
      setEroare('Eroare de conexiune cu serverul.');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-lg shadow-xl w-96">
        <h1 className="text-2xl font-bold mb-2 text-center">Admin Login</h1>
        <p className="text-slate-500 text-sm mb-6 text-center">Introduceți parola de administrator</p>
        
        {eroare && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">
            {eroare}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="password"
            placeholder="Parola..."
            className="w-full border p-3 rounded mb-4"
            value={parola}
            onChange={(e) => setParola(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition">
            Autentificare
          </button>
        </form>
      </div>
    </div>
  );
}