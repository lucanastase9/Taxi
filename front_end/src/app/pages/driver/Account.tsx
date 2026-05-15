import { useState, useEffect } from 'react';
import { Mail, Phone, Car, Award, Save, X, FileText, Circle, ClipboardCheck} from 'lucide-react';

export default function DriverAccount() {
  const [driver, setDriver] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  //modul de upload pt certificat
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newCert, setNewCert] = useState({
    tip: 'Driver License',
    data_expirare: '',
    fileData: ''
  });

  useEffect(() => {
    fetchDriverData();
  }, []);

  const fetchDriverData = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const driverId = savedUser.id_sofer || savedUser.id;

      if (!driverId) {
        console.error("No driver ID found in localStorage");
        setLoading(false);
        return;
      }

      const initialData = {
        id_sofer: driverId,
        nume: savedUser.nume || '',
        mail: savedUser.mail || '',
        telefon: savedUser.telefon || '',
        cnp: savedUser.cnp || '',
        nr_inmatriculare: savedUser.nr_inmatriculare || '',
        model: savedUser.model || '',
        categorie: savedUser.categorie || 'Standard',
        km_parcursi: savedUser.km_parcursi || 0,
        an_fabricare: savedUser.an_fabricare || '',
        culoare: savedUser.culoare || '',
        totalTrips: 0,
        rating: 5.0,
        totalEarnings: 0,
        certificates: []
      };

      setDriver(initialData);
      setEditData(initialData);

      const response = await fetch(`https://untitled-i7lc.onrender.com`, {
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        if (data) {
          const formattedData = {
            id_sofer: driverId,
            nume: data.nume || initialData.nume,
            mail: data.mail || initialData.mail,
            telefon: data.telefon || initialData.telefon,
            cnp: data.cnp || initialData.cnp,
            nr_inmatriculare: data.nr_inmatriculare || initialData.nr_inmatriculare,
            model: data.model || initialData.model,
            categorie: data.categorie || initialData.categorie,
            km_parcursi: data.km_parcursi || initialData.km_parcursi,
            an_fabricare: data.an_fabricare || initialData.an_fabricare,
            culoare: data.culoare || initialData.culoare,
            totalTrips: data.totalTrips || 0,
            rating: data.rating || 5.0,
            totalEarnings: data.totalEarnings || 0,
            certificates: data.certificates || []
          };
          setDriver(formattedData);
          setEditData(formattedData);
          localStorage.setItem('user', JSON.stringify({ ...savedUser, ...formattedData }));
        }
      }
    } catch (err) {
      console.error("Error fetching driver data:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Fișierul este prea mare! (Maxim 5MB).");
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCert({ ...newCert, fileData: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSave = async () => {
    if (!editData.id_sofer) {
      alert("Error: Driver ID is missing from the request!");
      return;
    }

    try {
      const response = await fetch('https://untitled-i7lc.onrender.com', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      const data = await response.json();
      if (data.success) {
        setDriver(editData);
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...editData }));

        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Server error: " + data.message);
      }
    } catch (err) {
      alert("Network error. Please check if backend is running.");
    }
  };
  const handleUploadCertificate = async () => {
    if (!newCert.data_expirare) {
      alert("Please select an expiration date!");
      return;
    }

    try {
      const response = await fetch('https://untitled-i7lc.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sofer_id_sofer: driver.id_sofer,
          certificat_tip: newCert.tip,
          data_exp_certif: newCert.data_expirare,
          fileData: newCert.fileData
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowUploadModal(false);
        setNewCert({ tip: 'Driver License', data_expirare: '', fileData: '' });
        fetchDriverData();
      } else {
        alert("Server error: " + data.message);
      }
    } catch (err) {
      alert("Network error while uploading certificate.");
    }
  };
  const getCertDetails = (cert: any) => {
    let prefix = "DOC";
    if (cert.certificat_tip === "Driver License") prefix = "DL";
    else if (cert.certificat_tip === "Vehicle Registration") prefix = "VR";
    else if (cert.certificat_tip === "Insurance Certificate") prefix = "INS";
    else if (cert.certificat_tip === "Background Check") prefix = "BG";

    const expDate = new Date(cert.data_exp_certif);
    const isExpired = expDate < new Date(); // Comparăm cu ziua de azi
    const formattedDate = expDate.toISOString().split('T')[0];

    return { prefix, isExpired, formattedDate };
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 10) {
      setEditData({ ...editData, telefon: value });
    }
  };

  const handleCnpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 13) {
      setEditData({ ...editData, cnp: value });
    }
  };

  if (loading) return <div className="p-8 text-center text-primary">Loading profile...</div>;
  if (!driver) return <div className="p-8 text-center text-red-500">Profile not found. Please log in again.</div>;

  return (
      <div className="p-8 max-w-4xl mx-auto pb-20 relative">

        {/* === MODAL UPLOAD CERTIFICAT === */}
        {showUploadModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card p-8 rounded-xl shadow-2xl w-full max-w-md border border-border">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-foreground">Upload Document</h3>
                  <button onClick={() => setShowUploadModal(false)} className="text-muted-foreground hover:text-red-500">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col gap-4 mb-6">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Document Type</label>
                    <select
                        className="w-full bg-muted p-3 rounded-lg border border-border outline-none focus:border-primary"
                        value={newCert.tip}
                        onChange={(e) => setNewCert({...newCert, tip: e.target.value})}
                    >
                      <option value="Driver License">Driver License</option>
                      <option value="Vehicle Registration">Vehicle Registration</option>
                      <option value="Insurance Certificate">Insurance Certificate</option>
                      <option value="Background Check">Background Check</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">Expiration Date</label>
                    <input
                        type="date"
                        className="w-full bg-muted p-3 rounded-lg border border-border outline-none focus:border-primary"
                        value={newCert.data_expirare}
                        onChange={(e) => setNewCert({...newCert, data_expirare: e.target.value})}
                    />
                  </div>
                  {/* --- INPUT FIȘIER --- */}
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-1 block">
                      Upload File (PDF, JPG, PNG)
                    </label>
                    <input
                        type="file"
                        accept=".pdf, image/*"
                        onChange={handleFileChange}
                        className="w-full bg-muted p-2 rounded-lg border border-border outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowUploadModal(false)} className="px-5 py-2 rounded-lg font-semibold text-muted-foreground hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleUploadCertificate} className="px-5 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    Upload
                  </button>
                </div>
              </div>
            </div>
        )}
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Driver Profile</h1>
          {!isEditing ? (
              <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-semibold"
              >
                Edit Profile
              </button>
          ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Save size={18} /> Save
                </button>
                <button onClick={() => { setIsEditing(false); setEditData(driver); }} className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  <X size={18} /> Cancel
                </button>
              </div>
          )}
        </div>

        {/* DATE PERSONALE */}
        <div className="bg-card rounded-lg p-8 border border-border shadow-md">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-3xl text-primary font-bold shadow-inner">
              {driver.nume ? driver.nume[0].toUpperCase() : 'D'}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-foreground">{driver.nume}</h2>
              <p className="text-sm text-green-600 flex items-center gap-2 mt-2 font-medium">
                <Circle size={12} className="fill-green-600 text-green-600" /> Online
              </p>

              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1 font-medium">
                <Award size={16} className="text-yellow-500" /> Verified RideShare Partner
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full"><Mail className="text-primary" size={20} /></div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Email</p>
                <p className="font-medium text-foreground/80">{driver.mail}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full"><Phone className="text-primary" size={20} /></div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Phone Number</p>
                {isEditing ? (
                    <input
                        className="w-full bg-muted p-2 rounded border border-border focus:border-primary outline-none"
                        value={editData.telefon}
                        onChange={handlePhoneChange}
                        placeholder="e.g. 0722123456"
                        inputMode="numeric"
                    />
                ) : (
                    <p className="font-medium text-foreground">{driver.telefon || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full"><FileText className="text-primary" size={20} /></div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Personal ID (CNP)</p>
                {isEditing ? (
                    <input
                        className="w-full bg-muted p-2 rounded border border-border focus:border-primary outline-none"
                        value={editData.cnp}
                        onChange={handleCnpChange}
                        placeholder="13 digits"
                        inputMode="numeric"
                    />
                ) : (
                    <p className="font-medium text-foreground">{driver.cnp || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-full"><Car className="text-primary" size={20} /></div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Vehicle Registration</p>
                {isEditing ? (
                    <input
                        className="w-full bg-muted p-2 rounded border border-border focus:border-primary outline-none"
                        value={editData.nr_inmatriculare}
                        onChange={(e) => setEditData({ ...editData, nr_inmatriculare: e.target.value })}
                        placeholder="e.g. B 123 TAX"
                    />
                ) : (
                    <p className="font-medium text-foreground">{driver.nr_inmatriculare || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8">
          {/* Card Total Trips */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm flex flex-col justify-center">
            <div className="text-4xl text-primary font-light mb-1">{driver.totalTrips}</div>
            <div className="text-sm text-muted-foreground font-medium">Total Trips</div>
          </div>
          {/* Card Average Rating */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm flex flex-col justify-center">
            <div className="text-4xl text-primary font-light mb-1">{driver.rating}</div>
            <div className="text-sm text-muted-foreground font-medium">Average Rating</div>
          </div>
          {/* Card Total Earnings */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm flex flex-col justify-center">
            {/* Afișăm suma formatată ca monedă (LEI sau USD) */}
            <div className="text-4xl text-primary font-light mb-1">
              {driver.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} lei
            </div>
            <div className="text-sm text-muted-foreground font-medium">Total Earnings</div>
          </div>
        </div>
        {/* === CARD DETALII VEHICUL === */}
        <div className="bg-card rounded-lg p-8 border border-border shadow-md mt-8">
          <h3 className="text-2xl font-bold mb-6 text-foreground">Vehicle Details</h3>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">

            {/* Make & Model */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Make & Model</p>
              {isEditing ? (
                  <input
                      className="w-full bg-muted p-2 rounded border border-border focus:border-primary outline-none"
                      value={editData.model}
                      onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                      placeholder="e.g. Toyota Camry"
                  />
              ) : (
                  <p className="text-lg font-medium text-foreground">{driver.model || 'Not provided'}</p>
              )}
            </div>

            {/* License Plate */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">License Plate</p>
              {isEditing ? (
                  <input
                      className="w-full bg-muted p-2 rounded border border-border focus:border-primary outline-none"
                      value={editData.nr_inmatriculare}
                      onChange={(e) => setEditData({ ...editData, nr_inmatriculare: e.target.value })}
                      placeholder="e.g. B 123 TAX"
                  />
              ) : (
                  <p className="text-lg font-medium text-foreground">{driver.nr_inmatriculare || 'Not provided'}</p>
              )}
            </div>

            {/* Color */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Color</p>
              {isEditing ? (
                  <input
                      className="w-full bg-muted p-2 rounded border border-border focus:border-primary outline-none"
                      value={editData.culoare || ''}
                      onChange={(e) => setEditData({ ...editData, culoare: e.target.value })}
                      placeholder="e.g. Silver"
                  />
              ) : (
                  <p className="text-lg font-medium text-foreground">{driver.culoare || 'Not provided'}</p>
              )}
            </div>

            {/* Year */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Year</p>
              {isEditing ? (
                  <input
                      type="number"
                      className="w-full bg-muted p-2 rounded border border-border focus:border-primary outline-none"
                      value={editData.an_fabricare || ''}
                      onChange={(e) => setEditData({ ...editData, an_fabricare: e.target.value })}
                      placeholder="e.g. 2022"
                  />
              ) : (
                  <p className="text-lg font-medium text-foreground">{driver.an_fabricare || 'Not provided'}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Category</p>
              {isEditing ? (
                  <select
                      className="w-full bg-muted p-2 rounded border border-border focus:border-primary outline-none"
                      value={editData.categorie}
                      onChange={(e) => setEditData({ ...editData, categorie: e.target.value })}
                  >
                    <option value="Economy">Economy</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="XL">XL</option>
                  </select>
              ) : (
                  <p className="text-lg font-medium text-foreground">{driver.categorie || 'Not provided'}</p>
              )}
            </div>

            {/* KM Parcursi */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Mileage (Km)</p>
              <p className="text-lg font-medium text-foreground">
                {driver.km_parcursi ? `${Number(driver.km_parcursi).toLocaleString()} km` : '0 km'}
              </p>
              {isEditing && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Calculated automatically from your trips.
                  </p>
              )}
            </div>
          </div>
        </div>

        {/* CERTIFICATE & DOCUMENTS */}
        <div className="bg-card rounded-lg p-8 border border-border shadow-md mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-[#1B2B48]">Certificates & Documents</h3>
            {/* AM ADAUGAT EVENIMENTUL ONCLICK PE BUTONUL UPLOAD */}
            <button
                onClick={() => setShowUploadModal(true)}
                className="text-sm font-semibold text-[#B88645] hover:text-[#9A6D33] transition-colors"
            >
              Upload New
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {driver.certificates && driver.certificates.length > 0 ? (
                driver.certificates.map((cert: any) => {
                  const { prefix, isExpired, formattedDate } = getCertDetails(cert);

                  return (
                      <div key={cert.id_certificat} className="bg-[#EFE8D6] rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between border border-[#E5DECD] gap-4">
                        <div className="flex items-center gap-4">
                          <div className="text-[#D0A46F]">
                            <ClipboardCheck size={28} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-[#1B2B48] font-medium text-lg leading-tight">{cert.certificat_tip}</p>
                            <p className="text-sm text-slate-500 mt-1">
                              {prefix}-{cert.id_certificat}89123456 • Expires {formattedDate}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 self-end md:self-auto">
                          <span className={`px-4 py-1 rounded-full text-xs font-semibold tracking-wide uppercase 
                            ${isExpired ? 'bg-red-200/50 text-red-700' : 'bg-[#E3D1B4] text-[#8C6239]'}`}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                          <button
                              onClick={() => window.open(`https://untitled-i7lc.onrender.com`, '_blank')}
                              className="font-bold text-[#1B2B48] hover:opacity-70 transition-opacity"
                          >
                            View
                          </button>
                        </div>
                      </div>
                  );
                })
            ) : (
                <p className="text-muted-foreground italic bg-muted p-4 rounded-lg text-center">
                  No documents uploaded yet.
                </p>
            )}
          </div>
        </div>

      </div>
  );
}