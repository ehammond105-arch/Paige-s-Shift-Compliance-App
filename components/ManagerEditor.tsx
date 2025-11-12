
import React, { useState, useEffect } from 'react';
import { Checklist, ManagerEditorProps } from '../types';
import { DISPLAY_ORDER_IDS } from '../constants';

const ManagerEditor: React.FC<ManagerEditorProps> = ({ checklists, onUpdateChecklists }) => {
    const [selectedListId, setSelectedListId] = useState<string>('');
    const [newTaskText, setNewTaskText] = useState('');
    const [newListName, setNewListName] = useState('');

    useEffect(() => {
        if (checklists.length > 0 && !checklists.find(l => l.id === selectedListId)) {
            const defaultList = checklists.find(l => l.id === DISPLAY_ORDER_IDS[0]) || checklists[0];
            setSelectedListId(defaultList.id);
        }
    }, [checklists, selectedListId]);

    const selectedList = checklists.find(l => l.id === selectedListId);

    const handleAddTask = async () => {
        if (!selectedList || !newTaskText.trim()) return;
        const newTasks = [...selectedList.tasks, newTaskText.trim()];
        const updatedList = { ...selectedList, tasks: newTasks };
        const newChecklists = checklists.map(l => l.id === selectedListId ? updatedList : l);
        await onUpdateChecklists(newChecklists);
        setNewTaskText('');
    };

    const handleDeleteTask = async (index: number) => {
        if (!selectedList) return;
        const newTasks = selectedList.tasks.filter((_, i) => i !== index);
        const updatedList = { ...selectedList, tasks: newTasks };
        const newChecklists = checklists.map(l => l.id === selectedListId ? updatedList : l);
        await onUpdateChecklists(newChecklists);
    };

    const handleCreateList = async () => {
        if (!newListName.trim()) return;
        const newListId = newListName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') + `_${Date.now()}`;
        const newList: Checklist = {
            id: newListId,
            name: newListName.trim(),
            tasks: [],
        };
        const newChecklists = [...checklists, newList];
        await onUpdateChecklists(newChecklists);
        setNewListName('');
        setSelectedListId(newListId);
    };
    
    const handleDeleteList = async () => {
        if (!selectedList) return;
        const structuralLists = ['health', 'boh_supervisor_audit'];
        if (structuralLists.includes(selectedList.id)) {
            window.alert(`Cannot delete core structural checklists: "${selectedList.name}".`);
            return;
        }
        if (window.confirm(`Are you absolutely sure you want to permanently delete the checklist: "${selectedList.name}"?`)) {
            const newChecklists = checklists.filter(l => l.id !== selectedList.id);
            await onUpdateChecklists(newChecklists);
            setSelectedListId(checklists.length > 1 ? checklists[0].id : '');
        }
    };

    if (!checklists) {
        return <div className="text-center p-8">Loading checklists...</div>;
    }

    return (
        <div className="p-6 bg-white rounded-xl shadow-2xl space-y-6">
            <h2 className="text-2xl font-extrabold text-indigo-700 border-b pb-2">📋 Checklist Manager</h2>

            <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Select List to Edit:</label>
                    <select onChange={(e) => setSelectedListId(e.target.value)} value={selectedListId} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm">
                        {checklists.map(list => <option key={list.id} value={list.id}>{list.name}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Create New List:</label>
                    <div className="flex mt-1">
                        <input type="text" placeholder="e.g., Daily Prep" value={newListName} onChange={(e) => setNewListName(e.target.value)} className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"/>
                        <button onClick={handleCreateList} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-r-md hover:bg-indigo-700 transition">Create</button>
                    </div>
                </div>
            </div>
            
            {selectedList && (
                <div className="flex justify-end pt-2">
                    <button onClick={handleDeleteList} disabled={['health', 'boh_supervisor_audit'].includes(selectedList.id)} className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-md transition ${['health', 'boh_supervisor_audit'].includes(selectedList.id) ? 'bg-red-200 text-red-700 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`} title={['health', 'boh_supervisor_audit'].includes(selectedList.id) ? "Cannot delete core compliance lists." : "Permanently delete this checklist."}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        Delete List: {selectedList.name}
                    </button>
                </div>
            )}

            {selectedList && (
                <div className="space-y-4 border p-4 rounded-lg bg-indigo-50">
                    <h3 className="text-xl font-semibold text-indigo-800">{selectedList.name} ({selectedList.tasks.length} tasks)</h3>
                    <div className="flex space-x-2">
                        <input type="text" placeholder="New Task Description (e.g., Clean mop sink)" value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"/>
                        <button onClick={handleAddTask} className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700 transition">Add Task</button>
                    </div>
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedList.tasks.map((task, index) => (
                            <li key={index} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md">
                                <span className="text-gray-800 text-sm flex-1">{task}</span>
                                <button onClick={() => handleDeleteTask(index)} className="text-red-500 hover:text-red-700 transition ml-4" title="Delete Task">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ManagerEditor;