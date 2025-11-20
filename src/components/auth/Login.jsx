import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      // Gérer les différentes erreurs avec authentification locale
      if (err.code === 'AUTH_NOT_INITIALIZED') {
        setError(err.message);
      } else if (err.message?.includes('Email ou mot de passe incorrect')) {
        setError('❌ Email ou mot de passe incorrect');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('⚠️ Veuillez confirmer votre adresse email');
      } else if (err.message?.includes('rate limit')) {
        setError('⚠️ Trop de tentatives. Veuillez réessayer dans un moment.');
      } else if (err.message?.includes('not found')) {
        setError('❌ Cet utilisateur n\'existe pas');
      } else {
        setError(err.message || '❌ Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-primary w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">A2S</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">A2S Gestion</h1>
          <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm whitespace-pre-wrap">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                <LogIn size={20} />
                <span>Se connecter</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>© 2025 SARL A2S - Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
};

export default Login;