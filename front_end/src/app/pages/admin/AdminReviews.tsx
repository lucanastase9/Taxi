import { useState, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const res = await fetch('http://localhost:5050/api/admin/reviews');
      const data = await res.json();
      if (Array.isArray(data)) setReviews(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Ești sigur că vrei să ștergi definitiv această recenzie?")) return;
    
    try {
      await fetch(`http://localhost:5050/api/admin/reviews/${id}`, { method: 'DELETE' });
      fetchReviews(); // Reîncărcăm lista după ștergere
    } catch (err) {
      console.error(err);
    }
  };

  // Funcție pentru a desena stelele aurii
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={16} 
            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Moderare Recenzii</h2>
      <p className="text-slate-500 mb-6">Aici poți monitoriza feedback-ul clienților și poți șterge comentariile inadecvate.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r: any) => (
          <div key={r.id_recenzie} className="bg-white p-6 rounded-xl border border-border shadow-sm flex flex-col hover:shadow-md transition-shadow relative group">
            
            {/* Butonul de ștergere (apare la hover) */}
            <button 
              onClick={() => handleDelete(r.id_recenzie)}
              className="absolute top-4 right-4 p-2 bg-red-50 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
              title="Șterge recenzia"
            >
              <Trash2 size={18} />
            </button>

            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-foreground text-lg">{r.nume_client}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">
                  Către: <span className="text-blue-600">{r.nume_sofer}</span>
                </p>
              </div>
            </div>

            <div className="mb-4">
              {renderStars(r.rating)}
            </div>

            <div className="flex-1">
              <p className="text-slate-700 italic">
                "{r.comentariu || 'Clientul nu a lăsat un comentariu scris, doar rating.'}"
              </p>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg border border-dashed">
            Nu există recenzii în sistem momentan.
          </div>
        )}
      </div>
    </div>
  );
}