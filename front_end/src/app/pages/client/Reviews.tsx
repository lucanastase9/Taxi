import { useState, useEffect } from 'react';
import { Star, ThumbsUp } from 'lucide-react';

export default function ClientReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Preluăm datele din backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const clientId = savedUser.id_client || savedUser.id;

        if (!clientId) {
          setLoading(false);
          return;
        }

        const response = await fetch(`https://untitled-i7lc.onrender.com`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (err) {
        console.error("Eroare la extragerea recenziilor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Calcule dinamice
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: totalReviews > 0 ? (reviews.filter((r) => r.rating === star).length / totalReviews) * 100 : 0,
  }));

  if (loading) return <div className="p-8 text-center text-primary font-bold">Se încarcă recenziile...</div>;

  return (
      <div className="p-8 max-w-4xl mx-auto pb-24">
        <h1 className="mb-8 text-3xl font-bold">Reviews Received</h1>

        {/* SECȚIUNEA DE STATISTICI REVIEWS */}
        <div className="bg-card rounded-lg p-8 border border-border mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="text-center md:text-left min-w-[150px]">
              <div className="text-6xl font-light text-primary mb-2">{avgRating.toFixed(1)}</div>
              <div className="flex items-center gap-1 mb-2 justify-center md:justify-start">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={`avg-star-${i}`}
                        className={`w-5 h-5 ${
                            i < Math.round(avgRating) ? 'fill-accent text-accent' : 'text-muted'
                        }`}
                    />
                ))}
              </div>
              <div className="text-sm text-muted-foreground font-medium">{totalReviews} reviews</div>
            </div>

            <div className="flex-1 w-full">
              {ratingDistribution.map((dist) => (
                  <div key={dist.star} className="flex items-center gap-3 mb-3">
                    <div className="text-sm w-8 font-medium text-muted-foreground">{dist.star} ★</div>
                    <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                          className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${dist.percentage}%` }}
                      />
                    </div>
                    <div className="text-sm w-8 text-right font-medium text-muted-foreground">{dist.count}</div>
                  </div>
              ))}
            </div>
          </div>
        </div>

        {/* LISTA DE RECENZII */}
        {totalReviews === 0 ? (
            <div className="text-center py-12 bg-muted/20 border border-border rounded-xl">
              <p className="text-muted-foreground">Nu ai primit nicio recenzie încă.</p>
            </div>
        ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                  <div key={review.id} className="bg-card rounded-lg p-6 border border-border shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="mb-1 font-bold text-foreground text-lg">{review.driver}</div>
                        <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                          {/* Din moment ce nu avem Data în SQL, vom afișa doar un text generic */}
                          <span>Cursă finalizată</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                              <Star
                                  key={`review-${review.id}-star-${i}`}
                                  className={`w-4 h-4 ${
                                      i < review.rating ? 'fill-accent text-accent' : 'text-muted'
                                  }`}
                              />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-foreground/80 italic">"{review.comment || 'Fără comentariu.'}"</p>

                    <button className="mt-4 flex items-center gap-2 text-sm text-accent hover:opacity-80 transition-opacity font-medium">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful
                    </button>
                  </div>
              ))}
            </div>
        )}

        {/* MESAJ INCURAJARE */}
        {totalReviews > 0 && avgRating >= 4.0 && (
            <div className="mt-8 bg-green-50 rounded-lg p-6 border border-green-200 shadow-sm">
              <h3 className="mb-2 font-bold text-green-800">Keep up the great work!</h3>
              <p className="text-sm text-green-700">
                Your excellent passenger rating helps you get matched with top-rated drivers faster.
              </p>
            </div>
        )}
      </div>
  );
}