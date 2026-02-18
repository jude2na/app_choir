import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	Modal,
	TouchableOpacity,
	ScrollView,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	ArrowLeft,
	ChevronDown,
	Plus,
	Upload,
	Save,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as DocumentPicker from "expo-document-picker";

interface AddSongModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (song: any) => void;
	categories: Array<{ id: string; name: string; color: string }>;
	onCreateCategory: () => void;
}

export default function AddSongModal({
	visible,
	onClose,
	onSave,
	categories,
	onCreateCategory,
}: AddSongModalProps) {
	const [songTitle, setSongTitle] = useState("");
	const [composer, setComposer] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [lyrics, setLyrics] = useState("");
	const [audioFile, setAudioFile] = useState<any>(null);
	const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

	const handleAudioUpload = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: ["audio/*"],
				copyToCacheDirectory: true,
			});

			if (!result.canceled) {
				setAudioFile(result.assets[0]);
			}
		} catch (error) {
			Alert.alert("Error", "Failed to pick audio file");
		}
	};

	const handleSave = () => {
		if (!songTitle.trim()) {
			Alert.alert("Error", "Please enter a song title.");
			return;
		}

		const song = {
			id: Date.now().toString(),
			title: songTitle.trim(),
			composer: composer.trim(),
			category: selectedCategory || "Uncategorized",
			lyrics: lyrics.trim(),
			audioFile: audioFile
				? {
						name: audioFile.name,
						uri: audioFile.uri,
						size: audioFile.size,
				  }
				: null,
			dateAdded: new Date().toISOString(),
			isFavorite: false,
		};

		onSave(song);
		resetForm();
		onClose();
	};

	const resetForm = () => {
		setSongTitle("");
		setComposer("");
		setSelectedCategory("");
		setLyrics("");
		setAudioFile(null);
		setShowCategoryDropdown(false);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	const selectedCategoryName =
		categories.find((cat) => cat.id === selectedCategory)?.name ||
		"Select a category";

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
		>
			<SafeAreaView style={styles.container}>
				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity onPress={handleClose} style={styles.backButton}>
						<ArrowLeft size={24} color="#374151" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Add New Song</Text>
					<View style={styles.placeholder} />
				</View>

				<ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
                    <View style={styles.contentInner}>
					{/* Song Title */}
					<View style={styles.fieldContainer}>
						<Text style={styles.label}>Song Title *</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter song title"
							value={songTitle}
							onChangeText={setSongTitle}
							placeholderTextColor="#9CA3AF"
						/>
					</View>

					{/* Composer/Artist */}
					<View style={styles.fieldContainer}>
						<Text style={styles.label}>Composer/Artist</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter composer name"
							value={composer}
							onChangeText={setComposer}
							placeholderTextColor="#9CA3AF"
						/>
					</View>

					{/* Category */}
					<View style={styles.fieldContainer}>
						<Text style={styles.label}>Category</Text>
						<TouchableOpacity
							style={styles.dropdownButton}
							onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
						>
							<Text
								style={[
									styles.dropdownText,
									!selectedCategory && styles.placeholderText,
								]}
							>
								{selectedCategoryName}
							</Text>
							<ChevronDown size={20} color="#6B7280" />
						</TouchableOpacity>

						{showCategoryDropdown && (
							<View style={styles.dropdown}>
								{categories.map((category) => (
									<TouchableOpacity
										key={category.id}
										style={styles.dropdownItem}
										onPress={() => {
											setSelectedCategory(category.id);
											setShowCategoryDropdown(false);
										}}
									>
										<View
											style={[
												styles.categoryColor,
												{ backgroundColor: category.color },
											]}
										/>
										<Text style={styles.dropdownItemText}>{category.name}</Text>
									</TouchableOpacity>
								))}
							</View>
						)}

						<TouchableOpacity
							style={styles.createCategoryButton}
							onPress={onCreateCategory}
						>
							<Plus size={16} color="#8B5CF6" />
							<Text style={styles.createCategoryText}>Create new category</Text>
						</TouchableOpacity>
					</View>

					{/* Audio File */}
					<View style={styles.fieldContainer}>
						<Text style={styles.label}>Audio File</Text>
						<TouchableOpacity
							style={styles.uploadContainer}
							onPress={handleAudioUpload}
						>
							<View style={styles.uploadContent}>
								<Upload size={32} color="#9CA3AF" />
								<Text style={styles.uploadTitle}>
									{audioFile ? audioFile.name : "Click to upload audio file"}
								</Text>
								<Text style={styles.uploadSubtitle}>
									MP3, WAV, or other audio formats
								</Text>
							</View>
						</TouchableOpacity>
					</View>

					{/* Lyrics */}
					<View style={styles.fieldContainer}>
						<Text style={styles.label}>Lyrics</Text>
						<TextInput
							style={[styles.input, styles.lyricsInput]}
							placeholder="Enter song lyrics..."
							value={lyrics}
							onChangeText={setLyrics}
							multiline
							numberOfLines={8}
							textAlignVertical="top"
							placeholderTextColor="#9CA3AF"
						/>
					</View>
				</View>
                </ScrollView>

				{/* Save Button */}
				<View style={styles.bottomContainer}>
					<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
						<LinearGradient
							colors={["#A855F7", "#8B5CF6"]}
							style={styles.saveGradient}
						>
							<Save size={20} color="#FFFFFF" />
							<Text style={styles.saveButtonText}>Save Song</Text>
						</LinearGradient>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#F3F4F6",
	},
	backButton: {
		padding: 8,
	},
	headerTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#374151",
	},
	placeholder: {
		width: 40,
	},
	content: {
	flex: 1,
	paddingHorizontal: 16,
	paddingTop: 16,
	},
	contentInner: {
	alignSelf: "center",
	width: "100%",
	maxWidth: 600,
	},
	fieldContainer: {
		marginBottom: 24,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#374151",
		marginBottom: 8,
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
	},
	lyricsInput: {
		height: 120,
		textAlignVertical: "top",
	},
	dropdownButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		borderWidth: 1,
		borderColor: "#E5E7EB",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: "#FFFFFF",
	},
	dropdownText: {
		fontSize: 16,
		color: "#374151",
	},
	placeholderText: {
		color: "#9CA3AF",
	},
	dropdown: {
		marginTop: 8,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		borderRadius: 12,
		backgroundColor: "#FFFFFF",
		maxHeight: 200,
	},
	dropdownItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#F3F4F6",
	},
	categoryColor: {
		width: 16,
		height: 16,
		borderRadius: 8,
		marginRight: 12,
	},
	dropdownItemText: {
		fontSize: 16,
		color: "#374151",
	},
	createCategoryButton: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 12,
	},
	createCategoryText: {
		fontSize: 14,
		color: "#8B5CF6",
		fontWeight: "500",
		marginLeft: 6,
	},
	uploadContainer: {
		borderWidth: 2,
		borderColor: "#E5E7EB",
		borderStyle: "dashed",
		borderRadius: 12,
		paddingVertical: 32,
		paddingHorizontal: 16,
		alignItems: "center",
		backgroundColor: "#FAFBFC",
	},
	uploadContent: {
		alignItems: "center",
	},
	uploadTitle: {
		fontSize: 16,
		color: "#374151",
		fontWeight: "500",
		marginTop: 12,
		textAlign: "center",
	},
	uploadSubtitle: {
		fontSize: 14,
		color: "#9CA3AF",
		marginTop: 4,
		textAlign: "center",
	},
	bottomContainer: {
		paddingHorizontal: 16,
		paddingVertical: 16,
		borderTopWidth: 1,
		borderTopColor: "#F3F4F6",
	},
	saveButton: {
		borderRadius: 12,
		overflow: "hidden",
	},
	saveGradient: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 16,
		paddingHorizontal: 24,
	},
	saveButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#FFFFFF",
		marginLeft: 8,
	},
});
