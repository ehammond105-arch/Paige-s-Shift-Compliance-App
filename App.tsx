
import React, { useState } from 'react';
import { useGithubDb } from './hooks/useGithubDb';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerAccess from './components/ManagerAccess';
import { AppProps, GithubDb, Submission } from './types';

declare const __app_id: string | undefined;

const App: React.FC<AppProps> = () => {
    const { db, userId, isLoading, error, updateDb } = useGithubDb();
    const [view, setView] = useState('employee'); 
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    
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
            <div className="flex items-center justify-center min-h-screen bg-red-50 font-sans">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg border-2 border-red-400 max-w-lg">
                    <h2 className="text-2xl font-bold text-red-700 mb-4">Application Error</h2>
                    <p className="text-gray-700">Could not connect to the GitHub backend. Please check the configuration and network status.</p>
                    <p className="text-sm text-red-800 bg-red-100 p-3 mt-4 rounded-md font-mono break-all">{error}</p>
                </div>
            </div>
        );
    }

    if (isLoading || !db) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-700">Connecting to GitHub Backend...</p>
                    <p className="text-xs text-gray-500 mt-2">App ID: {appId}</p>
                </div>
            </div>
        ); 
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
                body { font-family: 'Inter', sans-serif; }
                @media print {
                    body > * { visibility: hidden !important; }
                    .print-container, .print-container * { visibility: visible !important; }
                    .print-container { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
            
            <header className="bg-indigo-600 shadow-lg sticky top-0 z-10 print:hidden">
                <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
                    <h1 className="text-2xl font-black text-white">
                        Paige’s Bistro Shift Compliance App
                    </h1>
                    <div className="flex space-x-2">
                        <button onClick={() => setView('employee')} className={`px-3 py-1 rounded-full text-sm font-semibold transition ${view === 'employee' ? 'bg-white text-indigo-600 shadow-md' : 'text-indigo-200 hover:text-white'}`}>
                            Employee Tasks
                        </button>
                        <button onClick={() => setView('manager')} className={`px-3 py-1 rounded-full text-sm font-semibold transition ${view === 'manager' ? 'bg-white text-indigo-600 shadow-md' : 'text-indigo-200 hover:text-white'}`}>
                            Manager / Audit
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
                    <p className="text-sm font-medium text-gray-600">Your Current User ID: <span className="text-indigo-700 font-mono">{userId}</span></p>
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