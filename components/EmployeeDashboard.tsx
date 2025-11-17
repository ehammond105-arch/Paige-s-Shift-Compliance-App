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
        
        const confirmationDetails = [
            `Checklist: ${selectedList.name}`,
            `Employee: ${employeeName.trim()}`,
            `Location: ${location}`,
            `Date & Time: ${completionDate} at ${completionTime}`,
            `Tasks Completed: ${completedTasks.length} of ${totalTasks}`,
        ];

        if (requiresTempLog) {
            confirmationDetails.push('Includes: 11 Temperature Logs');
        }

        const confirmationMessage = `Please confirm your submission details:\n\n${confirmationDetails.join('\n')}\n\nThis action is final and will send a notification to the manager (${MANAGER_EMAIL}).\n\nDo you want to proceed?`;

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
        if (type === 'success') return 'bg-[var(--color-success-bg)] text-[var(--color-success-text)] border-[var(--color-success-border)]';
        if (type === 'warning') return 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] border-[var(--color-warning-border)]';
        if (type === 'error') return 'bg-[var(--color-error-bg)] text-[var(--color-error-text)] border-[var(--color-error-border)]';
        return '';
    };

    if (!checklists) return <div className="text-center p-8">Loading Daily Checklists...</div>;

    const completedCount = selectedList ? selectedList.tasks.filter((_, index) => taskStatus[`${selectedListId}-${index}`]).length : 0;
    const totalCount = selectedList ? selectedList.tasks.length : 0;
    const isComplete = completedCount === totalCount && totalCount > 0 && (requiresTempLog ? areTempsValid : true);
    const isDisabled = !isComplete || !employeeName.trim() || !completionDate || !completionTime || !location;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)] border-b border-[var(--color-border-primary)] pb-2">👋 Employee Dashboard: Daily Tasks</h2>
            
            {submissionMessage.text && <div className={`p-3 border rounded-lg font-medium ${getMessageStyle(submissionMessage.type)}`}>{submissionMessage.text}</div>}

            <div className="bg-[var(--color-bg-primary)] p-5 rounded-xl shadow-lg border-t-4 border-[var(--color-border-accent)] space-y-4">
                 <h3 className="text-xl font-bold text-[var(--color-text-accent)]">Task Information</h3>
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Employee Name:</label>
                        <input type="text" placeholder="Your Full Name" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md focus:ring-[var(--color-accent-secondary)] focus:border-[var(--color-accent-secondary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"/>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Location:</label>
                        <select value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[var(--color-border-secondary)] focus:outline-none focus:ring-[var(--color-accent-secondary)] focus:border-[var(--color-accent-secondary)] sm:text-sm rounded-md shadow-sm bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
                            <option value="Austell">Austell</option>
                            <option value="Smyrna">Smyrna</option>
                        </select>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Date of Completion:</label>
                        <input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md focus:ring-[var(--color-accent-secondary)] focus:border-[var(--color-accent-secondary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"/>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Time of Completion:</label>
                        <input type="time" value={completionTime} onChange={(e) => setCompletionTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-[var(--color-border-secondary)] rounded-md focus:ring-[var(--color-accent-secondary)] focus:border-[var(--color-accent-secondary)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]"/>
                    </div>
                </div>
                <div>
                     <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Select Checklist:</label>
                    <select onChange={(e) => setSelectedListId(e.target.value)} value={selectedListId} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-[var(--color-border-secondary)] focus:outline-none focus:ring-[var(--color-accent-secondary)] focus:border-[var(--color-accent-secondary)] sm:text-sm rounded-md shadow-sm bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]">
                        {sortedChecklists.map(list => <option key={list.id} value={list.id}>{list.name}</option>)}
                    </select>
                </div>
            </div>
            
            {requiresTempLog && <TemperatureLogForm tempLogs={tempLogs} listId={selectedListId} onTempChange={handleTempChangeFromForm}/>}

            {selectedList && (
                <div className="bg-[var(--color-bg-primary)] p-5 rounded-xl shadow-lg border-t-4 border-[var(--color-accent-secondary)]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-[var(--color-accent-secondary)]">{selectedList.name}</h3>
                        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isComplete ? 'bg-[var(--color-success-bg)] text-[var(--color-success-text)]' : 'bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]'}`}>{completedCount}/{totalCount}</span>
                    </div>
                    <ul className="space-y-3">
                        {selectedList.tasks.map((task, index) => (
                            <li key={index} className="flex items-start">
                                <input type="checkbox" checked={!!taskStatus[`${selectedListId}-${index}`]} onChange={() => handleCheck(index)} disabled={requiresTempLog && index >= getTempStartIndex(selectedListId)} className="mt-1 h-5 w-5 text-[var(--color-accent-secondary)] border-[var(--color-border-secondary)] rounded focus:ring-[var(--color-accent-secondary)] cursor-pointer disabled:opacity-50"/>
                                <span className={`ml-3 text-[var(--color-text-primary)] flex-1 ${taskStatus[`${selectedListId}-${index}`] ? 'line-through text-[var(--color-text-subtle)]' : ''}`}>{task}</span>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleSubmit} disabled={isDisabled} className={`mt-6 w-full py-3 rounded-xl text-white font-bold transition duration-300 shadow-lg ${isDisabled ? 'bg-[var(--color-disabled-bg)] text-[var(--color-disabled-text)] cursor-not-allowed' : 'bg-[var(--color-bg-accent-secondary)] hover:bg-[var(--color-bg-accent-secondary-hover)]'}`}>
                        {isComplete ? 'SUBMIT & NOTIFY MANAGER' : 'Complete All Requirements to Submit'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default EmployeeDashboard;