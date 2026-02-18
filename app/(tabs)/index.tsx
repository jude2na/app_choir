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
import { useRouter } from "expo-router";
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
	loadCategories,
} from "../../utils/storage";
import { useEventBus } from "../../components/EventBus";

const { width: SCREEN_WIDTH } = Dimensions.get("window");


export default function HomeScreen() {
	const router = useRouter();
	const [searchText, setSearchText] = useState("");
	const [songs, setSongs] = useState<Song[]>([]);
	const [members, setMembers] = useState<Member[]>([]);
	const [categories, setCategories] = useState<any[]>([]);
	const [showAddSongModal, setShowAddSongModal] = useState(false);
	const [showAddMemberModal, setShowAddMemberModal] = useState(false);
	const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
	const [showQuickActions, setShowQuickActions] = useState(false);
	const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');
	const insets = useSafeAreaInsets();

	// get event bus from provider
	const eventBus = useEventBus();

	useEffect(() => {
		loadData();
		(async () => {
			const cats = await loadCategories();
			setCategories(cats);
		})();
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
		// refresh categories to reflect updated counts
		await recomputeCategoryCounts();
		const updatedCategories = await loadCategories();
		setCategories(updatedCategories);
	};

	const handleSaveMember = async (member: Member) => {
		const updatedMembers = [...members, member];
		setMembers(updatedMembers);
		await saveMembers(updatedMembers);
		// notify other screens
		eventBus?.emit("members:added", member);
	};

	const handleCreateCategory = async (category: any) => {
		await addCategory(category);
		const updatedCategories = await loadCategories();
		setCategories(updatedCategories);
		setShowCreateCategoryModal(false);
	};

	const handleFloatingAction = () => {
		setShowQuickActions(true);
	};

	const closeQuickActions = () => {
		setShowQuickActions(false);
	};

	// refresh categories when songs are added anywhere in the app
	useEffect(() => {
		const unsub = eventBus.on("songs:added", async () => {
			await recomputeCategoryCounts();
			const updatedCategories = await loadCategories();
			setCategories(updatedCategories);
		});
		return unsub;
	}, [eventBus]);

	// Helper: sorted songs based on selected sort option
	const getSortedSongs = () => {
		const copy = [...songs];
		if (sortBy === 'alphabetical') {
			copy.sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
		} else {
			copy.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
		}
		return copy;
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

					{/* Sort Controls */}
				<View style={{ marginTop: 12, paddingHorizontal: 16, flexDirection: 'row', gap: 12 }}>
					<TouchableOpacity onPress={() => setSortBy('recent')} style={{ backgroundColor: sortBy === 'recent' ? '#6C5CE7' : '#1A1F2B', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#202533' }}>
						<Text style={{ color: '#EAEAF0', fontWeight: '600' }}>Recent</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => setSortBy('alphabetical')} style={{ backgroundColor: sortBy === 'alphabetical' ? '#6C5CE7' : '#1A1F2B', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#202533' }}>
						<Text style={{ color: '#EAEAF0', fontWeight: '600' }}>A–Z</Text>
					</TouchableOpacity>
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
							{getSortedSongs().slice(0, 3).map((song) => (
							<TouchableOpacity key={song.id} style={styles.recentItem} onPress={() => router.push(`/song/${song.id}`)}>
							<View style={styles.recentItemContent}>
							<Music size={18} color="#8B5CF6" />
							<View style={styles.recentItemText}>
							<Text style={styles.recentItemTitle}>{song.title}</Text>
							<Text style={styles.recentItemSubtitle}>
							{typeof (song as any)?.composer === 'string' && (song as any).composer.trim().length > 0 ? (song as any).composer : 'Unknown Composer'}
							</Text>
							</View>
							</View>
							</TouchableOpacity>
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
