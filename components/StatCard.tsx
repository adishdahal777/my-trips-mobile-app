import React from "react";
import { Text, View } from "react-native";

interface StatCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  className?: string;
}

export function StatCard({ label, value, subLabel, className }: StatCardProps) {
  return (
    <View className={`bg-white rounded-2xl p-4 border border-slate-100 items-center justify-center shadow-sm ${className}`}>
      <Text className="text-slate-400 font-medium text-[10px] uppercase mb-1">{label}</Text>
      <Text className="text-slate-900 font-bold text-xl">{value}</Text>
      {subLabel && <Text className="text-slate-500 text-[10px] mt-1">{subLabel}</Text>}
    </View>
  );
}
