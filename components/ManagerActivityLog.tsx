import React, { useState, useMemo } from 'react';
import { ManagerActivityLogProps, Submission, TempLogs } from '../types';
import { TEMPERATURE_LOG_NAMES, TEMPERATURE_LOG_STANDARDS } from '../constants';

declare const __app_id: string | undefined;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const ManagerActivityLog: React.FC<ManagerActivityLogProps> = ({ submissions }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    
    // Filtering State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [checklistFilter, setChecklistFilter] = useState('');

    const handlePrint = (submissionId: string) => {
        const printContent = document.getElementById(`submission-detail-${submissionId}`);
        if (printContent) {
            const originalBody = document.body.innerHTML;
            const printWrapper = document.createElement('div');
            printWrapper.classList.add('print-container', 'p-6');
            printWrapper.innerHTML = printContent.innerHTML;
            document.body.innerHTML = '';
            document.body.appendChild(printWrapper);
            window.print();
            document.body.innerHTML = originalBody;
            window.location.reload(); 
        } else {
            window.print();
        }
    };
    
    // Derive unique checklist names for dropdown
    const uniqueChecklists = useMemo(() => {
        return Array.from(new Set(submissions.map(s => s.checklistName))).sort();
    }, [submissions]);

    // Filter Logic
    const filteredSubmissions = useMemo(() => {
        return submissions.filter(sub => {
            const matchEmployee = sub.employeeName.toLowerCase().includes(employeeFilter.toLowerCase());
            const matchChecklist = checklistFilter ? sub.checklistName === checklistFilter : true;
            // Date comparison (lexicographical string comparison works for YYYY-MM-DD)
            const matchStartDate = startDate ? sub.completionDate >= startDate : true;
            const matchEndDate = endDate ? sub.completionDate <= endDate : true;
            
            return matchEmployee && matchChecklist && matchStartDate && matchEndDate;
        });
    }, [submissions, employeeFilter, checklistFilter, startDate, endDate]);

    // Sort submissions by timestamp (newest first)
    const sortedSubmissions = useMemo(() => {
        return [...filteredSubmissions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [filteredSubmissions]);

    const formatTime = (isoString: string | undefined) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    };
    
    const renderTempLogs = (logs: TempLogs) => {
        if (!logs || Object.keys(logs).length === 0) return <p className="text-sm text-[var(--color-text-subtle)]">No temperature logs recorded.</p>;
        const tempArray = Object.keys(logs).map(key => ({
            key, 
            name: TEMPERATURE_LOG_NAMES[key] || key,
            temp: logs[key],
            standard: TEMPERATURE_LOG_STANDARDS[key] || 'N/A'
        }));
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--color-border-primary)]">
                    <thead className="bg-[var(--color-bg-tertiary)]">
                        <tr>
                            <th className="px-3 py-1 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Equipment</th>
                            <th className="px-3 py-1 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Logged Temp</th>
                            <th className="px-3 py-1 text-left text-xs font-medium text-[var(--color-text-secondary)] uppercase">Standard</th>
                        </tr>
                    </thead>
                    <tbody className="bg-[var(--color-bg-primary)] divide-y divide-[var(--color-border-primary)]">
                        {tempArray.map(item => (
                            <tr key={item.key}>
                                <td className="px-3 py-1 whitespace-nowrap text-xs font-medium text-[var(--color-text-primary)]">{item.name}</td>
                                <td className={`px-3 py-1 whitespace-nowrap text-xs font-semibold text-[var(--color-text-primary)]`}>{item.temp} °F</td>
                                <td className="px-3 py-1 whitespace-nowrap text-xs text-[var(--color-text-subtle)]">{item.standard}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setEmployeeFilter('');
        setChecklistFilter('');
    };

    const hasFilters = startDate || endDate || employeeFilter || checklistFilter;

    return (
        <div className="p-4 bg-[var(--color-bg-tertiary)] rounded-lg shadow-inner mt-4">
            <h2 className="text-xl font-bold mb-4 text-[var(--color-accent-secondary)]">🔔 Manager Activity Log (Audit Trail)</h2>
            <div className="text-sm font-mono text-[var(--color-text-secondary)] mb-4">Authenticated User ID: <span className="text-[var(--color-accent-secondary)]">{appId}</span></div>
            
            {/* Filter Section */}
            <div className="bg-[var(--color-bg-primary)] p-4 rounded-lg shadow-sm border border-[var(--color-border-primary)] mb-6 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Filter Submissions</h3>
                    {hasFilters && (
                        <button onClick={clearFilters} className="text-xs text-[var(--color-text-accent)] hover:underline">
                            Clear All Filters
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Start Date</label>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            className="block w-full px-2 py-1 text-sm border border-[var(--color-border-secondary)] rounded-md bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:ring-[var(--color-accent-secondary)] focus:border-[var(--color-accent-secondary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">End Date</label>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            className="block w-full px-2 py-1 text-sm border border-[var(--color-border-secondary)] rounded-md bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:ring-[var(--color-accent-secondary)] focus:border-[var(--color-accent-secondary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Employee Name</label>
                        <input 
                            type="text" 
                            placeholder="Search name..." 
                            value={employeeFilter} 
                            onChange={(e) => setEmployeeFilter(e.target.value)} 
                            className="block w-full px-2 py-1 text-sm border border-[var(--color-border-secondary)] rounded-md bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:ring-[var(--color-accent-secondary)] focus:border-[var(--color-accent-secondary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Checklist Type</label>
                        <select 
                            value={checklistFilter} 
                            onChange={(e) => setChecklistFilter(e.target.value)}
                            className="block w-full px-2 py-1 text-sm border border-[var(--color-border-secondary)] rounded-md bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:ring-[var(--color-accent-secondary)] focus:border-[var(--color-accent-secondary)]"
                        >
                            <option value="">All Types</option>
                            {uniqueChecklists.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                {hasFilters && (
                    <div className="mt-3 pt-3 border-t border-[var(--color-border-primary)] text-xs text-[var(--color-text-secondary)] flex flex-wrap gap-2">
                        <span className="font-semibold">Applied Filters:</span>
                        {startDate && <span className="bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-full">From: {startDate}</span>}
                        {endDate && <span className="bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-full">To: {endDate}</span>}
                        {employeeFilter && <span className="bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-full">Employee: "{employeeFilter}"</span>}
                        {checklistFilter && <span className="bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-full">Type: {checklistFilter}</span>}
                    </div>
                )}
            </div>

            {submissions.length === 0 ? (
                <p className="text-center text-[var(--color-text-subtle)] p-4">No checklists submitted yet.</p>
            ) : sortedSubmissions.length === 0 ? (
                <div className="text-center py-8">
                     <p className="text-[var(--color-text-secondary)] font-medium">No results found matching your filters.</p>
                     <button onClick={clearFilters} className="mt-2 text-[var(--color-text-accent)] text-sm hover:underline">Clear Filters</button>
                </div>
            ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {sortedSubmissions.map((submission) => (
                        <div key={submission.id} className="bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded-lg shadow-md overflow-hidden transition-all duration-300">
                            <div className="p-3">
                                <p className="font-semibold text-[var(--color-text-primary)]">✅ Checklist: <span className="text-[var(--color-accent-secondary)]">{submission.checklistName}</span></p>
                                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Submitter: <span className="font-medium">{submission.employeeName || 'Unknown Employee'}</span></p>
                                <p className="text-sm text-[var(--color-text-secondary)]">Location: <span className="font-medium text-[var(--color-text-accent)]">{submission.location || 'N/A'}</span></p> 
                                <p className="text-xs text-[var(--color-text-subtle)]">Completed At: <span className="font-medium text-[var(--color-text-secondary)]">{submission.completionDate || 'N/A'} @ {submission.completionTime || 'N/A'}</span></p>
                                <p className="text-xs text-[var(--color-text-subtle)]">Recorded By DB: {formatTime(submission.timestamp)}</p>
                                <div className="mt-2 text-xs font-medium text-[var(--color-text-secondary)]">Status: {submission.completedTasks.length} out of {submission.totalTasks} completed.</div>
                                <button onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)} className="mt-2 text-[var(--color-text-accent)] hover:underline text-sm font-semibold transition">
                                    {expandedId === submission.id ? 'Hide Details' : 'View Completed Checklist'}
                                </button>
                            </div>
                            
                            {expandedId === submission.id && (
                                <div id={`submission-detail-${submission.id}`} className="p-3 bg-[var(--color-bg-tertiary)] border-t border-[var(--color-border-primary)] animate-fade-in">
                                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">Audit Report - {submission.checklistName}</h3>
                                    <p className="text-xs text-[var(--color-text-secondary)] mb-4">Completed by: {submission.employeeName} at {submission.location} on {submission.completionDate} @ {submission.completionTime}</p>
                                    {submission.checklistId === 'health' && submission.tempLogs && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-bold text-[var(--color-error-text)] mb-2">🌡️ Temperature Logs:</h4>
                                            {renderTempLogs(submission.tempLogs)}
                                        </div>
                                    )}
                                    <h4 className="text-sm font-bold text-[var(--color-accent-secondary)] mb-2">Tasks Completed:</h4>
                                    <ul className="space-y-1 text-xs">
                                        {submission.completedTasks.map((task, index) => (
                                            <li 
                                                key={index} 
                                                className="flex items-start text-[var(--color-text-secondary)] animate-slide-in"
                                                style={{ animationDelay: `${index * 30}ms`, opacity: 0 }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                {task}
                                            </li>
                                        ))}
                                    </ul>
                                    <button onClick={() => handlePrint(submission.id)} className="mt-4 flex items-center px-4 py-2 bg-[var(--color-bg-accent-primary)] text-[var(--color-text-inverse)] text-sm font-semibold rounded-lg shadow-md hover:bg-[var(--color-bg-accent-primary-hover)] transition print:hidden">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm2 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1-5h4v2H7V4zm2 10a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                        Print Completed List
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            <div className="mt-4 p-2 text-center text-xs font-medium text-[var(--color-accent-secondary)] bg-[var(--color-bg-tertiary)] rounded-lg">
                Data loaded successfully. (Showing {sortedSubmissions.length} of {submissions.length} submissions).
            </div>
        </div>
    );
};

export default ManagerActivityLog;