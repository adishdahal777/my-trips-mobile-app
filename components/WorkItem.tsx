import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface WorkItemProps {
  title: string;
  orderNo?: string;
  model?: string;
  qty?: number;
  date?: string;
  image?: string;
  status?: "received" | "pending";
  onPress?: () => void;
  className?: string;
  icon?: any;
}

export function WorkItem({ title, orderNo, model, qty, date, image, status, onPress, className, icon }: WorkItemProps) {
  return (
    <Pressable onPress={onPress} className={`bg-white rounded-3xl p-4 border border-slate-100 flex-row items-center shadow-sm mb-3 ${className}`}>
      {image ? (
        <View className="w-16 h-16 rounded-2xl bg-slate-50 items-center justify-center mr-4 border border-slate-100 p-1">
          <Image source={{ uri: image }} className="w-full h-full rounded-xl" resizeMode="contain" />
        </View>
      ) : icon ? (
        <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-4">
          <Ionicons name={icon} size={18} color="#64748b" />
        </View>
      ) : null}

      <View className="flex-1">
        <View className="flex-row justify-between items-start">
          <Text className="text-slate-900 font-bold text-base mb-1">{title}</Text>
          {date && <Text className="text-slate-400 text-[10px]">{date}</Text>}
        </View>
        
        {orderNo && (
          <Text className="text-slate-500 text-xs mb-1">
            Order Number : <Text className="text-slate-700 font-medium">{orderNo}</Text>
          </Text>
        )}
        {model && (
          <Text className="text-slate-500 text-xs mb-1">
            Model: <Text className="text-slate-700 font-medium">{model}</Text>
          </Text>
        )}
        {qty !== undefined && (
          <Text className="text-slate-500 text-xs">
            Quantity : <Text className="text-slate-700 font-medium">X{qty}</Text>
          </Text>
        )}
      </View>

      {status === "received" && (
        <View className="bg-slate-100 px-3 py-1.5 rounded-lg flex-row items-center ml-2">
          <Ionicons name="checkmark" size={12} color="#64748b" className="mr-1" />
          <Text className="text-slate-500 text-[10px] font-bold uppercase ml-1">Receive</Text>
        </View>
      )}
    </Pressable>
  );
}
