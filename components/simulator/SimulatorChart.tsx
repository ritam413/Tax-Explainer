'use client';

import React, { useMemo, useEffect, useState, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { SimulationState } from '@/types/budget';

interface SimulatorChartProps {
  state: SimulationState;
  onSectorSelect?: (category: string) => void;
  selectedCategory?: string | null;
}

export const SimulatorChart: React.FC<SimulatorChartProps> = ({
  state,
  onSectorSelect,
  selectedCategory,
}) => {
  // Throttled frame state to cap re-renders to 60fps max
  const [renderState, setRenderState] = useState<SimulationState>(state);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    frameRef.current = requestAnimationFrame(() => {
      setRenderState(state);
    });

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [state]);

  const chartData = useMemo(() => {
    return renderState.sectors.map((s) => ({
      name: s.category.length > 14 ? s.category.substring(0, 12) + '...' : s.category,
      fullName: s.category,
      Baseline: s.allocatedAmount,
      Simulated: s.simulatedAmount,
      delta: s.deltaAmount,
    }));
  }, [renderState]);

  const handleBarClick = (entry: any) => {
    if (onSectorSelect && entry && entry.fullName) {
      onSectorSelect(entry.fullName);
    }
  };

  return (
    <div className="modal-card p-5 shadow-xl transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] font-goga flex items-center gap-2">
            <span>Visual Impact Analysis</span>
            <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-[var(--badge-bg)] text-[var(--accent-pulse)] border border-[var(--badge-border)]">
              Interactive
            </span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Click any sector bar below to pull up its slider control on the left.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-goga">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[var(--text-muted)]" />
            <span className="text-[var(--text-secondary)] font-medium">Baseline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-[var(--accent-pulse)]" />
            <span className="text-[var(--accent-pulse)] font-bold">Simulated</span>
          </div>
        </div>
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload.length > 0) {
                const payload = state.activePayload[0].payload;
                handleBarClick(payload);
              }
            }}
          >
            <XAxis
              dataKey="name"
              stroke="#888"
              tick={{ fill: '#aaa', fontSize: 11 }}
              interval={0}
              angle={-25}
              textAnchor="end"
            />
            <YAxis stroke="#888" tick={{ fill: '#aaa', fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121411',
                borderColor: '#485346',
                borderRadius: '8px',
                color: '#ddffdc',
                fontSize: '12px',
              }}
              formatter={(value: any, name: any) => [
                `${state.currency}${Number(value).toFixed(2)} ${state.unit}`,
                name,
              ]}
            />
            <Bar
              dataKey="Baseline"
              fill="#485346"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            />
            <Bar
              dataKey="Simulated"
              fill="#7fee64"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              {chartData.map((entry, index) => {
                const isSelected = selectedCategory === entry.fullName;

                return (
                  <Cell
                    key={`cell-${index}`}
                    onClick={() => handleBarClick(entry)}
                    className="cursor-pointer transition-all duration-200"
                    stroke={isSelected ? 'var(--text-primary)' : 'none'}
                    strokeWidth={isSelected ? 2 : 0}
                    fill={
                      entry.delta > 0.001
                        ? '#7fee64'
                        : entry.delta < -0.001
                        ? '#f43f5e'
                        : '#38bdf8'
                    }
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
