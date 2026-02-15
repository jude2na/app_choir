import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ActionButtonProps {
	title: string;
	icon: React.ReactNode;
	onPress: () => void;
	variant?: "primary" | "secondary";
}

export default function ActionButton({
	title,
	icon,
	onPress,
	variant = "primary",
}: ActionButtonProps) {
	const isPrimary = variant === "primary";

	if (isPrimary) {
		return (
			<TouchableOpacity style={styles.primaryContainer} onPress={onPress}>
				<LinearGradient
					colors={["#1F2937", "#374151"]}
					style={styles.primaryGradient}
				>
					<View style={styles.iconContainer}>{icon}</View>
					<Text style={styles.primaryText}>{title}</Text>
				</LinearGradient>
			</TouchableOpacity>
		);
	}

	return (
		<TouchableOpacity style={styles.secondaryContainer} onPress={onPress}>
			<View style={styles.iconContainer}>{icon}</View>
			<Text style={styles.secondaryText}>{title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	primaryContainer: {
		flex: 1,
		margin: 6,
		borderRadius: 16,
		elevation: 4,
		shadowOpacity: 0.2,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
	},
	primaryGradient: {
		borderRadius: 16,
		paddingVertical: 16,
		paddingHorizontal: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	secondaryContainer: {
		flex: 1,
		margin: 6,
		borderRadius: 16,
		paddingVertical: 16,
		paddingHorizontal: 20,
		backgroundColor: "#FFFFFF",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		elevation: 2,
		shadowOpacity: 0.1,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
	},
	iconContainer: {
		marginRight: 8,
	},
	primaryText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	secondaryText: {
		color: "#374151",
		fontSize: 16,
		fontWeight: "600",
	},
});
