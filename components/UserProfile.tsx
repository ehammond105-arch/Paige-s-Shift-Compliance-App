
import React, { useState, useEffect } from 'react';
import { User, updateProfile, deleteUser } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from '../services/firebase';

interface UserProfileProps {
    user: User;
    onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.displayName || '');
                    setEmail(data.email || '');
                    setPhotoURL(data.photoURL || '');
                } else {
                    // Fallback to Auth data if Firestore doc is missing
                    setName(user.displayName || '');
                    setEmail(user.email || '');
                    setPhotoURL(user.photoURL || '');
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                setMessage({ text: 'Failed to load profile data.', type: 'error' });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        
        try {
            // Update Firestore
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                displayName: name,
                photoURL: photoURL
            });

            // Update Firebase Auth Profile (DisplayName and PhotoURL)
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, {
                    displayName: name,
                    photoURL: photoURL
                });
            }

            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            console.error("Error updating profile:", err);
            setMessage({ text: 'Failed to update profile.', type: 'error' });
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            try {
                // Delete from Firestore
                await deleteDoc(doc(db, "users", user.uid));
                
                // Delete from Auth
                if (auth.currentUser) {
                    await deleteUser(auth.currentUser);
                }
                
                // App.tsx auth listener will handle redirect
            } catch (err) {
                console.error("Error deleting account:", err);
                setMessage({ text: 'Failed to delete account. You may need to sign out and sign in again.', type: 'error' });
            }
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading Profile...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)] border-b border-[var(--color-border-primary)] pb-2">👤 User Profile</h2>

            {message.text && (
                <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]' : 'bg-[var(--color-error-bg)] text-[var(--color-error-text)]'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-[var(--color-bg-primary)] p-6 rounded-xl shadow-lg border border-[var(--color-border-primary)]">
                <div className="flex flex-col items-center mb-6">
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-[var(--color-bg-tertiary)] mb-4 border-2 border-[var(--color-border-accent)]">
                        {photoURL ? (
                            <img src={photoURL} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-[var(--color-text-subtle)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Email (Read Only)</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-primary)] rounded-md shadow-sm bg-[var(--color-disabled-bg)] text-[var(--color-text-subtle)] cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md shadow-sm focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Photo URL / File Name</label>
                        <input
                            type="text"
                            value={photoURL}
                            onChange={(e) => setPhotoURL(e.target.value)}
                            placeholder="https://example.com/photo.jpg"
                            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md shadow-sm focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                        />
                        <p className="mt-1 text-xs text-[var(--color-text-subtle)]">Enter a valid image URL to display your profile picture.</p>
                    </div>

                    <div className="pt-4 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={handleDeleteAccount}
                            className="text-sm text-[var(--color-error-text)] hover:text-[var(--color-error-border)] font-medium transition-colors"
                        >
                            Delete Account
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-bg-accent-primary)] hover:bg-[var(--color-bg-accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-primary)] transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfile;
