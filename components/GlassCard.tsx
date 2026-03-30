import React from "react";
import { View, type ViewProps } from "react-native";

export function GlassCard({ children, className, ...rest }: ViewProps & { children: React.ReactNode }) {
  return (
    <View className={`bg-white/5 border border-white/10 rounded-3xl p-4 ${className ?? ""}`} {...rest}>
      {children}
    </View>
  );
}
