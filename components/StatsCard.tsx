import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface StatsCardProps {
	title: string;
	count: number;
	icon: React.ReactNode;
	colors: readonly [string, string, ...string[]];
}

export default function StatsCard({
	title,
	count,
	icon,
	colors,
}: StatsCardProps) {
	return (
		<LinearGradient colors={colors} style={styles.container}>
			<View style={styles.iconContainer}>{icon}</View>
			<View style={styles.textContainer}>
				<Text style={styles.count}>{count}</Text>
				<Text style={styles.title}>{title}</Text>
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 16,
		padding: 16,
		marginHorizontal: 6,
		marginVertical: 8,
		minHeight: 90,
		width: 140,
		justifyContent: "center",
		elevation: 4,
		shadowOpacity: 0.2,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 2 },
	},
	iconContainer: {
		marginBottom: 8,
	},
	textContainer: {
		alignItems: "flex-start",
	},
	count: {
		fontSize: 26,
		fontWeight: "bold",
		color: "#FFFFFF",
		marginBottom: 2,
	},
	title: {
		fontSize: 13,
		color: "#FFFFFF",
		opacity: 0.9,
	},
});
