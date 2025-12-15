
import React, { useState, useMemo } from 'react';
import { ManagerActivityLogProps, Submission, TempLogs, Report } from '../types';
import { TEMPERATURE_LOG_NAMES, TEMPERATURE_LOG_STANDARDS } from '../constants';

declare const __app_id: string | undefined;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

type ActivityItem = 
  | { kind: 'submission', data: Submission, timestamp: number }
  | { kind: 'report', data: Report, timestamp: number };

const ManagerActivityLog: React.FC<ManagerActivityLogProps> = ({ submissions, reports = [] }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    
    // Filtering State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState(''); // Unified filter for checklist names or report types

    const handlePrint = (elementId: string) => {
        const printContent = document.getElementById(elementId);
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
    
    // Derive unique types for dropdown (Checklist Names + Report Types)
    const uniqueTypes = useMemo(() => {
        const checklistNames = Array.from(new Set(submissions.map(s => s.checklistName)));
        const reportTypes = Array.from(new Set(reports.map(r => `Report: ${r.type}`)));
        return [...checklistNames, ...reportTypes].sort();
    }, [submissions, reports]);

    // Combine and Sort
    const sortedActivities = useMemo(() => {
        const activities: ActivityItem[] = [
            ...submissions.map(s => ({ kind: 'submission' as const, data: s, timestamp: new Date(s.timestamp).getTime() })),
            ...reports.map(r => ({ kind: 'report' as const, data: r, timestamp: new Date(r.timestamp).getTime() }))
        ];
        // Sort descending by timestamp
        return activities.sort((a, b) => b.timestamp - a.timestamp);
    }, [submissions, reports]);

    // Filter Logic
    const filteredActivities = useMemo(() => {
        return sortedActivities.filter(item => {
            let matchesType = true;
            let matchesName = true;
            let itemDate = '';

            if (item.kind === 'submission') {
                if (typeFilter) matchesType = item.data.checklistName === typeFilter;
                if (employeeFilter) matchesName = item.data.employeeName.toLowerCase().includes(employeeFilter.toLowerCase());
                itemDate = item.data.completionDate; // YYYY-MM-DD
            } else {
                if (typeFilter) matchesType = `Report: ${item.data.type}` === typeFilter;
                if (employeeFilter) matchesName = item.data.submittedBy.toLowerCase().includes(employeeFilter.toLowerCase());
                itemDate = new Date(item.data.timestamp).toISOString().split('T')[0];
            }

            const matchStartDate = startDate ? itemDate >= startDate : true;
            const matchEndDate = endDate ? itemDate <= endDate : true;
            
            return matchesType && matchesName && matchStartDate && matchEndDate;
        });
    }, [sortedActivities, typeFilter, employeeFilter, startDate, endDate]);

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
        setTypeFilter('');
    };

    const hasFilters = startDate || endDate || employeeFilter || typeFilter;

    return (
        <div className="p-4 bg-[var(--color-bg-tertiary)] rounded-lg shadow-inner mt-4">
            <h2 className="text-xl font-bold mb-4 text-[var(--color-accent-secondary)]">🔔 Manager Activity Log (Audit Trail)</h2>
            <div className="text-sm font-mono text-[var(--color-text-secondary)] mb-4">Authenticated User ID: <span className="text-[var(--color-accent-secondary)]">{appId}</span></div>
            
            {/* Filter Section */}
            <div className="bg-[var(--color-bg-primary)] p-4 rounded-lg shadow-sm border border-[var(--color-border-primary)] mb-6 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Filter Activity</h3>
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
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Employee/Submitter</label>
                        <input 
                            type="text" 
                            placeholder="Search name..." 
                            value={employeeFilter} 
                            onChange={(e) => setEmployeeFilter(e.target.value)} 
                            className="block w-full px-2 py-1 text-sm border border-[var(--color-border-secondary)] rounded-md bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:ring-[var(--color-accent-secondary)] focus:border-[var(--color-accent-secondary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">Type (Checklist/Report)</label>
                        <select 
                            value={typeFilter} 
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="block w-full px-2 py-1 text-sm border border-[var(--color-border-secondary)] rounded-md bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] focus:ring-[var(--color-accent-secondary)] focus:border-[var(--color-accent-secondary)]"
                        >
                            <option value="">All Activity</option>
                            {uniqueTypes.map(name => (
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
                        {employeeFilter && <span className="bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-full">User: "{employeeFilter}"</span>}
                        {typeFilter && <span className="bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded-full">Type: {typeFilter}</span>}
                    </div>
                )}
            </div>

            {filteredActivities.length === 0 ? (
                 <div className="text-center py-8 bg-[var(--color-bg-primary)] rounded-lg">
                     <p className="text-[var(--color-text-secondary)] font-medium">No activity found.</p>
                     {hasFilters && <button onClick={clearFilters} className="mt-2 text-[var(--color-text-accent)] text-sm hover:underline">Clear Filters</button>}
                </div>
            ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {filteredActivities.map((item) => {
                        const isReport = item.kind === 'report';
                        const id = item.data.id;
                        const isExpanded = expandedId === id;

                        if (isReport) {
                            const report = item.data as Report;
                            return (
                                <div key={id} className="bg-[var(--color-bg-primary)] border-l-4 border-[var(--color-accent-primary)] border-t border-r border-b border-[var(--color-border-primary)] rounded-lg shadow-md overflow-hidden transition-all duration-300">
                                    <div className="p-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-[var(--color-text-primary)]">📢 Report: <span className="text-[var(--color-accent-primary)]">{report.type}</span></p>
                                                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Submitted By: <span className="font-medium">{report.submittedBy}</span></p>
                                            </div>
                                            <span className="text-xs bg-[var(--color-bg-accent-primary)] bg-opacity-10 text-[var(--color-text-accent)] px-2 py-1 rounded">Manager Report</span>
                                        </div>
                                        <p className="text-xs text-[var(--color-text-subtle)] mt-1">Date: {formatTime(report.timestamp)}</p>
                                        
                                        <div className="mt-3 p-2 bg-[var(--color-bg-tertiary)] rounded text-sm text-[var(--color-text-primary)] whitespace-pre-wrap">
                                            {report.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        } else {
                            const submission = item.data as Submission;
                            return (
                                <div key={id} className="bg-[var(--color-bg-primary)] border-l-4 border-[var(--color-accent-secondary)] border-t border-r border-b border-[var(--color-border-primary)] rounded-lg shadow-md overflow-hidden transition-all duration-300">
                                    <div className="p-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-[var(--color-text-primary)]">✅ Checklist: <span className="text-[var(--color-accent-secondary)]">{submission.checklistName}</span></p>
                                                <p className="text-sm text-[var(--color-text-secondary)] mt-1">Employee: <span className="font-medium">{submission.employeeName || 'Unknown'}</span></p>
                                            </div>
                                            <span className="text-xs bg-[var(--color-bg-accent-secondary)] bg-opacity-10 text-[var(--color-success-text)] px-2 py-1 rounded">Employee Task</span>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-secondary)]">Location: <span className="font-medium text-[var(--color-text-accent)]">{submission.location || 'N/A'}</span></p> 
                                        <p className="text-xs text-[var(--color-text-subtle)]">Completed: {submission.completionDate} @ {submission.completionTime}</p>
                                        <div className="mt-2 text-xs font-medium text-[var(--color-text-secondary)]">Status: {submission.completedTasks.length} out of {submission.totalTasks} completed.</div>
                                        <button onClick={() => setExpandedId(isExpanded ? null : id)} className="mt-2 text-[var(--color-text-accent)] hover:underline text-sm font-semibold transition">
                                            {isExpanded ? 'Hide Details' : 'View Completed Checklist'}
                                        </button>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div id={`submission-detail-${id}`} className="p-3 bg-[var(--color-bg-tertiary)] border-t border-[var(--color-border-primary)] animate-fade-in">
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
                                            <button onClick={() => handlePrint(`submission-detail-${id}`)} className="mt-4 flex items-center px-4 py-2 bg-[var(--color-bg-accent-primary)] text-[var(--color-text-inverse)] text-sm font-semibold rounded-lg shadow-md hover:bg-[var(--color-bg-accent-primary-hover)] transition print:hidden">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm2 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1-5h4v2H7V4zm2 10a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                                Print Completed List
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    })}
                </div>
            )}
            
            <div className="mt-4 p-2 text-center text-xs font-medium text-[var(--color-accent-secondary)] bg-[var(--color-bg-tertiary)] rounded-lg">
                Data loaded successfully. (Showing {filteredActivities.length} items).
            </div>
        </div>
    );
};

export default ManagerActivityLog;
