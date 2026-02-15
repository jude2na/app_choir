import { Tabs } from "expo-router";
import { Hop as Home, Music, FolderOpen, Users } from "lucide-react-native";
import { EventBusProvider } from "../../components/EventBus";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
	const insets = useSafeAreaInsets();

	return (
		<EventBusProvider>
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarStyle: {
						backgroundColor: "#ffffff",
						borderTopWidth: 0,
						elevation: 6,
						shadowOpacity: 0.08,
						shadowRadius: 4,
						shadowOffset: { width: 0, height: -2 },
						// make tab bar height responsive to safe area insets (avoids overlap on Android navigation bar / iPhone home indicator)
						height: 60 + insets.bottom,
						paddingBottom: insets.bottom + 8,
						paddingTop: 8,
					},
					tabBarActiveTintColor: "#8B5CF6",
					tabBarInactiveTintColor: "#9CA3AF",
					tabBarLabelStyle: {
						fontSize: 12,
						fontWeight: "500",
						marginTop: 4,
					},
				}}
			>
				<Tabs.Screen
					name="index"
					options={{
						title: "Home",
						tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
					}}
				/>
				<Tabs.Screen
					name="songs"
					options={{
						title: "Songs",
						tabBarIcon: ({ size, color }) => (
							<Music size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="categories"
					options={{
						title: "Categories",
						tabBarIcon: ({ size, color }) => (
							<FolderOpen size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="members"
					options={{
						title: "Members",
						tabBarIcon: ({ size, color }) => (
							<Users size={size} color={color} />
						),
					}}
				/>
			</Tabs>
		</EventBusProvider>
	);
}
