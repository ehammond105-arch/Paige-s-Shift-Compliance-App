import React, { useState } from 'react';
import { MANAGER_PASSWORD, MANAGER_TEST_PASSWORD } from '../constants';
import ManagerEditor from './ManagerEditor';
import ManagerActivityLog from './ManagerActivityLog';
import { ManagerAccessProps, Checklist, GithubDb } from '../types';

const ManagerAccess: React.FC<ManagerAccessProps> = ({ db, onUpdateDb }) => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (password === MANAGER_PASSWORD || password === MANAGER_TEST_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Incorrect password. Access denied.');
            setPassword('');
        }
    };

    const handleUpdateChecklists = async (newChecklists: Checklist[]) => {
        const newDb: GithubDb = { ...db, checklists: newChecklists };
        await onUpdateDb(newDb);
    };

    if (isAuthenticated) {
        return (
            <div className="space-y-8">
                <ManagerEditor checklists={db.checklists} onUpdateChecklists={handleUpdateChecklists} />
                <ManagerActivityLog submissions={db.submissions} />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8 bg-[var(--color-bg-primary)] rounded-xl shadow-2xl mx-auto max-w-sm mt-10">
            <div className="w-full space-y-4">
                <h2 className="text-2xl font-bold text-[var(--color-text-accent)] text-center">Manager Login</h2>
                <p className="text-sm text-[var(--color-text-secondary)] text-center">Enter the password to access audit and edit features.</p>
                <input
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleLogin();
                    }}
                    className="w-full px-4 py-2 border border-[var(--color-border-secondary)] rounded-lg focus:ring-[var(--color-border-accent)] focus:border-[var(--color-border-accent)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                />
                <button
                    onClick={handleLogin}
                    className="w-full py-2 bg-[var(--color-bg-accent-primary)] text-[var(--color-text-inverse)] font-semibold rounded-lg shadow-md hover:bg-[var(--color-bg-accent-primary-hover)] transition"
                >
                    Access Audit
                </button>
                {error && <p className="text-[var(--color-error-text)] text-sm text-center font-medium">{error}</p>}
            </div>
        </div>
    );
};

export default ManagerAccess;