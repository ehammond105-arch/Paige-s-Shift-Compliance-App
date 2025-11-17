import React, { useState, useEffect } from 'react';
import { useGithubDb } from './hooks/useGithubDb';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerAccess from './components/ManagerAccess';
import { AppProps, GithubDb, Submission } from './types';

declare const __app_id: string | undefined;

const App: React.FC<AppProps> = () => {
    const { db, userId, isLoading, error, updateDb } = useGithubDb();
    const [view, setView] = useState('employee'); 
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) return savedTheme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    const handleExitFullscreen = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.error(err));
        } else {
            console.log("Not in fullscreen mode.");
            window.alert("You are not in fullscreen mode. To exit, close the window or tab.");
        }
    };

    const handleAddSubmission = async (submission: Omit<Submission, 'id' | 'timestamp'>) => {
        if (!db) return;
        const newSubmission: Submission = {
            ...submission,
            id: `${Date.now()}-${Math.random()}`, // Simple unique ID
            timestamp: new Date().toISOString(),
        };
        const newDb: GithubDb = {
            ...db,
            submissions: [...db.submissions, newSubmission],
        };
        await updateDb(newDb);
    };
    
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-secondary)] font-sans">
                <div className="text-center p-8 bg-[var(--color-bg-primary)] rounded-lg shadow-lg border-2 border-[var(--color-error-border)] max-w-lg">
                    <h2 className="text-2xl font-bold text-[var(--color-error-text)] mb-4">Application Error</h2>
                    <p className="text-[var(--color-text-primary)]">Could not connect to the GitHub backend. Please check the configuration and network status.</p>
                    <p className="text-sm text-[var(--color-error-text)] bg-[var(--color-error-bg)] p-3 mt-4 rounded-md font-mono break-all">{error}</p>
                </div>
            </div>
        );
    }

    if (isLoading || !db) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg-secondary)]">
                <div className="text-center p-8 bg-[var(--color-bg-primary)] rounded-lg shadow-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-border-accent)] mx-auto mb-4"></div>
                    <p className="text-[var(--color-text-primary)]">Connecting to GitHub Backend...</p>
                    <p className="text-xs text-[var(--color-text-subtle)] mt-2">App ID: {appId}</p>
                </div>
            </div>
        ); 
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-secondary)] font-sans text-[var(--color-text-primary)]">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
                body { font-family: 'Inter', sans-serif; background-color: var(--color-bg-secondary); }
                @media print {
                    body > * { visibility: hidden !important; }
                    .print-container, .print-container * { visibility: visible !important; }
                    .print-container { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
            
            <header className="bg-[var(--color-bg-accent-primary)] shadow-lg sticky top-0 z-10 print:hidden">
                <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
                    <h1 className="text-2xl font-black text-white">
                        Paige’s Bistro Shift Compliance App
                    </h1>
                    <div className="flex space-x-2 items-center">
                        <button onClick={() => setView('employee')} className={`px-3 py-1 rounded-full text-sm font-semibold transition ${view === 'employee' ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-accent)] shadow-md' : 'text-indigo-200 hover:text-white'}`}>
                            Employee Tasks
                        </button>
                        <button onClick={() => setView('manager')} className={`px-3 py-1 rounded-full text-sm font-semibold transition ${view === 'manager' ? 'bg-[var(--color-bg-primary)] text-[var(--color-text-accent)] shadow-md' : 'text-indigo-200 hover:text-white'}`}>
                            Manager / Audit
                        </button>
                        <button onClick={toggleTheme} className="p-2 rounded-full text-indigo-200 hover:text-white hover:bg-black/20 transition" title="Toggle Theme">
                            {theme === 'light' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                        <button onClick={handleExitFullscreen} className="px-3 py-1 rounded-full text-sm font-semibold transition bg-indigo-500 text-white hover:bg-indigo-700 flex items-center" title="Exit Fullscreen Mode">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Exit FS
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="text-center mb-6">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">Your Current User ID: <span className="text-[var(--color-text-accent)] font-mono">{userId}</span></p>
                </div>
                
                {view === 'employee' && (
                    <EmployeeDashboard 
                        userId={userId} 
                        checklists={db.checklists}
                        onAddSubmission={handleAddSubmission}
                    />
                )}

                {view === 'manager' && (
                    <ManagerAccess db={db} onUpdateDb={updateDb} />
                )}
            </main>
        </div>
    );
};

export default App;