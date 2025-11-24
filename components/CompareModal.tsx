import React from 'react';
import { TripOption, TransportMode } from '../types';
import { X, Check, Leaf, Clock, DollarSign, Award, ArrowRightLeft } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trips: TripOption[];
  highlightedTripId: string | null;
  onBook: (trip: TripOption) => void;
}

const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose, trips, highlightedTripId, onBook }) => {
  if (!isOpen || trips.length === 0) return null;

  // Helper to parse cost for comparison (takes first number found)
  const parseCost = (costStr: string) => {
    const match = costStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 999999;
  };

  // Find best metrics to highlight "winners"
  const minCo2 = Math.min(...trips.map(t => t.totalCo2Kg));
  const minDuration = Math.min(...trips.map(t => t.durationHours));
  const maxScore = Math.max(...trips.map(t => t.sustainabilityScore));
  const minCost = Math.min(...trips.map(t => parseCost(t.costEstimate)));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-emerald-600 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6" />
            <h2 className="text-xl font-bold">Compare Travel Options</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-700 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-auto p-6 custom-scrollbar bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-[600px]">
            {trips.map(trip => {
              const isHighlighted = trip.id === highlightedTripId;
              const isLowestCo2 = trip.totalCo2Kg === minCo2;
              const isFastest = trip.durationHours === minDuration;
              const isCheapest = parseCost(trip.costEstimate) === minCost;
              const isBestScore = trip.sustainabilityScore === maxScore;

              return (
                <div 
                  key={trip.id} 
                  className={`relative flex flex-col bg-white rounded-xl border-2 transition-all ${
                    isHighlighted ? 'border-emerald-500 ring-4 ring-emerald-500/20 shadow-xl scale-[1.02] z-10' : 'border-gray-100 shadow-sm'
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Selected
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="p-5 border-b border-gray-100 text-center bg-gray-50/50">
                    <h3 className="font-bold text-lg text-gray-800 leading-tight mb-1">{trip.title}</h3>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600 uppercase">
                      {trip.transportMode}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="p-6 space-y-6 flex-1">
                    
                    {/* CO2 */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center justify-center gap-1">
                        <Leaf size={12} /> Total Emissions
                      </p>
                      <div className={`text-center p-2 rounded-lg ${isLowestCo2 ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50'}`}>
                        <span className={`text-2xl font-bold ${isLowestCo2 ? 'text-emerald-600' : 'text-gray-700'}`}>
                          {trip.totalCo2Kg}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">kg</span>
                        {isLowestCo2 && <div className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center justify-center gap-1"><Check size={10}/> Lowest Impact</div>}
                      </div>
                    </div>

                    {/* Score & Cost Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Score</p>
                        <div className={`text-lg font-bold ${isBestScore ? 'text-emerald-600' : 'text-gray-700'}`}>
                          {trip.sustainabilityScore}/100
                        </div>
                      </div>
                      <div className="text-center">
                         <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Cost</p>
                         <div className={`text-lg font-bold ${isCheapest ? 'text-green-600' : 'text-gray-700'}`}>
                           {trip.costEstimate}
                         </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                        <span className="text-gray-500 flex items-center gap-1"><Clock size={14}/> Duration</span>
                        <span className={`font-semibold ${isFastest ? 'text-indigo-600' : 'text-gray-700'}`}>
                          {trip.durationHours} hours
                        </span>
                    </div>

                    {/* Accommodation */}
                    <div className="text-sm border-t border-dashed border-gray-200 pt-4">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Stay</p>
                        <p className="font-medium text-gray-800">{trip.accommodation.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{trip.accommodation.type}</p>
                        <div className="flex flex-wrap gap-1 mt-2 justify-center">
                           {trip.accommodation.features.slice(0,2).map((f, i) => (
                             <span key={i} className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100">
                               {f}
                             </span>
                           ))}
                        </div>
                    </div>

                  </div>

                  {/* Action */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <button 
                      onClick={() => {
                        onBook(trip);
                        onClose();
                      }}
                      className="w-full py-2 rounded-lg bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-all shadow-sm active:scale-[0.98]"
                    >
                      Select This Option
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;