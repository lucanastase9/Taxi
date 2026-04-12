import { Mail, Phone, MapPin, CreditCard } from 'lucide-react';

export default function ClientAccount() {
  const accountData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, New York, NY 10001',
    memberSince: 'January 2024',
    totalRides: 47,
    rating: 4.8,
  };

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
                <p className="text-sm text-muted-foreground">Member since {accountData.memberSince}</p>
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
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Payment Method</div>
                <div>•••• •••• •••• 4242</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="text-3xl mb-2">{accountData.totalRides}</div>
            <div className="text-sm text-muted-foreground">Total Rides</div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="text-3xl mb-2">{accountData.rating}</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>

          <div className="bg-card rounded-lg p-6 border border-border">
            <div className="text-3xl mb-2">$1,247</div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1">Notifications</div>
                <div className="text-sm text-muted-foreground">Receive ride updates via SMS</div>
              </div>
              <div className="w-12 h-6 bg-accent rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-primary rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="mb-1">Auto-tip</div>
                <div className="text-sm text-muted-foreground">Automatically add 15% tip</div>
              </div>
              <div className="w-12 h-6 bg-muted rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-card rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
