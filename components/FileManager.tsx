
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db, storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { FileRecord } from '../types';

interface FileManagerProps {
    user: User;
}

const FileManager: React.FC<FileManagerProps> = ({ user }) => {
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadNote, setUploadNote] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user?.uid) return;

        const filesRef = collection(db, "users", user.uid, "files");
        const q = query(filesRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, 
            (snapshot) => {
                const fetchedFiles: FileRecord[] = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as FileRecord));
                setFiles(fetchedFiles);
                setError(null); // Clear error on successful snapshot
            },
            (err) => {
                console.error("Firestore Snapshot Error:", err);
                if (err.code === 'permission-denied') {
                    setError("Access denied: You do not have permission to view these files.");
                } else {
                    setError("Failed to load files. Please try again later.");
                }
            }
        );

        return () => unsubscribe();
    }, [user.uid]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setError("Please select a file to upload.");
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // 1. Upload to Firebase Storage
            const storagePath = `user_uploads/${user.uid}/${Date.now()}_${selectedFile.name}`;
            const storageRef = ref(storage, storagePath);
            const snapshot = await uploadBytes(storageRef, selectedFile);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 2. Add metadata to Firestore
            const newFile: Omit<FileRecord, 'id'> = {
                name: selectedFile.name,
                url: downloadURL,
                path: storagePath,
                type: selectedFile.type,
                size: selectedFile.size,
                createdAt: new Date().toISOString(),
                notes: uploadNote,
                aiSummary: 'Pending AI Analysis...', // Placeholder for now
            };

            await addDoc(collection(db, "users", user.uid, "files"), newFile);

            // Reset form
            setSelectedFile(null);
            setUploadNote('');
            // Reset file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';

        } catch (err: any) {
            console.error("Upload failed", err);
            setError(err.message || "Failed to upload file.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (file: FileRecord) => {
        if (!window.confirm(`Are you sure you want to delete ${file.name}?`)) return;

        try {
            // 1. Delete from Storage
            const storageRef = ref(storage, file.path);
            await deleteObject(storageRef);

            // 2. Delete from Firestore
            await deleteDoc(doc(db, "users", user.uid, "files", file.id));

        } catch (err: any) {
            console.error("Delete failed", err);
            setError("Failed to delete file. It might have already been removed.");
        }
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
             <div className="bg-[var(--color-bg-primary)] p-6 rounded-xl shadow-lg border border-[var(--color-border-primary)]">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-[var(--color-text-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    File Upload & Sync
                </h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-[var(--color-error-bg)] border border-[var(--color-error-border)] rounded-lg text-sm text-[var(--color-error-text)]">
                        {error}
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Select File</label>
                            <input 
                                id="file-upload"
                                type="file" 
                                onChange={handleFileSelect}
                                className="block w-full text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-bg-accent-primary)] file:text-white hover:file:bg-[var(--color-bg-accent-primary-hover)] cursor-pointer bg-[var(--color-bg-secondary)] rounded-md border border-[var(--color-border-secondary)]"
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Notes / Description</label>
                             <input 
                                type="text"
                                value={uploadNote}
                                onChange={(e) => setUploadNote(e.target.value)}
                                placeholder="Add optional notes..."
                                className="block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md shadow-sm focus:ring-[var(--color-accent-primary)] focus:border-[var(--color-accent-primary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"
                             />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button 
                            type="submit" 
                            disabled={!selectedFile || uploading}
                            className={`px-4 py-2 rounded-md font-medium text-white transition-colors shadow-sm flex items-center ${!selectedFile || uploading ? 'bg-[var(--color-disabled-bg)] text-[var(--color-disabled-text)] cursor-not-allowed' : 'bg-[var(--color-bg-accent-secondary)] hover:bg-[var(--color-bg-accent-secondary-hover)]'}`}
                        >
                            {uploading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Uploading...
                                </>
                            ) : 'Upload File'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] border-b border-[var(--color-border-primary)] pb-2">History & Records</h3>
                
                {files.length === 0 ? (
                    <div className="text-center py-8 text-[var(--color-text-subtle)] bg-[var(--color-bg-tertiary)] rounded-lg">
                        {error ? 'Could not load files.' : 'No files uploaded yet.'}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {files.map((file) => (
                            <div key={file.id} className="bg-[var(--color-bg-primary)] p-4 rounded-lg shadow-sm border border-[var(--color-border-primary)] flex flex-col md:flex-row gap-4 items-start md:items-center transition hover:shadow-md">
                                <div className="p-3 bg-[var(--color-bg-tertiary)] rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-[var(--color-text-primary)] truncate" title={file.name}>{file.name}</h4>
                                    <p className="text-xs text-[var(--color-text-subtle)]">{formatBytes(file.size)} • {new Date(file.createdAt).toLocaleString()}</p>
                                    {file.notes && (
                                        <p className="text-sm text-[var(--color-text-secondary)] mt-1 italic">"{file.notes}"</p>
                                    )}
                                     <div className="mt-2 text-xs">
                                        <span className="font-semibold text-[var(--color-accent-primary)]">AI Summary: </span>
                                        <span className="text-[var(--color-text-secondary)]">{file.aiSummary}</span>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                                    <a 
                                        href={file.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex-1 md:flex-none px-3 py-1.5 text-xs font-medium text-center text-[var(--color-bg-accent-primary)] bg-[var(--color-bg-accent-primary)] bg-opacity-10 rounded hover:bg-opacity-20 transition-colors"
                                    >
                                        Download
                                    </a>
                                    <button 
                                        onClick={() => handleDelete(file)}
                                        className="flex-1 md:flex-none px-3 py-1.5 text-xs font-medium text-center text-[var(--color-error-text)] bg-[var(--color-error-bg)] rounded hover:bg-opacity-80 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileManager;
