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
			activeOpacity={0.88}
			hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
		>
			<LinearGradient colors={["#6C5CE7", "#00D2D3"]} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.gradient}>
				<Plus size={24} color="#FFFFFF" />
			</LinearGradient>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		position: "absolute",
		right: 20,
		bottom: 24,
		borderRadius: 18,
		elevation: 8,
		shadowOpacity: 0.3,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 6 },
	},
	gradient: {
		width: 56,
		height: 56,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
	},
});
