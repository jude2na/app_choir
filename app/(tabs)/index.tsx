import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Modal,
	Dimensions,
} from "react-native";
import {
	SafeAreaView,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Music, FolderOpen, Users, Plus, User, X } from "lucide-react-native";
import GradientBackground from "../../components/GradientBackground";
import VerseWidget from "../../components/VerseWidget";
import StatsCard from "../../components/StatsCard";
import FloatingActionButton from "../../components/FloatingActionButton";
import AddSongModal from "../../components/AddSongModal";
import AddMemberModal from "../../components/AddMemberModal";
import CreateCategoryModal from "../../components/CreateCategoryModal";
import {
	saveSongs,
	loadSongs,
	saveMembers,
	loadMembers,
	Song,
	Member,
} from "../../utils/storage";
import { useEventBus } from "../../components/EventBus";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const defaultCategories = [
	{ id: "1", name: "C Major", color: "#8B5CF6", songCount: 0 },
	{ id: "2", name: "D Major", color: "#06B6D4", songCount: 0 },
	{ id: "3", name: "A Minor", color: "#F43F5E", songCount: 0 },
	{ id: "4", name: "Bati", color: "#F97316", songCount: 0 },
	{ id: "5", name: "Ambasel", color: "#10B981", songCount: 0 },
	{ id: "6", name: "Anchi Hoye", color: "#3B82F6", songCount: 0 },
];

