"use client";

import React, { useState, useEffect } from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";
import { Sparkles } from "lucide-react";

interface DataItem {
  id: string;
  name: string;
  value: number;
  color: string;
}

interface DisassembleVisualizerProps {
  data: DataItem[];
  activeId: string | null;
  onSliceClick: (id: string) => void;
  onExplainClick?: () => void;
}

const RADIAN = Math.PI / 180;

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    payload,
    percent,
    value,
  } = props;

  // Calculate shift distance along angle bisector
  const shiftDistance = 22;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);

  const sx = cx + shiftDistance * cos;
  const sy = cy + shiftDistance * sin;

  // Position label uniformly outside the slice
  const labelRadius = outerRadius + 28;
  const lx = sx + labelRadius * cos;
  const ly = sy + labelRadius * sin;

  // Leader line start
  const lineStartRadius = outerRadius + 6;
  const lineSx = sx + lineStartRadius * cos;
  const lineSy = sy + lineStartRadius * sin;

  const textAnchor = cos >= 0 ? 'start' : 'end';
  const percentageStr = (percent * 100).toFixed(1);

  return (
    <g>
      {/* Dotted Leader Line */}
      <path
        d={`M${lineSx},${lineSy} L${lx},${ly}`}
        stroke="#ea4335"
        strokeWidth={1.5}
        strokeDasharray="3 3"
        fill="none"
      />
      {/* Target Dot */}
      <circle cx={lx} cy={ly} r={3} fill="#ea4335" />

      {/* Category Name */}
      <text
        x={lx + (cos >= 0 ? 8 : -8)}
        y={ly - 4}
        textAnchor={textAnchor}
        fill="#ea4335"
        className="text-xs font-bold font-goga tracking-wide uppercase"
      >
        {payload.name}
      </text>

      {/* Subtext: Amount & Percentage */}
      <text
        x={lx + (cos >= 0 ? 8 : -8)}
        y={ly + 12}
        textAnchor={textAnchor}
        fill="#ddffdc"
        className="text-xs font-mono font-medium"
      >
        ${value}B ({percentageStr}%)
      </text>

      {/* Main Sector Slice */}
      <Sector
        cx={sx}
        cy={sy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill="#ea4335"
        className="transition-all duration-300 drop-shadow-[0_0_16px_rgba(234,67,53,0.7)]"
      />
      {/* Accent Outer Ring */}
      <Sector
        cx={sx}
        cy={sy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 14}
        fill="#ea4335"
      />
    </g>
  );
};


const PieAny = Pie as any;

export function DisassembleVisualizer({ data, activeId, onSliceClick, onExplainClick }: DisassembleVisualizerProps) {
  // We need a local state to track active index because recharts uses index for activeShape
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!activeId) {
      setActiveIndex(undefined);
    } else {
      const idx = data.findIndex(item => item.id === activeId);
      setActiveIndex(idx >= 0 ? idx : undefined);
    }
  }, [activeId, data]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
    if (data[index]) {
      onSliceClick(data[index].id);
    }
  };
  
  const onPieLeave = () => {
    // Optional: reset on leave, but user might want it to stay selected
  }

  // Handle single data item case properly
  const isSingleData = data.length === 1;

  if (data.length === 0) return null;

  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center relative">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <PieAny
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={isSingleData ? 0 : 4} // No gap if single item
            dataKey="value"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            onClick={onPieEnter}
            stroke="none"
          >
            {data.map((entry, index) => {
              const isActive = index === activeIndex;
              const hasActive = activeIndex !== undefined;
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="transition-opacity duration-300 outline-none cursor-pointer"
                  style={{
                    opacity: hasActive && !isActive ? 0.35 : 1, // Dim others to 35%
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onPieEnter({}, index);
                    }
                  }}
                />
              );
            })}
          </PieAny>
        </PieChart>
      </ResponsiveContainer>

      {/* Button positioned at bottom-right of disassemble visualizer */}
      {activeId && onExplainClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExplainClick();
          }}
          className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#111111] text-[#ffffff] font-medium text-xs shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:bg-[#ea4335] active:scale-95 transition-all border border-[rgba(255,255,255,0.15)] cursor-pointer group"
          aria-label="Explain budget allocation with AI"
        >
          <Sparkles className="w-4 h-4 text-[#ea4335] group-hover:text-white transition-colors" />
          <span>Explain with AI</span>
        </button>
      )}
    </div>
  );
}


