import { Mail, Phone, MapPin, Car, FileCheck, Award } from 'lucide-react';

export default function DriverAccount() {
  const accountData = {
    name: 'Robert Williams',
    email: 'robert.williams@example.com',
    phone: '+1 (555) 987-6543',
    address: '456 Oak Ave, Brooklyn, NY 11201',
    memberSince: 'March 2023',
    totalTrips: 342,
    rating: 4.9,
    earnings: 8547,
    vehicle: {
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Silver',
      plate: 'ABC 1234',
    },
  };

  const certificates = [
    { id: 1, name: 'Driver License', number: 'DL-123456789', expiry: '2028-12-31', status: 'active' },
    { id: 2, name: 'Vehicle Registration', number: 'VR-987654321', expiry: '2026-08-15', status: 'active' },
    { id: 3, name: 'Insurance Certificate', number: 'INS-456789123', expiry: '2026-12-31', status: 'active' },
    { id: 4, name: 'Background Check', number: 'BG-789123456', expiry: '2027-03-20', status: 'active' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="mb-8">Account Details</h1>

      <div className="space-y-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-2xl text-primary">
                {accountData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="mb-1">{accountData.name}</h2>
                <p className="text-sm text-muted-foreground">Driver since {accountData.memberSince}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="text-sm">Top Rated Driver</span>
                </div>
              </div>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90">
              Edit Profile
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div>{accountData.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div>{accountData.phone}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Address</div>
                <div>{accountData.address}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Car className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Vehicle</div>
                <div>
                  {accountData.vehicle.year} {accountData.vehicle.make} {accountData.vehicle.model}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="text-3xl mb-2">{accountData.totalTrips}</div>
            <div className="text-sm text-muted-foreground">Total Trips</div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="text-3xl mb-2">{accountData.rating}</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="text-3xl mb-2">${accountData.earnings.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Earnings</div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3>Certificates & Documents</h3>
            <button className="text-sm text-accent hover:underline">Upload New</button>
          </div>

          <div className="space-y-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileCheck className="w-5 h-5 text-accent" />
                  <div>
                    <div className="mb-1">{cert.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {cert.number} • Expires {cert.expiry}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
                    Active
                  </span>
                  <button className="text-sm text-primary hover:underline">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="mb-4">Vehicle Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Make & Model</div>
              <div>{accountData.vehicle.year} {accountData.vehicle.make} {accountData.vehicle.model}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">License Plate</div>
              <div>{accountData.vehicle.plate}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Color</div>
              <div>{accountData.vehicle.color}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Year</div>
              <div>{accountData.vehicle.year}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
