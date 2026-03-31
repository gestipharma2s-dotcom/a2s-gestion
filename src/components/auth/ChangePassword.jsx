import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import Button from '../common/Button';

const ChangePassword = () => {
    const { profile } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        try {
            setLoading(true);
            await userService.updatePassword(profile.id, newPassword);
            setSuccess('Votre mot de passe a été mis à jour avec succès.');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Erreur lors du changement de mot de passe:', err);
            setError(err.message || "Une erreur est survenue lors de la mise à jour du mot de passe.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary-dark px-8 py-10 text-white text-center">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <KeyRound size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">Changer mon mot de passe</h2>
                    <p className="text-blue-100 mt-2">
                        Mettez à jour le mot de passe de votre compte ({profile?.email})
                    </p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                            <AlertCircle className="shrink-0 mt-0.5" size={20} />
                            <p>{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
                            <ShieldCheck className="shrink-0 mt-0.5" size={20} />
                            <p>{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                placeholder="Au moins 6 caractères"
                                minLength="6"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmer le nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-shadow"
                                placeholder="Répétez le mot de passe"
                                minLength="6"
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-3 text-lg font-medium shadow-sm"
                                disabled={loading || !newPassword || !confirmPassword}
                            >
                                {loading ? 'Mise à jour...' : 'Enregistrer le nouveau mot de passe'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
