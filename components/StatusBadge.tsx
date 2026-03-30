import { Text, View } from "react-native";

const config: Record<string, { bg: string; text: string; label: string }> = {
  upcoming: { bg: "bg-blue/20", text: "text-blue", label: "Upcoming" },
  ongoing: { bg: "bg-green/20", text: "text-green", label: "Ongoing" },
  completed: { bg: "bg-white/10", text: "text-muted", label: "Completed" },
};

export function StatusBadge({ status }: { status: string }) {
  const c = config[status] || config.upcoming;
  return (
    <View className={`px-3 py-1 rounded-full ${c.bg}`}>
      <Text className={`font-label text-[10px] uppercase ${c.text}`}>{c.label}</Text>
    </View>
  );
}
