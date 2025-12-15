
import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { User } from '../types';

interface ReportFormProps {
    user: User;
}

const ReportForm: React.FC<ReportFormProps> = ({ user }) => {
    const [content, setContent] = useState('');
    const [type, setType] = useState('Incident');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "reports"), {
                content,
                type,
                submittedBy: user.email,
                uid: user.uid,
                timestamp: new Date().toISOString()
            });
            setMessage('Report submitted successfully.');
            setContent('');
        } catch (error) {
            console.error("Error submitting report:", error);
            setMessage('Failed to submit report.');
        }
    };

    return (
        <div className="bg-[var(--color-bg-primary)] p-6 rounded-xl shadow-lg border border-[var(--color-border-primary)] mt-6">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">📝 Submit Manager Report</h3>
            {message && <div className="mb-4 text-sm font-semibold text-[var(--color-accent-secondary)]">{message}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Report Type</label>
                    <select 
                        value={type} 
                        onChange={(e) => setType(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
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
                        className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                        required
                    />
                </div>
                <button type="submit" className="px-4 py-2 bg-[var(--color-bg-accent-secondary)] text-white rounded-md hover:bg-[var(--color-bg-accent-secondary-hover)]">
                    Submit Report
                </button>
            </form>
        </div>
    );
};

export default ReportForm;
