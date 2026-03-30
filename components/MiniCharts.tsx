import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Line, Polyline, Rect } from "react-native-svg";

export function MiniBarChart({ data, label, value, unit }: { data: number[], label: string, value: string, unit?: string }) {
  const max = Math.max(...data);
  const width = 280;
  const height = 150;
  const barWidth = 30;
  const gap = 10;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thus", "Fri", "Sat"];

  return (
    <View className="bg-white rounded-3xl p-5 border border-slate-100 mb-6 shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-slate-900 font-bold text-lg">{label}</Text>
          <Text className="text-slate-500 font-bold text-lg mt-1">
            {value} <Text className="text-slate-400 text-sm font-normal">{unit}</Text>
          </Text>
        </View>
        <View className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex-row items-center">
          <Text className="text-slate-700 text-xs font-medium">This Week</Text>
          <Text className="ml-1 text-slate-400 text-[10px]">▼</Text>
        </View>
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {data.map((h, i) => {
          const barHeight = (h / max) * 100;
          const x = i * (barWidth + gap);
          return (
            <React.Fragment key={i}>
              {/* Background bar */}
              <Rect x={x} y={20} width={barWidth} height={100} rx={8} fill="#f1f5f9" />
              {/* Data bar */}
              <Rect x={x} y={120 - barHeight} width={barWidth} height={barHeight} rx={8} fill="#CBD5E1" />
              {/* Day label */}
              <Text style={{ position: 'absolute', left: x + 5, top: 130 }} className="text-[10px] text-slate-500 font-medium">
                {days[i]}
              </Text>
            </React.Fragment>
          );
        })}
      </Svg>
      
      <View className="flex-row justify-between mt-2">
        {days.map((d, i) => (
          <Text key={i} className="text-[10px] text-slate-900 font-bold w-[30px] text-center">{d}</Text>
        ))}
      </View>
    </View>
  );
}

export function MiniLineChart({ label, unit }: { label: string, unit?: string }) {
  const width = 280;
  const height = 150;
  const points = "0,80 40,30 80,100 120,60 160,50 200,20 240,70";

  return (
    <View className="bg-white rounded-3xl p-5 border border-slate-100 mb-6 shadow-sm">
      <View className="flex-row justify-between items-start mb-6">
        <Text className="text-slate-900 font-bold text-lg">{label}</Text>
        <View className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex-row items-center">
          <Text className="text-slate-700 text-xs font-medium">This Week</Text>
          <Text className="ml-1 text-slate-400 text-[10px]">▼</Text>
        </View>
      </View>

      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Helper Lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <Line key={y} x1="0" y1={y + 10} x2={width} y2={y + 10} stroke="#f1f5f9" strokeWidth="1" />
        ))}
        {/* Y Axis labels */}
        {[70, 60, 50, 40, 30, 20, 10, 0].map((v, i) => (
          <Text key={v} style={{ position: 'absolute', left: -20, top: i * 16 }} className="text-[8px] text-slate-400">{v}</Text>
        ))}
        {/* Trend line */}
        <Polyline points={points} fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data points */}
        {points.split(" ").map((p, i) => {
          const [x, y] = p.split(",");
          return <Circle key={i} cx={x} cy={y} r="4" fill="#64748b" stroke="white" strokeWidth="2" />;
        })}
      </Svg>

      <View className="flex-row justify-between mt-2 pt-2 border-t border-slate-50">
        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d, i) => (
          <Text key={i} className="text-[8px] text-slate-400">{d}</Text>
        ))}
      </View>
    </View>
  );
}
