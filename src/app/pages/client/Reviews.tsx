import { Star, ThumbsUp } from 'lucide-react';

export default function ClientReviews() {
  const reviews = [
    {
      id: 1,
      driver: 'Michael Smith',
      date: '2026-04-10',
      rating: 5,
      comment: 'Excellent passenger! Very polite and respectful.',
      trip: 'Main St → Central Park',
    },
    {
      id: 2,
      driver: 'Sarah Johnson',
      date: '2026-04-08',
      rating: 5,
      comment: 'Great passenger, on time and friendly.',
      trip: 'JFK Airport → Main St',
    },
    {
      id: 3,
      driver: 'David Lee',
      date: '2026-04-05',
      rating: 5,
      comment: 'Perfect passenger! Would love to drive again.',
      trip: 'Times Square → Brooklyn Bridge',
    },
    {
      id: 4,
      driver: 'Emily Chen',
      date: '2026-04-02',
      rating: 4,
      comment: 'Good passenger, easy ride.',
      trip: 'Grand Central → Empire State',
    },
  ];

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
  }));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="mb-8">Reviews Received</h1>

      <div className="bg-card rounded-lg p-8 border border-border mb-8">
        <div className="flex items-start gap-8">
          <div className="text-center">
            <div className="text-5xl mb-2">{avgRating.toFixed(1)}</div>
            <div className="flex items-center gap-1 mb-2 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={`avg-star-${i}`}
                  className={`w-5 h-5 ${
                    i < Math.round(avgRating) ? 'fill-accent text-accent' : 'text-muted'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground">{reviews.length} reviews</div>
          </div>

          <div className="flex-1">
            {ratingDistribution.map((dist) => (
              <div key={dist.star} className="flex items-center gap-3 mb-2">
                <div className="text-sm w-8">{dist.star} ★</div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <div className="text-sm w-8 text-right text-muted-foreground">{dist.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-card rounded-lg p-6 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="mb-1">{review.driver}</div>
                <div className="text-sm text-muted-foreground mb-2">{review.date}</div>
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
              <div className="text-sm text-muted-foreground">{review.trip}</div>
            </div>

            <p className="text-muted-foreground">{review.comment}</p>

            <button className="mt-4 flex items-center gap-2 text-sm text-accent hover:underline">
              <ThumbsUp className="w-4 h-4" />
              Helpful
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-accent/10 rounded-lg p-6 border border-accent/30">
        <h3 className="mb-2">Keep up the great work!</h3>
        <p className="text-sm text-muted-foreground">
          Your excellent passenger rating helps you get matched with top-rated drivers faster.
        </p>
      </div>
    </div>
  );
}
