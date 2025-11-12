
import React, { useState } from 'react';
import { ManagerActivityLogProps, Submission, TempLogs } from '../types';
import { TEMPERATURE_LOG_NAMES, TEMPERATURE_LOG_STANDARDS } from '../constants';

declare const __app_id: string | undefined;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const ManagerActivityLog: React.FC<ManagerActivityLogProps> = ({ submissions }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

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
    
    // Sort submissions by timestamp (newest first)
    const sortedSubmissions = [...submissions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const formatTime = (isoString: string | undefined) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString();
    };
    
    const renderTempLogs = (logs: TempLogs) => {
        if (!logs || Object.keys(logs).length === 0) return <p className="text-sm text-gray-500">No temperature logs recorded.</p>;
        const tempArray = Object.keys(logs).map(key => ({
            key, 
            name: TEMPERATURE_LOG_NAMES[key] || key,
            temp: logs[key],
            standard: TEMPERATURE_LOG_STANDARDS[key] || 'N/A'
        }));
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-emerald-100">
                        <tr>
                            <th className="px-3 py-1 text-left text-xs font-medium text-emerald-700 uppercase">Equipment</th>
                            <th className="px-3 py-1 text-left text-xs font-medium text-emerald-700 uppercase">Logged Temp</th>
                            <th className="px-3 py-1 text-left text-xs font-medium text-emerald-700 uppercase">Standard</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tempArray.map(item => (
                            <tr key={item.key}>
                                <td className="px-3 py-1 whitespace-nowrap text-xs font-medium text-gray-900">{item.name}</td>
                                <td className={`px-3 py-1 whitespace-nowrap text-xs font-semibold text-gray-900`}>{item.temp} °F</td>
                                <td className="px-3 py-1 whitespace-nowrap text-xs text-gray-500">{item.standard}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg shadow-inner mt-4">
            <h2 className="text-xl font-bold mb-4 text-emerald-700">🔔 Manager Activity Log (Audit Trail)</h2>
            <div className="text-sm font-mono text-gray-600 mb-2">Authenticated User ID: <span className="text-emerald-800">{appId}</span></div>
            
            {sortedSubmissions.length === 0 && <p className="text-center text-gray-500 p-4">No checklists submitted yet.</p>}
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
                {sortedSubmissions.map((submission) => (
                    <div key={submission.id} className="bg-white border border-emerald-200 rounded-lg shadow-md overflow-hidden">
                        <div className="p-3">
                            <p className="font-semibold text-gray-800">✅ Checklist: <span className="text-emerald-600">{submission.checklistName}</span></p>
                            <p className="text-sm text-gray-600 mt-1">Submitter: <span className="font-medium">{submission.employeeName || 'Unknown Employee'}</span></p>
                            <p className="text-sm text-gray-600">Location: <span className="font-medium text-indigo-700">{submission.location || 'N/A'}</span></p> 
                            <p className="text-xs text-gray-500">Completed At: <span className="font-medium text-gray-700">{submission.completionDate || 'N/A'} @ {submission.completionTime || 'N/A'}</span></p>
                            <p className="text-xs text-gray-500">Recorded By DB: {formatTime(submission.timestamp)}</p>
                            <div className="mt-2 text-xs font-medium text-gray-700">Status: {submission.completedTasks.length} out of {submission.totalTasks} completed.</div>
                            <button onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)} className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition">
                                {expandedId === submission.id ? 'Hide Details' : 'View Completed Checklist'}
                            </button>
                        </div>
                        
                        {expandedId === submission.id && (
                            <div id={`submission-detail-${submission.id}`} className="p-3 bg-emerald-50 border-t border-emerald-200">
                                <h3 className="text-lg font-bold text-emerald-800 mb-2">Audit Report - {submission.checklistName}</h3>
                                <p className="text-xs text-gray-600 mb-4">Completed by: {submission.employeeName} at {submission.location} on {submission.completionDate} @ {submission.completionTime}</p>
                                {submission.checklistId === 'health' && submission.tempLogs && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-bold text-red-700 mb-2">🌡️ Temperature Logs:</h4>
                                        {renderTempLogs(submission.tempLogs)}
                                    </div>
                                )}
                                <h4 className="text-sm font-bold text-emerald-700 mb-2">Tasks Completed:</h4>
                                <ul className="space-y-1 text-xs">
                                    {submission.completedTasks.map((task, index) => (
                                        <li key={index} className="flex items-start text-gray-700">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            {task}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => handlePrint(submission.id)} className="mt-4 flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition print:hidden">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm2 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm1-5h4v2H7V4zm2 10a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                    Print Completed List
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="mt-4 p-2 text-center text-xs font-medium text-emerald-700 bg-emerald-100 rounded-lg">
                Data loaded successfully. (Showing {sortedSubmissions.length} latest submissions).
            </div>
        </div>
    );
};

export default ManagerActivityLog;