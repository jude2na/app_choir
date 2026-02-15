import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native";
import { useEventBus } from "../../components/EventBus";
import { Users } from "lucide-react-native";
import GradientBackground from "../../components/GradientBackground";
import SearchBar from "../../components/SearchBar";
import FloatingActionButton from "../../components/FloatingActionButton";
import AddMemberModal from "../../components/AddMemberModal";
import { loadMembers, saveMembers, addMember, Member } from "../../utils/storage";
import Card from "../../components/ui/Card";
import { theme, initialsFromName, colorFromString } from "../../components/theme";

const voiceParts = [
	{ name: "All", count: 0 },
	{ name: "Soprano", count: 0 },
	{ name: "Alto", count: 0 },
	{ name: "Tenor", count: 0 },
	{ name: "Bass", count: 0 },
];

export default function MembersScreen() {
	const [searchText, setSearchText] = useState("");
	const [selectedPart, setSelectedPart] = useState("All");
	const [showAddMemberModal, setShowAddMemberModal] = useState(false);
	const [members, setMembers] = useState<any[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const eventBus = useEventBus();

	useEffect(() => {
		loadData();
	}, []);

	// reload when screen is focused (so additions from other tabs appear)
	const isFocused = useIsFocused();
	useEffect(() => {
		if (isFocused) loadData();
	}, [isFocused]);

	const loadData = async () => {
		setRefreshing(true);
		const loadedMembers = await loadMembers();
		setMembers(loadedMembers);
		setRefreshing(false);
	};

	// subscribe to in-app events so UI updates immediately when a member is added elsewhere
	useEffect(() => {
		const unsub = eventBus.on("members:added", (member) => {
			if (!member) return;
			setMembers((prev) => [member, ...prev]);
		});
		return unsub;
	}, [eventBus]);

	const handleAddMember = () => {
		setShowAddMemberModal(true);
	};

	const handleSaveMember = async (newMember: any) => {
		await addMember(newMember as Member);
		setMembers((prev) => [newMember, ...prev]);
	};

	return (
		<GradientBackground>
			<SafeAreaView style={styles.container}>
				<FloatingActionButton onPress={handleAddMember} />

				<ScrollView showsVerticalScrollIndicator={false}>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.title}>Members</Text>
						<Text style={styles.subtitle}>{members.length} choir members</Text>
					</View>

					{/* Search Bar */}
					<SearchBar
						placeholder="Search members..."
						value={searchText}
						onChangeText={setSearchText}
					/>

					{/* Voice Parts Filter */}
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.filterContainer}
					>
						{voiceParts.map((part, index) => (
							<TouchableOpacity
								key={index}
								style={[
									styles.filterChip,
									selectedPart === part.name && styles.filterChipActive,
								]}
								onPress={() => setSelectedPart(part.name)}
							>
								<Text
									style={[
										styles.filterChipText,
										selectedPart === part.name && styles.filterChipTextActive,
									]}
								>
									{part.name} ({part.count})
								</Text>
							</TouchableOpacity>
						))}
					</ScrollView>

					{/* Members List / Empty State */}
					{(() => {
						const filtered = members.filter((m) => {
							const matchesSearch = m.name
								.toLowerCase()
								.includes(searchText.toLowerCase());
							const matchesPart =
								selectedPart === "All" || m.voicePart === selectedPart;
							return matchesSearch && matchesPart;
						});

						if (filtered.length === 0) {
							return (
								<View style={styles.emptyContainer}>
									<Users size={64} color="#D1D5DB" style={styles.emptyIcon} />
									<Text style={styles.emptyTitle}>No members yet</Text>
									<TouchableOpacity onPress={handleAddMember}>
										<Text style={styles.emptyAction}>
											Add your first member
										</Text>
									</TouchableOpacity>
								</View>
							);
						}

						return (
						<View style={styles.listContainer}>
						{filtered
						.slice()
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((m) => (
						<Card
						key={m.id}
						title={m.name}
						subtitle={m.voicePart || "Member"}
						leading={
						<View
						style={{
						width: 44,
						height: 44,
						borderRadius: 22,
						backgroundColor: colorFromString(m.name),
						alignItems: 'center',
						justifyContent: 'center',
						}}
						>
						<Text style={{ color: '#fff', fontWeight: '800' }}>
						{initialsFromName(m.name)}
						</Text>
						</View>
						}
						/>
						))}
						</View>
						);
					})()}
				</ScrollView>

				<AddMemberModal
					visible={showAddMemberModal}
					onClose={() => setShowAddMemberModal(false)}
					onSave={handleSaveMember}
				/>
			</SafeAreaView>
		</GradientBackground>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 16,
		paddingTop: 20,
		paddingBottom: 10,
	},
	title: {
	fontSize: 28,
	fontWeight: "bold",
	color: theme.colors.text,
	marginBottom: 4,
	},
	subtitle: {
	fontSize: 16,
	color: theme.colors.muted,
	},
	filterContainer: {
		paddingHorizontal: 16,
		marginBottom: 20,
	},
	filterChip: {
		backgroundColor: "#F1F5F9",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		marginRight: 12,
		minWidth: 80,
		alignItems: "center",
	},
	filterChipActive: {
		backgroundColor: "#8B5CF6",
	},
	filterChipText: {
		fontSize: 14,
		color: "#6B7280",
		fontWeight: "500",
	},
	filterChipTextActive: {
		color: "#FFFFFF",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 120,
		paddingHorizontal: 16,
	},
	emptyIcon: {
		marginBottom: 16,
	},
	emptyTitle: {
		fontSize: 18,
		color: "#9CA3AF",
		textAlign: "center",
		marginBottom: 8,
	},
	emptyAction: {
		fontSize: 16,
		color: "#8B5CF6",
		fontWeight: "500",
	},
	listContainer: {
	paddingHorizontal: 16,
	paddingBottom: 120,
	},
	memberItem: {
		backgroundColor: "#FFFFFF",
		padding: 12,
		borderRadius: 12,
		marginBottom: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		elevation: 1,
		shadowOpacity: 0.06,
		shadowRadius: 2,
		shadowOffset: { width: 0, height: 1 },
	},
	memberName: {
		fontSize: 16,
		color: "#374151",
		fontWeight: "600",
	},
	memberPart: {
		fontSize: 14,
		color: "#6B7280",
		fontWeight: "500",
	},
});
