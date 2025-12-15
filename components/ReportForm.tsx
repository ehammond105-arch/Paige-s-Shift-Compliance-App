
import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '../types';

interface ReportFormProps {
    user: User;
}

const ReportForm: React.FC<ReportFormProps> = ({ user }) => {
    const [content, setContent] = useState('');
    const [type, setType] = useState('Incident');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsSubmitting(true);
        
        try {
            // Include additional user context fields (role, storeId) to satisfy potential 
            // Firestore security rule requirements.
            await addDoc(collection(db, "reports"), {
                content,
                type,
                submittedBy: user.email || 'Unknown',
                uid: user.uid,
                role: user.role || 'manager', // Explicitly pass role
                storeId: user.storeId || 'default', // Explicitly pass storeId
                timestamp: new Date().toISOString(), // Client-side string timestamp
                createdAt: serverTimestamp() // Server-side trusted timestamp
            });
            setMessage('Report submitted successfully.');
            setContent('');
        } catch (error: any) {
            console.error("Error submitting report:", error);
            if (error.code === 'permission-denied') {
                setMessage('Permission Error: You do not have access to submit reports. Please ensure your account has the correct Manager/Owner privileges.');
            } else {
                setMessage('Failed to submit report. ' + (error.message || 'Unknown error.'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[var(--color-bg-primary)] p-6 rounded-xl shadow-lg border border-[var(--color-border-primary)] mt-6 animate-fade-in">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">📝 Submit Manager Report</h3>
            {message && (
                <div className={`mb-4 text-sm font-semibold p-3 rounded-md border ${message.includes('successfully') ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)]' : 'bg-[var(--color-error-bg)] text-[var(--color-error-text)] border-[var(--color-error-border)]'}`}>
                    {message}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Report Type</label>
                    <select 
                        value={type} 
                        onChange={(e) => setType(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)]"
                    >
                        <option>Incident</option>
                        <option>Maintenance</option>
                        <option>Inventory</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Details</label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        placeholder="Describe the issue or update..."
                        className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)]"
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-md font-medium text-white transition-all shadow-sm ${isSubmitting ? 'bg-[var(--color-disabled-bg)] text-[var(--color-disabled-text)] cursor-not-allowed' : 'bg-[var(--color-bg-accent-secondary)] hover:bg-[var(--color-bg-accent-secondary-hover)]'}`}
                >
                    {isSubmitting ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Submitting...
                        </span>
                    ) : 'Submit Report'}
                </button>
            </form>
        </div>
    );
};

export default ReportForm;
