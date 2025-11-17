
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Checklist, TempLogs, EmployeeDashboardProps } from '../types';
import { DISPLAY_ORDER_IDS, TEMPERATURE_LOG_KEYS, MANAGER_EMAIL } from '../constants';
import TemperatureLogForm from './TemperatureLogForm';

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ userId, checklists, onAddSubmission }) => {
    const [selectedListId, setSelectedListId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [location, setLocation] = useState('Austell');
    const [completionDate, setCompletionDate] = useState(new Date().toISOString().substring(0, 10));
    const [completionTime, setCompletionTime] = useState('09:00');
    const [taskStatus, setTaskStatus] = useState<{ [key: string]: boolean }>({});
    const [submissionMessage, setSubmissionMessage] = useState({ text: '', type: '' });
    const [tempLogs, setTempLogs] = useState<TempLogs>({});

    const requiresTempLog = selectedListId === 'health';

    useEffect(() => {
        if (checklists && checklists.length > 0 && !selectedListId) {
            // Ensure lists are sorted before picking the first one
            const sortedLists = [...checklists].sort((a, b) => {
                 const indexA = DISPLAY_ORDER_IDS.indexOf(a.id);
                 const indexB = DISPLAY_ORDER_IDS.indexOf(b.id);
                 if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
                 if (indexA === -1) return 1;
                 if (indexB === -1) return -1;
                 return indexA - indexB;
            });
            setSelectedListId(sortedLists[0].id);
        }
    }, [checklists, selectedListId]);

    const getTempStartIndex = useCallback((listId: string) => {
        if (listId === 'health') return 5;
        return -1; 
    }, []);

    const handleTempChangeFromForm = useCallback((key: string, value: string, listId: string) => {
        const tempIndex = TEMPERATURE_LOG_KEYS.indexOf(key);
        if (tempIndex === -1) return;

        const taskStartIndex = getTempStartIndex(listId);
        const taskIndex = taskStartIndex + tempIndex;
        const isChecked = value !== '' && !isNaN(Number(value));

        setTempLogs(prev => ({ ...prev, [key]: value }));
        setTaskStatus(prevStatus => ({ ...prevStatus, [`${listId}-${taskIndex}`]: isChecked }));
        setSubmissionMessage({ text: '', type: '' });
    }, [getTempStartIndex]);


    const selectedList = checklists.find(list => list.id === selectedListId);
    
    // Sort checklists for display in the dropdown
    const sortedChecklists = useMemo(() => {
        if (!checklists) return [];
        return [...checklists].sort((a, b) => {
            const indexA = DISPLAY_ORDER_IDS.indexOf(a.id);
            const indexB = DISPLAY_ORDER_IDS.indexOf(b.id);
            if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
            if (indexA === -1) return 1; 
            if (indexB === -1) return -1; 
            return indexA - indexB;
        });
    }, [checklists]);


    useEffect(() => {
        setTaskStatus({});
        setTempLogs({});
        setSubmissionMessage({ text: '', type: '' });
    }, [selectedListId]);

    const areTempsValid = useMemo(() => {
        if (!requiresTempLog) return true;
        return TEMPERATURE_LOG_KEYS.every(key => {
            const value = tempLogs[key];
            return value !== undefined && value !== '' && !isNaN(Number(value));
        });
    }, [requiresTempLog, tempLogs]);

    const handleCheck = (taskIndex: number) => {
        if (!selectedList) return;
        const tempStartIndex = getTempStartIndex(selectedListId);
        if (requiresTempLog && taskIndex >= tempStartIndex) return;
        setTaskStatus(prevStatus => {
            const key = `${selectedListId}-${taskIndex}`;
            return { ...prevStatus, [key]: !prevStatus[key] };
        });
        setSubmissionMessage({ text: '', type: '' }); 
    };

    const handleSubmit = async () => {
        if (!userId || !selectedList) {
            setSubmissionMessage({ text: 'Error: User or list not selected.', type: 'error' });
            return;
        }
        if (!employeeName.trim() || !completionDate || !completionTime || !location) {
            setSubmissionMessage({ text: 'Please enter your Name, Location, Date, and Time.', type: 'warning' });
            return;
        }
        if (requiresTempLog && !areTempsValid) {
            setSubmissionMessage({ text: 'Please ensure all 11 temperature fields are filled with numbers.', type: 'warning' });
            return;
        }

        const completedTasks = selectedList.tasks.filter((_, index) => taskStatus[`${selectedListId}-${index}`]);
        const totalTasks = selectedList.tasks.length;
        if (completedTasks.length < totalTasks) {
            setSubmissionMessage({ text: 'Please complete all checklist tasks before submitting.', type: 'warning' });
            return;
        }
        
        const confirmationMessage = `You are about to submit the "${selectedList.name}" checklist for ${employeeName.trim()} at ${location}.\n\nAre you sure you want to proceed? This will notify the manager.`;
        if (window.confirm(confirmationMessage)) {
            try {
                const newSubmission = {
                    id: uuidv4(),
                    checklistId: selectedList.id,
                    checklistName: selectedList.name,
                    submitterId: userId,
                    employeeName: employeeName.trim(), 
                    location,
                    completionDate,     
                    completionTime,
                    completedTasks,
                    totalTasks,
                    timestamp: new Date().toISOString(),
                    notificationEmail: MANAGER_EMAIL,
                    tempLogs: requiresTempLog ? tempLogs : null, 
                };
                
                await onAddSubmission(newSubmission);

                console.log(`--- EMAIL NOTIFICATION SIMULATED --- To: ${MANAGER_EMAIL}, Subject: CHECKLIST COMPLETED: ${selectedList.name} by ${employeeName} at ${location}`);
                
                setTaskStatus({});
                setTempLogs({});
                setEmployeeName(''); 
                setLocation('Austell');
                setCompletionTime('09:00'); 
                setSubmissionMessage({ text: `${selectedList.name} submitted successfully by ${employeeName} (${location})!`, type: 'success' });
            } catch (error) {
                console.error("Error submitting checklist:", error);
                setSubmissionMessage({ text: `Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
            }
        }
    };

    const getMessageStyle = (type: string) => {
        if (type === 'success') return 'bg-green-100 text-green-800 border-green-400';
        if (type === 'warning') return 'bg-yellow-100 text-yellow-800 border-yellow-400';
        if (type === 'error') return 'bg-red-100 text-red-800 border-red-400';
        return '';
    };

    if (!checklists) return <div className="text-center p-8">Loading Daily Checklists...</div>;

    const completedCount = selectedList ? selectedList.tasks.filter((_, index) => taskStatus[`${selectedListId}-${index}`]).length : 0;
    const totalCount = selectedList ? selectedList.tasks.length : 0;
    const isComplete = completedCount === totalCount && totalCount > 0 && (requiresTempLog ? areTempsValid : true);
    const isDisabled = !isComplete || !employeeName.trim() || !completionDate || !completionTime || !location;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-800 border-b pb-2">👋 Employee Dashboard: Daily Tasks</h2>
            
            {submissionMessage.text && <div className={`p-3 border rounded-lg font-medium ${getMessageStyle(submissionMessage.type)}`}>{submissionMessage.text}</div>}

            <div className="bg-white p-5 rounded-xl shadow-lg border-t-4 border-indigo-500 space-y-4">
                 <h3 className="text-xl font-bold text-indigo-700">Task Information</h3>
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Employee Name:</label>
                        <input type="text" placeholder="Your Full Name" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"/>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Location:</label>
                        <select value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md shadow-sm">
                            <option value="Austell">Austell</option>
                            <option value="Smyrna">Smyrna</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Date of Completion:</label>
                        <input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"/>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Time of Completion:</label>
                        <input type="time" value={completionTime} onChange={(e) => setCompletionTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"/>
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700">Select Checklist:</label>
                    <select onChange={(e) => setSelectedListId(e.target.value)} value={selectedListId} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md shadow-sm">
                        {sortedChecklists.map(list => <option key={list.id} value={list.id}>{list.name}</option>)}
                    </select>
                </div>
            </div>
            
            {requiresTempLog && <TemperatureLogForm tempLogs={tempLogs} listId={selectedListId} onTempChange={handleTempChangeFromForm}/>}

            {selectedList && (
                <div className="bg-white p-5 rounded-xl shadow-lg border-t-4 border-emerald-500">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-emerald-700">{selectedList.name}</h3>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isComplete ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{completedCount}/{totalCount}</span>
                    </div>
                    <ul className="space-y-3">
                        {selectedList.tasks.map((task, index) => (
                            <li key={index} className="flex items-start">
                                <input type="checkbox" checked={!!taskStatus[`${selectedListId}-${index}`]} onChange={() => handleCheck(index)} disabled={requiresTempLog && index >= getTempStartIndex(selectedListId)} className="mt-1 h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer disabled:opacity-50"/>
                                <span className={`ml-3 text-gray-700 flex-1 ${taskStatus[`${selectedListId}-${index}`] ? 'line-through text-gray-400' : ''}`}>{task}</span>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleSubmit} disabled={isDisabled} className={`mt-6 w-full py-3 rounded-xl text-white font-bold transition duration-300 shadow-lg ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                        {isComplete ? 'SUBMIT & NOTIFY MANAGER' : 'Complete All Requirements to Submit'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;
