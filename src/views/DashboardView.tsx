import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string | number;
  fullName: string;
  email: string;
  avatar?: string;
}

export function DashboardView() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. On récupère l'ID de l'utilisateur stocké lors de la connexion
    const currentUserId = localStorage.getItem('userId');

    // 2. Si on ne trouve pas d'ID, on bloque l'accès
    if (!currentUserId) {
      setError("Aucun utilisateur connecté. Veuillez vous connecter.");
      setIsLoading(false);
      return; 
    }

    // 3. On fetch uniquement cet utilisateur spécifique
    fetch(`http://localhost:3001/users/${currentUserId}`)
      .then((response) => {
        if (!response.ok) throw new Error('Impossible de trouver ce compte');
        return response.json();
      })
      .then((data: User) => {
        setUser(data);
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // 4. Fonction pour gérer l'upload et la conversion de l'avatar en Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    
    reader.onloadend = () => {
      const base64String = reader.result as string;

      fetch(`http://localhost:3001/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: base64String })
      })
      .then(res => res.json())
      .then((updatedUser: User) => {
        setUser(updatedUser); // Met à jour l'interface avec la nouvelle image
      })
      .catch(err => console.error("Erreur de sauvegarde:", err));
    };

    reader.readAsDataURL(file); // Déclenche la conversion en Base64
  };

  // 5. Fonction pour se déconnecter
  const handleLogout = () => {
    localStorage.removeItem('userId'); // On supprime l'ID du navigateur
    navigate('/login'); // On renvoie à la page de connexion
  };

  return (
    <main className="app-shell">
      <section className="auth-card" style={{ width: 'min(100%, 600px)' }}>
        <header className="auth-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p className="auth-kicker">LinkStart</p>
            <h1 className="auth-title">Mon Profil</h1>
            <p className="auth-subtitle">Bienvenue dans ton espace personnel.</p>
          </div>
          
          {/* Bouton de déconnexion */}
          {user && (
            <button 
              onClick={handleLogout}
              style={{
                background: 'none', border: 'none', color: '#b42318', 
                cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem',
                padding: '0.5rem'
              }}
            >
              Déconnexion
            </button>
          )}
        </header>

        <div style={{ marginTop: 'var(--space-4)' }}>
          {isLoading && <p>Chargement du profil...</p>}
          
          {error && (
            <div>
               <p className="form-message is-error">{error}</p>
               {/* Si erreur (ex: pas connecté), on lui propose de retourner au login */}
               <button onClick={() => navigate('/login')} className="btn-primary" style={{marginTop: '1rem'}}>
                 Aller à la connexion
               </button>
            </div>
          )}
          
          {!isLoading && !error && user && (
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
              <div 
                style={{ 
                  padding: 'var(--space-4)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-muted)',
                  textAlign: 'center'
                }}
              >
                {/* Avatar cliquable pour upload */}
                <label 
                  htmlFor="avatar-upload" 
                  style={{ cursor: 'pointer', display: 'inline-block' }}
                  title="Changer la photo de profil"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={`Avatar de ${user.fullName}`}
                      style={{ 
                        width: '80px', height: '80px', 
                        borderRadius: '50%', objectFit: 'cover',
                        margin: '0 auto var(--space-3)',
                        border: '2px solid var(--color-primary)'
                      }} 
                    />
                  ) : (
                    <div style={{ 
                      width: '80px', height: '80px', 
                      backgroundColor: 'var(--color-primary)', color: 'white', 
                      borderRadius: '50%', display: 'grid', placeItems: 'center', 
                      fontSize: '2rem', fontWeight: 'bold', margin: '0 auto var(--space-3)' 
                    }}>
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                </label>
                
                {/* Input file caché */}
                <input 
                  type="file" id="avatar-upload" accept="image/png, image/jpeg, image/webp" 
                  style={{ display: 'none' }} onChange={handleImageUpload}
                />
                
                <h2 style={{ margin: '0 0 var(--space-1)', fontSize: '1.2rem' }}>
                  {user.fullName}
                </h2>
                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}