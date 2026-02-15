import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	Bold,
	Italic,
	Underline,
	ChevronLeft as AlignLeft,
	TextAlignCenter as AlignCenter,
	Highlighter as AlignRight,
	List,
	Undo2,
	Redo2,
	ZoomIn,
	ZoomOut,
	Save,
	Palette,
	Image,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface LyricsEditorProps {
	initialLyrics?: string;
	onSave: (lyrics: string) => void;
	onClose: () => void;
}

interface FormatState {
	isBold: boolean;
	isItalic: boolean;
	isUnderlined: boolean;
	alignment: "left" | "center" | "right";
	isList: boolean;
}

export default function LyricsEditor({
	initialLyrics = "",
	onSave,
	onClose,
}: LyricsEditorProps) {
	const [lyrics, setLyrics] = useState(initialLyrics);
	const [history, setHistory] = useState<string[]>([initialLyrics]);
	const [historyIndex, setHistoryIndex] = useState(0);
	const [formatState, setFormatState] = useState<FormatState>({
		isBold: false,
		isItalic: false,
		isUnderlined: false,
		alignment: "left",
		isList: false,
	});
	const [fontSize, setFontSize] = useState(16);
	const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");

	useEffect(() => {
		// Add to history when text changes (debounced)
		const timeoutId = setTimeout(() => {
			if (lyrics !== history[historyIndex]) {
				const newHistory = history.slice(0, historyIndex + 1);
				newHistory.push(lyrics);
				setHistory(newHistory);
				setHistoryIndex(newHistory.length - 1);
			}
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [lyrics]);

	const undo = () => {
		if (historyIndex > 0) {
			const newIndex = historyIndex - 1;
			setHistoryIndex(newIndex);
			setLyrics(history[newIndex]);
		}
	};

	const redo = () => {
		if (historyIndex < history.length - 1) {
			const newIndex = historyIndex + 1;
			setHistoryIndex(newIndex);
			setLyrics(history[newIndex]);
		}
	};

	const toggleFormat = (format: keyof FormatState) => {
		setFormatState((prev) => ({
			...prev,
			[format]: !prev[format],
		}));
	};

	const setAlignment = (alignment: "left" | "center" | "right") => {
		setFormatState((prev) => ({
			...prev,
			alignment,
		}));
	};

	const zoomIn = () => {
		setFontSize((prev) => Math.min(prev + 2, 32));
	};

	const zoomOut = () => {
		setFontSize((prev) => Math.max(prev - 2, 10));
	};

	const handleSave = () => {
		onSave(lyrics);
		Alert.alert("Success", "Lyrics saved successfully!");
	};

	const changeBackground = () => {
		const colors = [
			"#FFFFFF",
			"#F8FAFC",
			"#FEF3C7",
			"#DBEAFE",
			"#F3E8FF",
			"#ECFDF5",
		];
		const currentIndex = colors.indexOf(backgroundColor);
		const nextIndex = (currentIndex + 1) % colors.length;
		setBackgroundColor(colors[nextIndex]);
	};

	const getTextStyle = () => ({
		fontSize,
		fontWeight: formatState.isBold ? ("bold" as const) : ("normal" as const),
		fontStyle: formatState.isItalic ? ("italic" as const) : ("normal" as const),
		textDecorationLine: formatState.isUnderlined
			? ("underline" as const)
			: ("none" as const),
		textAlign: formatState.alignment,
		color: "#374151",
		lineHeight: fontSize * 1.5,
	});

	return (
		<View style={[styles.container, { backgroundColor }]}>
			<SafeAreaView style={styles.safeArea}>
				{/* Toolbar */}
				<View style={styles.toolbar}>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						<View style={styles.toolbarContent}>
							{/* Undo/Redo */}
							<TouchableOpacity
								style={[
									styles.toolButton,
									historyIndex === 0 && styles.toolButtonDisabled,
								]}
								onPress={undo}
								disabled={historyIndex === 0}
							>
								<Undo2
									size={20}
									color={historyIndex === 0 ? "#9CA3AF" : "#374151"}
								/>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.toolButton,
									historyIndex === history.length - 1 &&
										styles.toolButtonDisabled,
								]}
								onPress={redo}
								disabled={historyIndex === history.length - 1}
							>
								<Redo2
									size={20}
									color={
										historyIndex === history.length - 1 ? "#9CA3AF" : "#374151"
									}
								/>
							</TouchableOpacity>

							<View style={styles.separator} />

							{/* Format buttons */}
							<TouchableOpacity
								style={[
									styles.toolButton,
									formatState.isBold && styles.toolButtonActive,
								]}
								onPress={() => toggleFormat("isBold")}
							>
								<Bold
									size={20}
									color={formatState.isBold ? "#FFFFFF" : "#374151"}
								/>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.toolButton,
									formatState.isItalic && styles.toolButtonActive,
								]}
								onPress={() => toggleFormat("isItalic")}
							>
								<Italic
									size={20}
									color={formatState.isItalic ? "#FFFFFF" : "#374151"}
								/>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.toolButton,
									formatState.isUnderlined && styles.toolButtonActive,
								]}
								onPress={() => toggleFormat("isUnderlined")}
							>
								<Underline
									size={20}
									color={formatState.isUnderlined ? "#FFFFFF" : "#374151"}
								/>
							</TouchableOpacity>

							<View style={styles.separator} />

							{/* Alignment */}
							<TouchableOpacity
								style={[
									styles.toolButton,
									formatState.alignment === "left" && styles.toolButtonActive,
								]}
								onPress={() => setAlignment("left")}
							>
								<AlignLeft
									size={20}
									color={
										formatState.alignment === "left" ? "#FFFFFF" : "#374151"
									}
								/>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.toolButton,
									formatState.alignment === "center" && styles.toolButtonActive,
								]}
								onPress={() => setAlignment("center")}
							>
								<AlignCenter
									size={20}
									color={
										formatState.alignment === "center" ? "#FFFFFF" : "#374151"
									}
								/>
							</TouchableOpacity>

							<TouchableOpacity
								style={[
									styles.toolButton,
									formatState.alignment === "right" && styles.toolButtonActive,
								]}
								onPress={() => setAlignment("right")}
							>
								<AlignRight
									size={20}
									color={
										formatState.alignment === "right" ? "#FFFFFF" : "#374151"
									}
								/>
							</TouchableOpacity>

							<View style={styles.separator} />

							{/* Zoom */}
							<TouchableOpacity style={styles.toolButton} onPress={zoomOut}>
								<ZoomOut size={20} color="#374151" />
							</TouchableOpacity>

							<TouchableOpacity style={styles.toolButton} onPress={zoomIn}>
								<ZoomIn size={20} color="#374151" />
							</TouchableOpacity>

							<View style={styles.separator} />

							{/* Background */}
							<TouchableOpacity
								style={styles.toolButton}
								onPress={changeBackground}
							>
								<Palette size={20} color="#374151" />
							</TouchableOpacity>
						</View>
					</ScrollView>
				</View>

				{/* Editor */}
				<ScrollView style={styles.editorContainer}>
					<TextInput
						style={[styles.editor, getTextStyle()]}
						value={lyrics}
						onChangeText={setLyrics}
						multiline
						placeholder="Enter your lyrics here..."
						placeholderTextColor="#9CA3AF"
						textAlignVertical="top"
					/>
				</ScrollView>

				{/* Bottom Actions */}
				<View style={styles.bottomActions}>
					<TouchableOpacity style={styles.cancelButton} onPress={onClose}>
						<Text style={styles.cancelButtonText}>Cancel</Text>
					</TouchableOpacity>

					<TouchableOpacity style={styles.saveButton} onPress={handleSave}>
						<LinearGradient
							colors={["#8B5CF6", "#A855F7"]}
							style={styles.saveGradient}
						>
							<Save size={20} color="#FFFFFF" />
							<Text style={styles.saveButtonText}>Save</Text>
						</LinearGradient>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	toolbar: {
		backgroundColor: "#FFFFFF",
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
		paddingVertical: 8,
	},
	toolbarContent: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
	},
	toolButton: {
		padding: 8,
		marginHorizontal: 2,
		borderRadius: 8,
		backgroundColor: "#F9FAFB",
	},
	toolButtonActive: {
		backgroundColor: "#8B5CF6",
	},
	toolButtonDisabled: {
		opacity: 0.5,
	},
	separator: {
		width: 1,
		height: 24,
		backgroundColor: "#E5E7EB",
		marginHorizontal: 8,
	},
	editorContainer: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	editor: {
		minHeight: 400,
		textAlignVertical: "top",
		padding: 0,
	},
	bottomActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: "#FFFFFF",
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
	},
	cancelButton: {
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 12,
		backgroundColor: "#F3F4F6",
		flex: 1,
		marginRight: 12,
		alignItems: "center",
	},
	cancelButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#6B7280",
	},
	saveButton: {
		flex: 1,
		marginLeft: 12,
		borderRadius: 12,
		overflow: "hidden",
	},
	saveGradient: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
		paddingVertical: 12,
	},
	saveButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#FFFFFF",
		marginLeft: 8,
	},
});
