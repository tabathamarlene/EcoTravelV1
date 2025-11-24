import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TripOption, TransportMode } from '../types';

interface CarbonChartProps {
  data: TripOption[];
}

const CarbonChart: React.FC<CarbonChartProps> = ({ data }) => {
  
  const getTransportColor = (mode: TransportMode) => {
    switch (mode) {
      case TransportMode.TRAIN: return '#10b981'; // Emerald-500
      case TransportMode.FLIGHT: return '#ef4444'; // Red-500
      case TransportMode.BUS: return '#f59e0b'; // Amber-500
      case TransportMode.CAR: return '#f97316'; // Orange-500
      case TransportMode.MIXED: return '#6366f1'; // Indigo-500
      default: return '#9ca3af'; // Gray-400
    }
  };

  const formattedData = data.map(item => ({
    name: item.title, // Used for tooltip
    value: item.totalCo2Kg,
    mode: item.transportMode,
    fill: getTransportColor(item.transportMode)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg text-sm z-50">
          <p className="font-bold text-gray-800">{d.name}</p>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill }}></span>
             <span className="text-gray-600 font-medium">{d.mode}</span>
          </div>
          <p className="text-emerald-600 font-bold mt-1">{d.value} kg CO₂</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-3 text-xs text-gray-600 mt-2">
        {payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
            <span className="font-medium">{entry.payload.mode} Option</span>
          </li>
        ))}
      </ul>
    );
  };

  if (data.length === 0) return null;

  return (
    <div className="h-80 w-full bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-800">Emission Comparison</h3>
        <p className="text-xs text-gray-500">Visualizing the CO₂ impact of your travel options</p>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CarbonChart;