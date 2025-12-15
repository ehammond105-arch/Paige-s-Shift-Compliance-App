
import React from 'react';
import ManagerEditor from './ManagerEditor';
import ManagerActivityLog from './ManagerActivityLog';
import ReportForm from './ReportForm';
import { ManagerAccessProps, Checklist, GithubDb } from '../types';

const ManagerAccess: React.FC<ManagerAccessProps> = ({ db, onUpdateDb, user }) => {
    
    // Check if user has manager or owner role
    const hasAccess = user && (user.role === 'manager' || user.role === 'owner');

    const handleUpdateChecklists = async (newChecklists: Checklist[]) => {
        const newDb: GithubDb = { ...db, checklists: newChecklists };
        await onUpdateDb(newDb);
    };

    if (hasAccess) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="bg-[var(--color-bg-accent-secondary)] bg-opacity-10 border border-[var(--color-bg-accent-secondary)] rounded-lg p-4 text-center">
                    <p className="text-[var(--color-success-text)] font-semibold">
                        ✅ Access Granted: {user?.role?.toUpperCase()} ({user?.email})
                    </p>
                </div>
                
                <ReportForm user={user!} />

                <div className="border-t border-[var(--color-border-primary)] my-8"></div>
                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Checklist Management</h3>
                <ManagerEditor checklists={db.checklists} onUpdateChecklists={handleUpdateChecklists} />
                <ManagerActivityLog submissions={db.submissions} />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center p-8 bg-[var(--color-bg-primary)] rounded-xl shadow-2xl mx-auto max-w-lg mt-10 border border-[var(--color-border-primary)]">
            <div className="w-full space-y-6 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[var(--color-error-bg)]">
                    <svg className="h-10 w-10 text-[var(--color-error-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Access Denied</h2>
                <div className="text-[var(--color-text-secondary)] space-y-2">
                    <p>You are currently logged in as:</p>
                    <p className="font-mono font-medium text-[var(--color-text-accent)]">{user?.email || 'Unknown User'}</p>
                    <p className="pt-2 text-sm text-[var(--color-text-subtle)]">
                        This area is restricted to managers and owners.<br/>
                        Your current role is: <span className="font-bold">{user?.role || 'Employee'}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ManagerAccess;
