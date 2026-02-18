import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Music, Search, Heart, Play } from "lucide-react-native";
import GradientBackground from "./GradientBackground";
import SearchBar from "./SearchBar";
import FloatingActionButton from "./FloatingActionButton";
import { loadSongs } from "../utils/storage";
import { useRouter } from "expo-router";
import SongCard from "./SongCard";

interface Song {
	id: string;
	title: string;
	composer?: string;
	lyrics: string;
	isFavorite: boolean;
	dateAdded: string;
}

interface CategoryDetailScreenProps {
	category: {
		id: string;
		name: string;
		color: string;
		songCount: number;
	};
	songs: Song[];
	onBack: () => void;
	onAddSong: () => void;
	onSongPress: (song: Song) => void;
	onToggleFavorite: (songId: string) => void;
}

export default function CategoryDetailScreen({
	category,
	songs,
	onBack,
	onAddSong,
	onSongPress,
	onToggleFavorite,
}: CategoryDetailScreenProps) {
	const [searchText, setSearchText] = useState("");
	const [categorySongs, setCategorySongs] = useState<Song[]>(songs || []);
	const router = useRouter();

	useEffect(() => {
		(async () => {
			const all = await loadSongs();
			const filtered = all.filter((s) => 
				s.category === category.id || 
				s.category === category.name ||
				(typeof s.category === 'string' && s.category.toLowerCase() === category.name.toLowerCase())
			);
			setCategorySongs(filtered as any);
		})();
	}, [category?.id, category?.name]);

	const filteredSongs = categorySongs.filter(
		(song) =>
			song.title.toLowerCase().includes(searchText.toLowerCase()) ||
			(song.composer &&
				song.composer.toLowerCase().includes(searchText.toLowerCase()))
	);

	return (
		<GradientBackground>
			<SafeAreaView style={styles.container}>
				<FloatingActionButton onPress={onAddSong} />

				{/* Header */}
				<View style={styles.header}>
					<TouchableOpacity onPress={onBack} style={styles.backButton}>
						<ArrowLeft size={24} color="#374151" />
					</TouchableOpacity>
					<View style={styles.headerContent}>
						<View
							style={[
								styles.categoryColorIndicator,
								{ backgroundColor: category.color },
							]}
						/>
						<View style={styles.headerText}>
							<Text style={styles.categoryName}>{category.name}</Text>
							<Text style={styles.songCount}>{categorySongs.length} songs</Text>
						</View>
					</View>
				</View>

				{/* Search Bar */}
				<SearchBar
					placeholder="Search songs in this category..."
					value={searchText}
					onChangeText={setSearchText}
				/>

				{/* Songs List */}
				{filteredSongs.length > 0 ? (
					<ScrollView 
						contentContainerStyle={styles.songsList}
						showsVerticalScrollIndicator={false}
					>
						{filteredSongs.map((song) => {
							const normalizedSong = {
								...song,
								composer: typeof song?.composer === "string" ? song.composer : "",
								categories: [category.name],
							};
							return (
								<SongCard
									key={song.id}
									song={normalizedSong}
									onPress={() => router.push(`/song/${song.id}`)}
								/>
							);
						})}
					</ScrollView>
				) : (
					<View style={styles.emptyContainer}>
						<Music size={64} color="#D1D5DB" style={styles.emptyIcon} />
						<Text style={styles.emptyTitle}>
							{searchText ? "No songs found" : "No songs in this category yet"}
						</Text>
						{!searchText && (
							<TouchableOpacity onPress={onAddSong}>
								<Text style={styles.emptyAction}>Add your first song</Text>
							</TouchableOpacity>
						)}
					</View>
				)}
			</SafeAreaView>
		</GradientBackground>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	backButton: {
		padding: 8,
		marginRight: 8,
	},
	headerContent: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	categoryColorIndicator: {
		width: 24,
		height: 24,
		borderRadius: 12,
		marginRight: 12,
	},
	headerText: {
		flex: 1,
	},
	categoryName: {
		fontSize: 20,
		fontWeight: "600",
		color: "#374151",
	},
	songCount: {
		fontSize: 14,
		color: "#6B7280",
		marginTop: 2,
	},
	songsList: {
		paddingHorizontal: 16,
		paddingBottom: 100,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
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
});
