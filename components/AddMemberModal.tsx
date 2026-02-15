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
	Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Camera, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";

interface AddMemberModalProps {
	visible: boolean;
	onClose: () => void;
	onSave: (member: any) => void;
}

export default function AddMemberModal({
	visible,
	onClose,
	onSave,
}: AddMemberModalProps) {
	const [fullName, setFullName] = useState("");
	const [voiceType, setVoiceType] = useState<
		"Soprano" | "Alto" | "Tenor" | "Bass" | ""
	>("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [notes, setNotes] = useState("");
	const [profileImage, setProfileImage] = useState<string | null>(null);

	const voiceTypes = ["Soprano", "Alto", "Tenor", "Bass"] as const;

	const handleImagePicker = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission needed",
				"Please grant camera roll permissions to upload a photo."
			);
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled) {
			setProfileImage(result.assets[0].uri);
		}
	};

	const handleSave = () => {
		if (!fullName.trim() || !voiceType || !email.trim() || !phone.trim()) {
			Alert.alert("Error", "Please fill in all required fields (Name, Voice Type, Email, Phone).");
			return;
		}

		const member = {
			id: Date.now().toString(),
			name: fullName.trim(),
			voicePart: voiceType,
			email: email.trim(),
			phone: phone.trim(),
			notes: notes.trim(),
			profileImage,
			dateAdded: new Date().toISOString(),
		};

		onSave(member);
		resetForm();
		onClose();
	};

	const resetForm = () => {
		setFullName("");
		setVoiceType("");
		setEmail("");
		setPhone("");
		setNotes("");
		setProfileImage(null);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

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
					<Text style={styles.headerTitle}>Add Member</Text>
					<View style={styles.placeholder} />
				</View>

				<ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
                    <View style={styles.contentInner}>
					{/* Profile Picture */}
					<View style={styles.profileSection}>
						<TouchableOpacity
							style={styles.profileImageContainer}
							onPress={handleImagePicker}
						>
							<View style={styles.profileImageBackground}>
								{profileImage ? (
									<Image
										source={{ uri: profileImage }}
										style={styles.profileImage}
									/>
								) : (
									<User size={48} color="#A855F7" />
								)}
							</View>
							<View style={styles.cameraButton}>
								<Camera size={16} color="#FFFFFF" />
							</View>
						</TouchableOpacity>
					</View>

					{/* Full Name */}
					<View style={styles.fieldContainer}>
						<Text style={styles.label}>Full Name *</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter full name"
							value={fullName}
							onChangeText={setFullName}
							placeholderTextColor="#9CA3AF"
						/>
					</View>

					{/* Voice Type */}
					<View style={styles.fieldContainer}>
						<Text style={styles.label}>Voice Type *</Text>
						<View style={styles.voiceTypeContainer}>
							{voiceTypes.map((type) => (
								<TouchableOpacity
									key={type}
									style={[
										styles.voiceTypeButton,
										voiceType === type && styles.voiceTypeButtonActive,
									]}
									onPress={() => setVoiceType(type)}
								>
									<Text
										style={[
											styles.voiceTypeText,
											voiceType === type && styles.voiceTypeTextActive,
										]}
									>
										{type}
									</Text>
								</TouchableOpacity>
							))}
						</View>
					</View>

					{/* Email */}
					<View style={styles.fieldContainer}>
						<Text style={styles.label}>Email</Text>
						<TextInput
							style={styles.input}
							placeholder="email@example.com"
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							autoCapitalize="none"
							placeholderTextColor="#9CA3AF"
						/>
					</View>

					{/* Phone */}
					<View style={styles.fieldContainer}>
						<Text style={styles.label}>Phone</Text>
						<TextInput
							style={styles.input}
							placeholder="+1 234 567 8900"
							value={phone}
							onChangeText={setPhone}
							keyboardType="phone-pad"
							placeholderTextColor="#9CA3AF"
						/>
					</View>

					{/* Notes */}
					<View style={styles.fieldContainer}>
						<Text style={styles.label}>Notes</Text>
						<TextInput
							style={[styles.input, styles.notesInput]}
							placeholder="Any additional notes..."
							value={notes}
							onChangeText={setNotes}
							multiline
							numberOfLines={4}
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
							<User size={20} color="#FFFFFF" />
							<Text style={styles.saveButtonText}>Add Member</Text>
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
	},
	contentInner: {
	alignSelf: "center",
	width: "100%",
	maxWidth: 600,
	},
	profileSection: {
		alignItems: "center",
		paddingVertical: 32,
	},
	profileImageContainer: {
		position: "relative",
	},
	profileImageBackground: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "#F3E8FF",
		justifyContent: "center",
		alignItems: "center",
		overflow: "hidden",
	},
	profileImage: {
		width: 120,
		height: 120,
		borderRadius: 60,
	},
	cameraButton: {
		position: "absolute",
		bottom: 0,
		right: 0,
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "#8B5CF6",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 3,
		borderColor: "#FFFFFF",
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
	notesInput: {
		height: 100,
		textAlignVertical: "top",
	},
	voiceTypeContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	voiceTypeButton: {
		flex: 1,
		minWidth: "45%",
		paddingVertical: 16,
		paddingHorizontal: 20,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		backgroundColor: "#FFFFFF",
		alignItems: "center",
	},
	voiceTypeButtonActive: {
		borderColor: "#8B5CF6",
		backgroundColor: "#F3E8FF",
	},
	voiceTypeText: {
		fontSize: 16,
		fontWeight: "500",
		color: "#6B7280",
	},
	voiceTypeTextActive: {
		color: "#8B5CF6",
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
