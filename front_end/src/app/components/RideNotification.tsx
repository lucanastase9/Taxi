import { X, MapPin, Navigation, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RideNotificationProps {
  show: boolean;
  onClose: () => void;
  onAccept: () => void;
  ride: {
    pickup: string;
    destination: string;
    distance: string;
    fare: number;
    passengerName: string;
  };
}

export default function RideNotification({ show, onClose, onAccept, ride }: RideNotificationProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg border-2 border-accent shadow-2xl z-50 w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="mb-1">New Ride Request!</h2>
                  <p className="text-sm text-muted-foreground">Passenger nearby (&lt; 1km)</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Passenger</div>
                  <div>{ride.passengerName}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-accent mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-muted-foreground">Pickup</div>
                      <div className="text-sm">{ride.pickup}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-muted-foreground">Destination</div>
                      <div className="text-sm">{ride.destination}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-accent" />
                    <div>
                      <div className="text-sm text-muted-foreground">Estimated Fare</div>
                      <div className="text-xl">${ride.fare.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Distance</div>
                    <div>{ride.distance}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={onAccept}
                  className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Accept Ride
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
