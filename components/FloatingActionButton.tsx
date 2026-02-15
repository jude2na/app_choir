import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Plus } from "lucide-react-native";

interface FloatingActionButtonProps {
	onPress: () => void;
}

export default function FloatingActionButton({
	onPress,
}: FloatingActionButtonProps) {
	const insets = useSafeAreaInsets();

	// Position the button at the bottom-right of the screen, respecting safe area
	// bottom: 24 + insets.bottom ensures it doesn't overlap with navigation indicators
	return (
		<TouchableOpacity
			style={[styles.container, { bottom: 24 + insets.bottom }]}
			onPress={onPress}
			activeOpacity={0.85}
			hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
		>
			<LinearGradient colors={["#8B5CF6", "#A855F7"]} style={styles.gradient}>
				<Plus size={24} color="#FFFFFF" />
			</LinearGradient>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		right: 16,
		bottom: 24,
		borderRadius: 14,
		elevation: 6,
		shadowOpacity: 0.25,
		shadowRadius: 6,
		shadowOffset: { width: 0, height: 3 },
	},
	gradient: {
		width: 48,
		height: 48,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
	},
});
