import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Search } from "lucide-react-native";

interface SearchBarProps {
	placeholder: string;
	value: string;
	onChangeText: (text: string) => void;
}

export default function SearchBar({
	placeholder,
	value,
	onChangeText,
}: SearchBarProps) {
	return (
		<View style={styles.container}>
			<Search size={20} color="#9CA3AF" style={styles.icon} />
			<TextInput
				style={styles.input}
				placeholder={placeholder}
				value={value}
				onChangeText={onChangeText}
				placeholderTextColor="#9CA3AF"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F1F5F9",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		marginHorizontal: 16,
		marginBottom: 20,
	},
	icon: {
		marginRight: 12,
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: "#374151",
	},
});
