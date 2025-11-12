
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Simple UUID generation
import { fetchData, updateData } from '../services/githubService';
import { IS_MOCK_ENV } from '../githubConfig';
import { initialChecklistsData } from '../constants';
import { GithubDb } from '../types';

export const useGithubDb = () => {
    const [db, setDb] = useState<GithubDb | null>(null);
    const [fileSha, setFileSha] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Effect for initializing user ID from localStorage
    useEffect(() => {
        let currentUserId = localStorage.getItem('bistro-app-userId');
        if (!currentUserId) {
            currentUserId = uuidv4();
            localStorage.setItem('bistro-app-userId', currentUserId);
        }
        setUserId(currentUserId);
    }, []);

    // Memoized function to load data from backend
    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (IS_MOCK_ENV) {
                // In mock env, we simulate a fetch and seed from constants
                const mockDb: GithubDb = {
                    checklists: initialChecklistsData,
                    submissions: [],
                };
                setDb(mockDb);
            } else {
                const { sha, data } = await fetchData();
                setFileSha(sha);
                if (data) {
                    setDb(data);
                } else {
                    // File doesn't exist, so we'll seed it
                    console.log("Seeding initial data to GitHub...");
                    const initialDb: GithubDb = {
                        checklists: initialChecklistsData,
                        submissions: [],
                    };
                    await updateData(initialDb, null, "Initial data seed");
                    const { sha: newSha, data: newData } = await fetchData(); // Re-fetch to get the new state
                    setFileSha(newSha);
                    setDb(newData);
                }
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error("Failed to load data:", e);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Effect to load data on mount
    useEffect(() => {
        loadData();
    }, [loadData]);

    const updateDb = async (newDb: GithubDb) => {
        try {
            setDb(newDb); // Optimistic UI update
            if (IS_MOCK_ENV) {
                console.log("Mock environment: Data updated in memory.", newDb);
                return;
            }

            await updateData(newDb, fileSha, "Update application data");
            const { sha: newSha } = await fetchData(); // Fetch new SHA after update
            setFileSha(newSha);

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error("Failed to update DB:", e);
            setError(errorMessage);
            // Optionally, revert optimistic update
            loadData();
        }
    };

    return { db, userId, isLoading, error, updateDb };
};
