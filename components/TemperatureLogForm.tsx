
import React from 'react';
import { TEMPERATURE_LOG_KEYS, TEMPERATURE_LOG_NAMES, TEMPERATURE_LOG_STANDARDS } from '../constants';
import { TemperatureLogFormProps } from '../types';

const getTempColorStyle = (key: string, tempStr: string | undefined): string => {
    return 'border-gray-300 focus:ring-red-500 focus:border-red-500';
};

const TemperatureLogForm: React.FC<TemperatureLogFormProps> = ({ tempLogs, listId, onTempChange }) => {
    
    const handleTempChange = (key: string, value: string) => {
        if (value === '' || (!isNaN(Number(value)) && value.length <= 4)) {
            onTempChange(key, value, listId); 
        }
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-inner border border-red-200">
            <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Temperature Logs (Required)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TEMPERATURE_LOG_KEYS.map(key => (
                    <div key={key} className="space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                            {TEMPERATURE_LOG_NAMES[key]} <span className="text-gray-500">({TEMPERATURE_LOG_STANDARDS[key]})</span>
                        </label>
                        <input
                            type="number"
                            placeholder="Temp (°F)"
                            value={tempLogs[key] || ''}
                            onChange={(e) => handleTempChange(key, e.target.value)}
                            className={`block w-full px-3 py-2 border-2 rounded-md transition duration-150 ease-in-out shadow-sm ${getTempColorStyle(key, tempLogs[key])}`}
                            required
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TemperatureLogForm;
