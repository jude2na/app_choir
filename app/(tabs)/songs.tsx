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
import { Clock, ArrowUpDown } from "lucide-react-native";
import GradientBackground from "../../components/GradientBackground";
import SearchBar from "../../components/SearchBar";
import FloatingActionButton from "../../components/FloatingActionButton";
import AddSongModal from "../../components/AddSongModal";
import CreateCategoryModal from "../../components/CreateCategoryModal";
import { loadSongs, saveSongs } from "../../utils/storage";

export default function SongsScreen() {
	const [searchText, setSearchText] = useState("");
	const [sortBy, setSortBy] = useState("recent");
	const [showAddSongModal, setShowAddSongModal] = useState(false);
	const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
	const [songs, setSongs] = useState<any[]>([]);
	const [categories, setCategories] = useState([
		{ id: "1", name: "C Major", color: "#8B5CF6" },
		{ id: "2", name: "D Major", color: "#06B6D4" },
		{ id: "3", name: "A Minor", color: "#F43F5E" },
		{ id: "4", name: "Bati", color: "#F97316" },
		{ id: "5", name: "Ambasel", color: "#10B981" },
		{ id: "6", name: "Anchi Hoye", color: "#3B82F6" },
	]);
	const [refreshing, setRefreshing] = useState(false);
	const eventBus = useEventBus();

	useEffect(() => {
		loadData();
	}, []);

	// reload when screen is focused so newly added songs (from other screens) appear
	const isFocused = useIsFocused();
	useEffect(() => {
		if (isFocused) loadData();
	}, [isFocused]);

	const loadData = async () => {
		setRefreshing(true);
		const loadedSongs = await loadSongs();
		setSongs(loadedSongs);
		setRefreshing(false);
	};

	// subscribe to song events
	useEffect(() => {
		const unsub = eventBus.on("songs:added", (song) => {
			if (!song) return;
			setSongs((prev) => [song, ...prev]);
		});
		return unsub;
	}, [eventBus]);

	const handleAddSong = () => {
		setShowAddSongModal(true);
	};

	const handleSaveSong = async (newSong: any) => {
		const updatedSongs = [...songs, newSong];
		setSongs(updatedSongs);
		await saveSongs(updatedSongs);
	};

	const handleCreateCategory = () => {
		setShowAddSongModal(false);
		setShowCreateCategoryModal(true);
	};

	const handleSaveCategory = (newCategory: any) => {
		setCategories((prev) => [...prev, newCategory]);
		setShowCreateCategoryModal(false);
		setShowAddSongModal(true);
	};

	const toggleSort = () => {
		setSortBy(sortBy === "recent" ? "alphabetical" : "recent");
	};

	return (
		<GradientBackground>
			<SafeAreaView style={styles.container}>
				<FloatingActionButton onPress={handleAddSong} />

				<ScrollView
					showsVerticalScrollIndicator={false}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={loadData} />
					}
				>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.title}>Song Library</Text>
						<Text style={styles.subtitle}>{songs.length} songs</Text>
					</View>

					{/* Search Bar */}
					<SearchBar
						placeholder="Search songs..."
						value={searchText}
						onChangeText={setSearchText}
					/>

					{/* Filter Buttons */}
					<View style={styles.filterContainer}>
						<TouchableOpacity
							style={[
								styles.filterButton,
								sortBy === "recent" && styles.filterButtonActive,
							]}
							onPress={() => setSortBy("recent")}
						>
							<Clock
								size={16}
								color={sortBy === "recent" ? "#FFFFFF" : "#6B7280"}
							/>
							<Text
								style={[
									styles.filterText,
									sortBy === "recent" && styles.filterTextActive,
								]}
							>
								Recent
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.filterButton,
								sortBy === "alphabetical" && styles.filterButtonActive,
							]}
							onPress={() => setSortBy("alphabetical")}
						>
							<ArrowUpDown
								size={16}
								color={sortBy === "alphabetical" ? "#FFFFFF" : "#6B7280"}
							/>
							<Text
								style={[
									styles.filterText,
									sortBy === "alphabetical" && styles.filterTextActive,
								]}
							>
								A-Z
							</Text>
						</TouchableOpacity>
					</View>

					{/* Songs list / empty state */}
					{(() => {
						const filtered = songs.filter((s) =>
							s.title.toLowerCase().includes(searchText.toLowerCase())
						);
						if (filtered.length === 0) {
							return (
								<View style={styles.emptyContainer}>
									<Text style={styles.emptyTitle}>No songs found</Text>
								</View>
							);
						}

						return (
							<View style={styles.listContainer}>
								{filtered.map((s) => (
									<View key={s.id} style={styles.songItem}>
										<Text style={styles.songTitle}>{s.title}</Text>
										<Text style={styles.songMeta}>{s.category}</Text>
									</View>
								))}
							</View>
						);
					})()}
				</ScrollView>

				<AddSongModal
					visible={showAddSongModal}
					onClose={() => setShowAddSongModal(false)}
					onSave={handleSaveSong}
					categories={categories}
					onCreateCategory={handleCreateCategory}
				/>

				<CreateCategoryModal
					visible={showCreateCategoryModal}
					onClose={() => {
						setShowCreateCategoryModal(false);
						setShowAddSongModal(true);
					}}
					onSave={handleSaveCategory}
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
		color: "#374151",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 16,
		color: "#6B7280",
	},
	filterContainer: {
		flexDirection: "row",
		paddingHorizontal: 16,
		marginBottom: 20,
		gap: 12,
	},
	filterButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F1F5F9",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		gap: 6,
	},
	filterButtonActive: {
		backgroundColor: "#374151",
	},
	filterText: {
		fontSize: 14,
		color: "#6B7280",
		fontWeight: "500",
	},
	filterTextActive: {
		color: "#FFFFFF",
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingTop: 120,
	},
	emptyTitle: {
		fontSize: 18,
		color: "#9CA3AF",
		textAlign: "center",
	},
	listContainer: {
		paddingHorizontal: 16,
		paddingBottom: 24,
	},
	songItem: {
		backgroundColor: "#FFFFFF",
		padding: 12,
		borderRadius: 12,
		marginBottom: 12,
		elevation: 1,
		shadowOpacity: 0.06,
		shadowRadius: 2,
		shadowOffset: { width: 0, height: 1 },
	},
	songTitle: {
		fontSize: 16,
		color: "#374151",
		fontWeight: "600",
	},
	songMeta: {
		fontSize: 14,
		color: "#6B7280",
		marginTop: 4,
	},
});
