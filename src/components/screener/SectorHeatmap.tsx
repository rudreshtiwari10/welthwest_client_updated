/**
 * Sector Heatmap - Clean UI
 *
 * Compact sector performance grid for SHORT screener
 */

import React from 'react';
import { SectorHeatmapData, SectorData } from '../../services/screenerService';

interface SectorHeatmapProps {
  data: SectorHeatmapData | null;
  isLoading?: boolean;
}

const SectorTile: React.FC<{
  sector: string;
  data: SectorData;
}> = ({ sector, data }) => {
  // For SHORT screener, highlight bearish sectors
  const isBearish = data.sentiment === 'bearish';
  const isNeutral = data.sentiment === 'neutral';

  return (
    <div
      className={`
        rounded-lg p-3 border transition-all cursor-pointer
        ${isBearish
          ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
          : isNeutral
            ? 'bg-gray-500/10 border-gray-700 hover:border-gray-600'
            : 'bg-green-500/10 border-green-500/20 hover:border-green-500/40'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-xs font-medium truncate" title={sector}>
          {sector}
        </span>
        <span className={`text-xs font-bold ${
          isBearish ? 'text-red-400' : isNeutral ? 'text-gray-400' : 'text-green-400'
        }`}>
          {data.score.toFixed(0)}
        </span>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-gray-500 truncate" title={data.top_stock || 'N/A'}>
          {data.top_stock || 'N/A'}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-red-400">{data.short_count}S</span>
          <span className="text-gray-600">|</span>
          <span className="text-green-400">{data.long_count}L</span>
        </div>
      </div>
    </div>
  );
};

const SectorHeatmap: React.FC<SectorHeatmapProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <div className="h-4 bg-gray-800 rounded w-24 mb-4"></div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-14 bg-gray-800 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || !data.sectors) {
    return null;
  }

  const sectors = Object.entries(data.sectors);
  // Sort by short_count for SHORT screener relevance
  sectors.sort((a, b) => b[1].short_count - a[1].short_count);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">Sectors</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-red-500/50"></span>
            <span className="text-gray-500">Bearish</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-gray-500/50"></span>
            <span className="text-gray-500">Neutral</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-green-500/50"></span>
            <span className="text-gray-500">Bullish</span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {sectors.map(([sector, sectorData]) => (
          <SectorTile key={sector} sector={sector} data={sectorData} />
        ))}
      </div>
    </div>
  );
};

export default SectorHeatmap;
