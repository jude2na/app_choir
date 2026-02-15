import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Modal,
	TouchableOpacity,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface CreateCategoryModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (category: any) => void;
}

const colorOptions = [
	"#8B5CF6", // Purple
	"#06B6D4", // Cyan
	"#F43F5E", // Rose
	"#F97316", // Orange
	"#10B981", // Emerald
	"#3B82F6", // Blue
	"#EC4899", // Pink
	"#22C55E", // Green
];

export default function CreateCategoryModal({
	visible,
	onClose,
	onSave,
}: CreateCategoryModalProps) {
	const [categoryName, setCategoryName] = useState("");
	const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

	const handleSave = () => {
		if (!categoryName.trim()) {
			Alert.alert("Error", "Please enter a category name.");
			return;
		}

		const category = {
			id: Date.now().toString(),
			name: categoryName.trim(),
			color: selectedColor,
			songCount: 0,
			dateCreated: new Date().toISOString(),
		};

		onSave(category);
		resetForm();
		onClose();
	};

	const resetForm = () => {
		setCategoryName("");
		setSelectedColor(colorOptions[0]);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	return (
		<Modal visible={visible} animationType="fade" transparent>
			<View style={styles.overlay}>
				<View style={styles.container}>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.headerTitle}>Create Category</Text>
						<TouchableOpacity onPress={handleClose} style={styles.closeButton}>
							<X size={24} color="#6B7280" />
						</TouchableOpacity>
					</View>

					{/* Category Name */}
					<View style={styles.content}>
						<TextInput
							style={styles.input}
							placeholder="Category name"
							value={categoryName}
							onChangeText={setCategoryName}
							placeholderTextColor="#9CA3AF"
							autoFocus
						/>

						{/* Color Selection */}
						<Text style={styles.colorLabel}>Choose a color</Text>
						<View style={styles.colorGrid}>
							{colorOptions.map((color, index) => (
								<TouchableOpacity
									key={index}
									style={[
										styles.colorOption,
										{ backgroundColor: color },
										selectedColor === color && styles.colorOptionSelected,
									]}
									onPress={() => setSelectedColor(color)}
								/>
							))}
						</View>
					</View>

					{/* Create Button */}
					<TouchableOpacity style={styles.createButton} onPress={handleSave}>
						<LinearGradient
							colors={["#A855F7", "#8B5CF6"]}
							style={styles.createGradient}
						>
							<Text style={styles.createButtonText}>Create Category</Text>
						</LinearGradient>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	container: {
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		paddingVertical: 24,
		paddingHorizontal: 20,
		width: "100%",
		maxWidth: 400,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 24,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#374151",
	},
	closeButton: {
		padding: 4,
	},
	content: {
		marginBottom: 32,
	},
	input: {
		borderWidth: 1,
		borderColor: "#E5E7EB",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		fontSize: 16,
		color: "#374151",
		backgroundColor: "#FFFFFF",
		marginBottom: 24,
	},
	colorLabel: {
		fontSize: 16,
		fontWeight: "500",
		color: "#374151",
		marginBottom: 16,
	},
	colorGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	colorOption: {
		width: 60,
		height: 60,
		borderRadius: 12,
		borderWidth: 3,
		borderColor: "transparent",
	},
	colorOptionSelected: {
		borderColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	createButton: {
		borderRadius: 12,
		overflow: "hidden",
	},
	createGradient: {
		paddingVertical: 16,
		paddingHorizontal: 24,
		alignItems: "center",
	},
	createButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#FFFFFF",
	},
});
