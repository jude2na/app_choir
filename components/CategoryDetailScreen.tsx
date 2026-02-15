import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Music, Search, Heart, Play } from "lucide-react-native";
import GradientBackground from "./GradientBackground";
import SearchBar from "./SearchBar";
import FloatingActionButton from "./FloatingActionButton";

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

	const filteredSongs = songs.filter(
		(song) =>
			song.title.toLowerCase().includes(searchText.toLowerCase()) ||
			(song.composer &&
				song.composer.toLowerCase().includes(searchText.toLowerCase()))
	);

	const renderSongItem = ({ item }: { item: Song }) => (
		<TouchableOpacity style={styles.songCard} onPress={() => onSongPress(item)}>
			<View style={styles.songContent}>
				<View style={styles.songIcon}>
					<Music size={20} color={category.color} />
				</View>
				<View style={styles.songInfo}>
					<Text style={styles.songTitle}>{item.title}</Text>
					{item.composer && (
						<Text style={styles.songComposer}>by {item.composer}</Text>
					)}
					<Text style={styles.songDate}>
						Added {new Date(item.dateAdded).toLocaleDateString()}
					</Text>
				</View>
				<View style={styles.songActions}>
					<TouchableOpacity
						style={styles.favoriteButton}
						onPress={() => onToggleFavorite(item.id)}
					>
						<Heart
							size={20}
							color={item.isFavorite ? "#F43F5E" : "#9CA3AF"}
							fill={item.isFavorite ? "#F43F5E" : "none"}
						/>
					</TouchableOpacity>
					<TouchableOpacity style={styles.playButton}>
						<Play size={16} color="#FFFFFF" />
					</TouchableOpacity>
				</View>
			</View>
		</TouchableOpacity>
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
							<Text style={styles.songCount}>{songs.length} songs</Text>
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
					<FlatList
						data={filteredSongs}
						renderItem={renderSongItem}
						keyExtractor={(item) => item.id}
						contentContainerStyle={styles.songsList}
						showsVerticalScrollIndicator={false}
					/>
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
	songCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		marginBottom: 12,
		elevation: 2,
		shadowOpacity: 0.1,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
	},
	songContent: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
	},
	songIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#F3F4F6",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
	},
	songInfo: {
		flex: 1,
	},
	songTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#374151",
		marginBottom: 2,
	},
	songComposer: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 2,
	},
	songDate: {
		fontSize: 12,
		color: "#9CA3AF",
	},
	songActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	favoriteButton: {
		padding: 8,
	},
	playButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#8B5CF6",
		justifyContent: "center",
		alignItems: "center",
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
