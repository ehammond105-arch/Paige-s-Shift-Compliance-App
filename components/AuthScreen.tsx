
import React, { useState } from 'react';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from '../services/firebase';

const AuthScreen: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
    const [resetEmailSent, setResetEmailSent] = useState(false);

    // Helper to ensure user is in Firestore
    const ensureUserInFirestore = async (user: any, displayName?: string | null) => {
        const userRef = doc(db, "users", user.uid);
        try {
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    displayName: displayName || user.displayName || '',
                    photoURL: user.photoURL || '',
                    createdAt: new Date().toISOString(),
                    role: 'employee', 
                    isActive: true,
                    storeId: ''
                });
            }
        } catch (e) {
            console.error("Error checking/adding user in Firestore:", e);
            // We don't block login here if Firestore fails (e.g. permission error), 
            // but we log it. The app might have reduced functionality.
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            if (!user.emailVerified) {
                try {
                    await sendEmailVerification(user);
                } catch (verifyErr) {
                    console.log("Verification email resend restricted or failed:", verifyErr);
                }
                
                await signOut(auth);
                setVerificationEmail(user.email);
            } else {
                await ensureUserInFirestore(user);
            }
        } catch (err: any) {
            console.error("Login Error", err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email') {
                setError("Password or Email Incorrect");
            } else {
                setError("Password or Email Incorrect"); 
            }
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== repeatPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            if (name) {
                await updateProfile(user, {
                    displayName: name
                });
            }

            // Create user document in Firestore with DEFAULT ROLE: EMPLOYEE
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: name,
                photoURL: '',
                createdAt: new Date().toISOString(),
                role: 'employee',
                isActive: true,
                storeId: ''
            });

            await sendEmailVerification(user);
            await signOut(auth);
            setVerificationEmail(user.email);

        } catch (err: any) {
            console.error("Registration Error", err);
            if (err.code === 'auth/email-already-in-use') {
                setError("User already exists. Sign in?");
            } else {
                setError(err.message);
            }
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email) {
            setError("Please enter your email address.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setResetEmailSent(true);
        } catch (err: any) {
            console.error("Reset Password Error", err);
            setError(err.message);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setIsForgotPassword(false);
        setError(null);
        setEmail('');
        setPassword('');
        setRepeatPassword('');
        setName('');
    };

    const handleBackToLogin = () => {
        setVerificationEmail(null);
        setIsForgotPassword(false);
        setResetEmailSent(false);
        setIsLogin(true);
        setError(null);
        // Keep email if it was entered
        setPassword('');
    };

    // --- Verification Screen ---
    if (verificationEmail) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)] px-4">
                <div className="max-w-md w-full bg-[var(--color-bg-primary)] rounded-xl shadow-2xl p-8 border border-[var(--color-border-primary)] text-center animate-fade-in">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-bg-accent-primary)] bg-opacity-10 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--color-text-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Verify Your Email</h2>
                    <p className="text-[var(--color-text-secondary)] mb-8">
                        We have sent you a verification email to <span className="font-semibold text-[var(--color-text-primary)]">{verificationEmail}</span>. Verify it and log in.
                    </p>
                    <button
                        onClick={handleBackToLogin}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-bg-accent-primary)] hover:bg-[var(--color-bg-accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-primary)] transition-colors duration-200"
                    >
                        Log In
                    </button>
                </div>
            </div>
        );
    }

    // --- Forgot Password Screen ---
    if (isForgotPassword) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)] px-4">
                <div className="max-w-md w-full bg-[var(--color-bg-primary)] rounded-xl shadow-2xl p-8 border border-[var(--color-border-primary)]">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-[var(--color-text-primary)]">
                            Reset Password
                        </h2>
                        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                            Paige’s Bistro Shift Compliance App
                        </p>
                    </div>

                    {resetEmailSent ? (
                        <div className="text-center animate-fade-in">
                             <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-bg-accent-secondary)] bg-opacity-10 mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--color-bg-accent-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-[var(--color-text-secondary)] mb-8">
                                We sent you a password change link to <span className="font-semibold text-[var(--color-text-primary)]">{email}</span>.
                            </p>
                             <button
                                onClick={handleBackToLogin}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-bg-accent-primary)] hover:bg-[var(--color-bg-accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-primary)] transition-colors duration-200"
                            >
                                Sign In
                            </button>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 p-3 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-lg text-sm text-[var(--color-error-text)] text-center font-medium animate-fade-in">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md shadow-sm focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-bg-accent-primary)] hover:bg-[var(--color-bg-accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-primary)] transition-colors duration-200"
                                >
                                    Get Reset Link
                                </button>
                            </form>
                             <div className="mt-6 text-center">
                                <button
                                    onClick={handleBackToLogin}
                                    className="text-sm font-medium text-[var(--color-text-accent)] hover:text-[var(--color-bg-accent-primary-hover)] transition-colors"
                                >
                                    Back to Sign In
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // --- Login / Register Form ---
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)] px-4">
            <div className="max-w-md w-full bg-[var(--color-bg-primary)] rounded-xl shadow-2xl p-8 border border-[var(--color-border-primary)]">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-[var(--color-text-primary)]">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Paige’s Bistro Shift Compliance App
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-lg text-sm text-[var(--color-error-text)] text-center font-medium animate-fade-in break-words">
                        {error}
                    </div>
                )}

                <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md shadow-sm focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                                    required
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md shadow-sm focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md shadow-sm focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Repeat Password</label>
                            <input
                                type="password"
                                value={repeatPassword}
                                onChange={(e) => setRepeatPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md shadow-sm focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                                required
                            />
                        </div>
                    )}
                    
                    {isLogin && (
                        <div className="flex justify-end">
                            <button 
                                type="button"
                                onClick={() => setIsForgotPassword(true)}
                                className="text-sm font-medium text-[var(--color-text-accent)] hover:text-[var(--color-bg-accent-primary-hover)]"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--color-bg-accent-primary)] hover:bg-[var(--color-bg-accent-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent-primary)] transition-colors duration-200"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={toggleMode}
                            className="font-medium text-[var(--color-text-accent)] hover:text-[var(--color-bg-accent-primary-hover)] transition-colors"
                        >
                            {isLogin ? 'Register' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