export default function HomeScreen() {
	const [searchText, setSearchText] = useState("");
	const [songs, setSongs] = useState<Song[]>([]);
	const [members, setMembers] = useState<Member[]>([]);
	const [categories, setCategories] = useState(defaultCategories);
	const [showAddSongModal, setShowAddSongModal] = useState(false);
	const [showAddMemberModal, setShowAddMemberModal] = useState(false);
	const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
	const [showQuickActions, setShowQuickActions] = useState(false);
	const insets = useSafeAreaInsets();

	// get event bus from provider
	const eventBus = useEventBus();

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		const loadedSongs = await loadSongs();
		const loadedMembers = await loadMembers();
		setSongs(loadedSongs);
		setMembers(loadedMembers);
	};

	const handleAddSong = () => {
		setShowQuickActions(false);
		setShowAddSongModal(true);
	};

	const handleAddMember = () => {
		setShowQuickActions(false);
		setShowAddMemberModal(true);
	};

	const handleAddCategory = () => {
		setShowQuickActions(false);
		setShowCreateCategoryModal(true);
	};

	const handleSaveSong = async (song: Song) => {
		const updatedSongs = [...songs, song];
		setSongs(updatedSongs);
		await saveSongs(updatedSongs);
		// notify other screens
		eventBus?.emit("songs:added", song);
	};

	const handleSaveMember = async (member: Member) => {
		const updatedMembers = [...members, member];
		setMembers(updatedMembers);
		await saveMembers(updatedMembers);
		// notify other screens
		eventBus?.emit("members:added", member);
	};

	const handleCreateCategory = (category: any) => {
		setCategories((prev) => [...prev, category]);
		setShowCreateCategoryModal(false);
	};

	const handleFloatingAction = () => {
		setShowQuickActions(true);
	};

	const closeQuickActions = () => {
		setShowQuickActions(false);
	};

	// Stats data for horizontal scroll
	const statsData = [
		{
			title: "Songs",
			count: songs.length,
			icon: <Music size={20} color="#FFFFFF" />,
			colors: ["#8B5CF6", "#A855F7"] as const,
		},
		{
			title: "Categories",
			count: categories.length,
			icon: <FolderOpen size={20} color="#FFFFFF" />,
			colors: ["#06B6D4", "#0891B2"] as const,
		},
		{
			title: "Members",
			count: members.length,
			icon: <Users size={20} color="#FFFFFF" />,
			colors: ["#F43F5E", "#E11D48"] as const,
		},
	];

	return (
		<GradientBackground>
			<SafeAreaView style={styles.container}>
				<FloatingActionButton onPress={handleFloatingAction} />

				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{/* Daily Verse - Hero Section */}
					<View style={styles.heroSection}>
						<VerseWidget />
					</View>

					{/* Stats Cards - Horizontal Scroll */}
					<View style={styles.statsSection}>
						<ScrollView
							horizontal
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.statsScrollContent}
						>
							{statsData.map((stat, index) => (
								<StatsCard
									key={index}
									title={stat.title}
									count={stat.count}
									icon={stat.icon}
									colors={stat.colors}
								/>
							))}
						</ScrollView>
					</View>

					{/* Quick Actions Preview */}
					<View style={styles.quickActionsSection}>
						<Text style={styles.sectionTitle}>Quick Actions</Text>
						<View style={styles.quickActionsGrid}>
							<TouchableOpacity
								style={styles.quickActionCard}
								onPress={handleAddSong}
							>
								<View
									style={[
										styles.quickActionIcon,
										{ backgroundColor: "#8B5CF6" },
									]}
								>
									<Music size={20} color="#FFFFFF" />
								</View>
								<Text style={styles.quickActionText}>Add Song</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.quickActionCard}
								onPress={handleAddMember}
							>
								<View
									style={[
										styles.quickActionIcon,
										{ backgroundColor: "#F43F5E" },
									]}
								>
									<User size={20} color="#FFFFFF" />
								</View>
								<Text style={styles.quickActionText}>Add Member</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.quickActionCard}
								onPress={handleAddCategory}
							>
								<View
									style={[
										styles.quickActionIcon,
										{ backgroundColor: "#06B6D4" },
									]}
								>
									<FolderOpen size={20} color="#FFFFFF" />
								</View>
								<Text style={styles.quickActionText}>Add Category</Text>
							</TouchableOpacity>
						</View>
					</View>

					{/* Recent Songs Preview */}
					<View style={styles.recentSection}>
						<View style={styles.sectionHeader}>
							<Text style={styles.sectionTitle}>Recent Songs</Text>
							{songs.length > 0 && (
								<TouchableOpacity>
									<Text style={styles.seeAll}>See All</Text>
								</TouchableOpacity>
							)}
						</View>

						{songs.length === 0 ? (
							<View style={styles.emptyState}>
								<Music size={48} color="#D1D5DB" style={styles.emptyIcon} />
								<Text style={styles.emptyTitle}>No songs yet</Text>
								<Text style={styles.emptySubtitle}>
									Tap + to add your first song
								</Text>
							</View>
						) : (
							<View style={styles.recentList}>
								{songs.slice(0, 3).map((song) => (
									<View key={song.id} style={styles.recentItem}>
										<View style={styles.recentItemContent}>
											<Music size={18} color="#8B5CF6" />
											<View style={styles.recentItemText}>
												<Text style={styles.recentItemTitle}>{song.title}</Text>
												<Text style={styles.recentItemSubtitle}>
													{song.composer || "No composer"}
												</Text>
											</View>
										</View>
									</View>
								))}
							</View>
						)}
					</View>
				</ScrollView>

				{/* Quick Actions Modal */}
				<Modal
					visible={showQuickActions}
					transparent
					animationType="fade"
					onRequestClose={closeQuickActions}
				>
					<TouchableOpacity
						style={styles.modalOverlay}
						activeOpacity={1}
						onPress={closeQuickActions}
					>
						<View style={styles.modalContent}>
							<View style={styles.modalHeader}>
								<Text style={styles.modalTitle}>Quick Actions</Text>
								<TouchableOpacity onPress={closeQuickActions}>
									<X size={20} color="#6B7280" />
								</TouchableOpacity>
							</View>

							<TouchableOpacity
								style={styles.modalOption}
								onPress={handleAddSong}
							>
								<View
									style={[
										styles.modalOptionIcon,
										{ backgroundColor: "#8B5CF6" },
									]}
								>
									<Music size={20} color="#FFFFFF" />
								</View>
								<Text style={styles.modalOptionText}>Add New Song</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.modalOption}
								onPress={handleAddMember}
							>
								<View
									style={[
										styles.modalOptionIcon,
										{ backgroundColor: "#F43F5E" },
									]}
								>
									<User size={20} color="#FFFFFF" />
								</View>
								<Text style={styles.modalOptionText}>Add New Member</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={styles.modalOption}
								onPress={handleAddCategory}
							>
								<View
									style={[
										styles.modalOptionIcon,
										{ backgroundColor: "#06B6D4" },
									]}
								>
									<FolderOpen size={20} color="#FFFFFF" />
								</View>
								<Text style={styles.modalOptionText}>Create Category</Text>
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				</Modal>

				{/* Modals */}
				<AddSongModal
					visible={showAddSongModal}
					onClose={() => setShowAddSongModal(false)}
					onSave={handleSaveSong}
					categories={categories}
					onCreateCategory={() => setShowCreateCategoryModal(true)}
				/>

				<AddMemberModal
					visible={showAddMemberModal}
					onClose={() => setShowAddMemberModal(false)}
					onSave={handleSaveMember}
				/>

				<CreateCategoryModal
					visible={showCreateCategoryModal}
					onClose={() => setShowCreateCategoryModal(false)}
					onSave={handleCreateCategory}
				/>
			</SafeAreaView>
		</GradientBackground>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 100,
	},
	heroSection: {
		marginTop: 8,
	},
	statsSection: {
		marginTop: 16,
	},
	statsScrollContent: {
		paddingHorizontal: 10,
	},
	quickActionsSection: {
		marginTop: 24,
		paddingHorizontal: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#374151",
		marginBottom: 12,
	},
	quickActionsGrid: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	quickActionCard: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 16,
		marginHorizontal: 4,
		alignItems: "center",
		elevation: 2,
		shadowOpacity: 0.08,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
	},
	quickActionIcon: {
		width: 44,
		height: 44,
		borderRadius: 22,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 8,
	},
	quickActionText: {
		fontSize: 12,
		fontWeight: "500",
		color: "#374151",
		textAlign: "center",
	},
	recentSection: {
		marginTop: 24,
		paddingHorizontal: 16,
		marginBottom: 32,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	seeAll: {
		fontSize: 14,
		color: "#8B5CF6",
		fontWeight: "500",
	},
	emptyState: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 32,
		alignItems: "center",
		elevation: 2,
		shadowOpacity: 0.08,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
	},
	emptyIcon: {
		marginBottom: 12,
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#6B7280",
		marginBottom: 4,
	},
	emptySubtitle: {
		fontSize: 14,
		color: "#9CA3AF",
	},
	recentList: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		overflow: "hidden",
		elevation: 2,
		shadowOpacity: 0.08,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
	},
	recentItem: {
		padding: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#F3F4F6",
	},
	recentItemContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	recentItemText: {
		marginLeft: 12,
		flex: 1,
	},
	recentItemTitle: {
		fontSize: 15,
		fontWeight: "600",
		color: "#374151",
	},
	recentItemSubtitle: {
		fontSize: 13,
		color: "#6B7280",
		marginTop: 2,
	},
	// Modal styles
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	modalContent: {
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		padding: 20,
		width: "100%",
		maxWidth: 320,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 20,
		paddingBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#F3F4F6",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#374151",
	},
	modalOption: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 14,
		paddingHorizontal: 12,
		borderRadius: 12,
		marginBottom: 8,
		backgroundColor: "#F9FAFB",
	},
	modalOptionIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 14,
	},
	modalOptionText: {
		fontSize: 16,
		fontWeight: "500",
		color: "#374151",
		flex: 1,
	},
});
