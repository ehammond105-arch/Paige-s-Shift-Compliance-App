
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { User, Store, UserRole, OwnerDashboardProps } from '../types';
import ManagerActivityLog from './ManagerActivityLog';

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ submissions }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [stores, setStores] = useState<Store[]>([]);
    const [newStoreName, setNewStoreName] = useState('');
    const [newStoreLocation, setNewStoreLocation] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Users
            const userSnapshot = await getDocs(collection(db, "users"));
            const fetchedUsers = userSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
            setUsers(fetchedUsers);

            // Fetch Stores
            const storeSnapshot = await getDocs(collection(db, "stores"));
            const fetchedStores = storeSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Store));
            setStores(fetchedStores);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRoleChange = async (uid: string, newRole: UserRole) => {
        try {
            await updateDoc(doc(db, "users", uid), { role: newRole });
            setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Error updating role:", error);
        }
    };

    const handleToggleActive = async (uid: string, currentStatus: boolean) => {
        try {
            await updateDoc(doc(db, "users", uid), { isActive: !currentStatus });
            setUsers(users.map(u => u.uid === uid ? { ...u, isActive: !currentStatus } : u));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleCreateStore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStoreName || !newStoreLocation) return;

        try {
            await addDoc(collection(db, "stores"), {
                storeName: newStoreName,
                location: newStoreLocation,
                ownerUid: 'OWNER' // In real app, put current user ID
            });
            setNewStoreName('');
            setNewStoreLocation('');
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Error creating store:", error);
        }
    };

    if (loading) return <div className="text-center p-8">Loading Dashboard...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-extrabold text-[var(--color-text-primary)]">👑 Owner Dashboard</h1>

            {/* User Management */}
            <div className="bg-[var(--color-bg-primary)] p-6 rounded-xl shadow-lg border border-[var(--color-border-primary)]">
                <h2 className="text-xl font-bold mb-4 text-[var(--color-text-accent)]">User Management</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--color-border-primary)]">
                        <thead>
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Email</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Role</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Status</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-border-primary)]">
                            {users.map(u => (
                                <tr key={u.uid}>
                                    <td className="px-3 py-2 text-sm text-[var(--color-text-primary)]">{u.email}</td>
                                    <td className="px-3 py-2">
                                        <select 
                                            value={u.role || 'employee'} 
                                            onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                                            className="text-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-secondary)] rounded p-1"
                                        >
                                            <option value="owner">Owner</option>
                                            <option value="manager">Manager</option>
                                            <option value="employee">Employee</option>
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.isActive ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]' : 'bg-[var(--color-error-bg)] text-[var(--color-error-text)]'}`}>
                                            {u.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <button 
                                            onClick={() => handleToggleActive(u.uid, u.isActive || false)}
                                            className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-[var(--color-error-bg)] text-[var(--color-error-text)]' : 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]'}`}
                                        >
                                            {u.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Store Management */}
            <div className="bg-[var(--color-bg-primary)] p-6 rounded-xl shadow-lg border border-[var(--color-border-primary)]">
                <h2 className="text-xl font-bold mb-4 text-[var(--color-text-accent)]">Stores</h2>
                <ul className="mb-4 space-y-2">
                    {stores.map(s => (
                        <li key={s.id} className="p-2 bg-[var(--color-bg-tertiary)] rounded flex justify-between">
                            <span className="font-semibold text-[var(--color-text-primary)]">{s.storeName}</span>
                            <span className="text-sm text-[var(--color-text-secondary)]">{s.location}</span>
                        </li>
                    ))}
                </ul>
                <form onSubmit={handleCreateStore} className="flex gap-2 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)]">Store Name</label>
                        <input type="text" value={newStoreName} onChange={e => setNewStoreName(e.target.value)} className="w-full px-2 py-1 border rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]" required />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)]">Location</label>
                        <input type="text" value={newStoreLocation} onChange={e => setNewStoreLocation(e.target.value)} className="w-full px-2 py-1 border rounded bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]" required />
                    </div>
                    <button type="submit" className="px-4 py-1.5 bg-[var(--color-bg-accent-primary)] text-white rounded text-sm hover:bg-[var(--color-bg-accent-primary-hover)]">Add Store</button>
                </form>
            </div>

            {/* Activity Log for Owner */}
            <div className="border-t border-[var(--color-border-primary)] my-8"></div>
            <ManagerActivityLog submissions={submissions} />
        </div>
    );
};

export default OwnerDashboard;
