import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface GradientBackgroundProps {
	children: React.ReactNode;
	style?: any;
}

export default function GradientBackground({
	children,
	style,
}: GradientBackgroundProps) {
	return (
		<LinearGradient
			colors={["#F8FAFC", "#EDF2F7", "#E2E8F0"]}
			style={[styles.container, style]}
		>
			{children}
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});
