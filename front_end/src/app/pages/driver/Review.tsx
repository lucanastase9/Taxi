import { useState, useEffect } from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';

export default function DriverReviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const driverId = savedUser.id_sofer || savedUser.id;

            if (!driverId) {
                setLoading(false);
                return;
            }

            const response = await fetch(`https://untitled-i7lc.onrender.com`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            }
        } catch (err) {
            console.error("Eroare la preluarea recenziilor șoferului:", err);
        } finally {
            setLoading(false);
        }
    };

    // Calcule statistice
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 5.0;

    const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
        percentage: totalReviews > 0 ? (reviews.filter((r) => r.rating === star).length / totalReviews) * 100 : 0,
    }));

    if (loading) return <div className="p-8 text-center text-primary font-bold">Se încarcă recenziile tale...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto pb-24">
            <h1 className="text-3xl font-bold mb-8">Performance & Reviews</h1>

            {/* CARD STATISTICI SUMAR */}
            <div className="bg-card rounded-lg p-8 border border-border mb-8 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    <div className="text-center min-w-[160px]">
                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-2">Overall Rating</p>
                        <div className="text-7xl font-light text-primary mb-3">{avgRating.toFixed(1)}</div>
                        <div className="flex items-center gap-1 mb-2 justify-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={`avg-star-${i}`}
                                    className={`w-5 h-5 ${
                                        i < Math.round(avgRating) ? 'fill-yellow-500 text-yellow-500' : 'text-muted'
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">Based on {totalReviews} client reviews</p>
                    </div>

                    <div className="flex-1 w-full border-l border-border/50 pl-0 md:pl-10">
                        <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-4">Rating Breakdown</p>
                        {ratingDistribution.map((dist) => (
                            <div key={dist.star} className="flex items-center gap-4 mb-3">
                                <div className="text-xs font-bold w-10 text-muted-foreground">{dist.star} Stars</div>
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500 rounded-full transition-all duration-700 ease-in-out"
                                        style={{ width: `${dist.percentage}%` }}
                                    />
                                </div>
                                <div className="text-xs w-8 text-right font-bold text-foreground">{dist.count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* LISTA DE RECENZII INDIVIDUALE */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground mb-4">Recent Feedback</h3>

                {totalReviews === 0 ? (
                    <div className="text-center py-12 bg-muted/20 border border-border rounded-xl">
                        <p className="text-muted-foreground italic">Nu ai primit nicio recenzie de la clienți încă.</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-card rounded-lg p-6 border border-border shadow-sm hover:border-primary/30 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground">{review.passenger || 'Anonymous Client'}</div>
                                        <div className="flex items-center gap-1 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={`review-${review.id}-star-${i}`}
                                                    className={`w-3.5 h-3.5 ${
                                                        i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded">Verified Trip</span>
                            </div>

                            <p className="text-foreground/80 leading-relaxed italic">
                                "{review.comment || 'Clientul nu a lăsat un comentariu scris.'}"
                            </p>

                            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                                <button className="flex items-center gap-2 text-xs font-bold text-primary hover:opacity-70 transition-opacity uppercase tracking-wider">
                                    <ThumbsUp size={14} />
                                    Appreciate Feedback
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* CALL TO ACTION PENTRU PERFORMANȚĂ */}
            <div className="mt-10 p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-primary">Vrei un rating mai mare?</h4>
                    <p className="text-sm text-muted-foreground">Menține mașina curată și fii politicos pentru a primi mai multe recenzii de 5 stele.</p>
                </div>
            </div>
        </div>
    );
}