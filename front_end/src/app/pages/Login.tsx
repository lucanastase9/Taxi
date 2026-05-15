import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Car } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'client' | 'driver'>('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Mesaj pentru creare cont reușită
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const endpoint = mode === 'login' ? '/api/login' : '/api/signup';

    // Adăugăm userType în payload pentru ca backend-ul să știe tabelul
    const payload = mode === 'login'
        ? { email, parola: password, userType }
        : { nume: name, email, parola: password, userType };

    try {
      const response = await fetch(`http://localhost:5050${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        if (mode === 'login') {
          localStorage.setItem('user', JSON.stringify(data.user));
          if (userType === 'client') {
            navigate('/client');
          } else {
            navigate('/driver');
          }
        } else {
          setSuccessMessage("Cont creat cu succes! Te rugăm să te autentifici.");
          setMode('login');
          setName('');
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Eroare rețea:', err);
      setError('Nu mă pot conecta la server. Verifică dacă backend-ul este pornit!');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-2 text-primary">RideShare</h1>
          <p className="text-muted-foreground">Your journey starts here</p>
        </div>

        <div className="bg-card rounded-lg p-8 border border-border shadow-sm">
          <div className="flex gap-2 mb-8 bg-muted rounded-lg p-1">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 rounded transition-colors ${
                mode === 'login' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 rounded transition-colors ${
                mode === 'signup' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setUserType('client')}
              className={`flex-1 p-6 rounded-lg border-2 transition-all ${
                userType === 'client'
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <User className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-sm">Client</div>
            </button>
            <button
              onClick={() => setUserType('driver')}
              className={`flex-1 p-6 rounded-lg border-2 transition-all ${
                userType === 'driver'
                  ? 'border-accent bg-accent/10'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <Car className="w-8 h-8 mx-auto mb-3 text-primary" />
              <div className="text-sm">Driver</div>
            </button>
          </div>

          {/* Afișare erori */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {/* Afișare mesaj succes */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500 rounded-lg text-green-600 text-sm text-center font-medium">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm mb-2 text-foreground">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm mb-2 text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-foreground">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-input-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              {mode === 'login' ? 'Login' : 'Sign Up'} as {userType === 'client' ? 'Client' : 'Driver'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}