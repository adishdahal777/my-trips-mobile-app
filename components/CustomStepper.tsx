import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

interface Step {
  label: string;
  icon: any;
  status: "completed" | "current" | "pending";
}

export function CustomStepper({ steps }: { steps: Step[] }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-6">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <View className="items-center flex-1">
            <View 
              className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
                step.status === "completed" ? "bg-slate-100" : 
                step.status === "current" ? "bg-white border-2 border-slate-100" : "bg-slate-50"
              }`}
            >
              <Ionicons 
                name={step.icon} 
                size={24} 
                color={step.status === "pending" ? "#cbd5e1" : "#334155"} 
              />
            </View>
            <Text className={`text-[10px] font-bold ${step.status === "pending" ? "text-slate-300" : "text-slate-900"}`}>
              {step.label}
            </Text>
          </View>
          
          {i < steps.length - 1 && (
            <View className={`h-[2px] flex-1 -mt-6 mx-[-15px] ${step.status === "completed" ? "bg-slate-100" : "bg-slate-50"}`} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}
