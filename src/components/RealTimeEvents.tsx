import React, { useState } from 'react';
import { Activity, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { CONTRACT_CONFIG } from '../config/contracts';

export const RealTimeEvents: React.FC = () => {
  const { events } = useContract();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const openTransaction = (txHash: string) => {
    window.open(`${CONTRACT_CONFIG.blockExplorer}/tx/${txHash}`, '_blank');
  };

  const recentEvents = events.slice(-5).reverse();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div 
        className="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Real-time Events
            </h3>
            {events.length > 0 && (
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                {events.length} events
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {recentEvents.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No events yet. Events will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event, index) => (
                <div
                  key={`${event.transactionHash}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {event.event}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Block #{event.blockNumber}
                      </span>
                    </div>
                    
                    {event.event === 'ReferralProcessed' && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span>Referee: {formatAddress(event.args[0])}</span>
                        <span className="mx-2">→</span>
                        <span>Referrer: {formatAddress(event.args[1])}</span>
                      </div>
                    )}
                    
                    {event.event === 'RewardsDistributed' && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span>User: {formatAddress(event.args[0])}</span>
                        <span className="mx-2">•</span>
                        <span>Amount: {parseFloat(event.args[1]).toFixed(2)} REFT</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => openTransaction(event.transactionHash)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};