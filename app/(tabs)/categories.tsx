import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FolderOpen } from "lucide-react-native";
import GradientBackground from "../../components/GradientBackground";
import SearchBar from "../../components/SearchBar";
import FloatingActionButton from "../../components/FloatingActionButton";
import CreateCategoryModal from "../../components/CreateCategoryModal";
import CategoryDetailScreen from "../../components/CategoryDetailScreen";

const defaultCategories = [
	{ id: "1", name: "C Major", color: "#8B5CF6", songCount: 0 },
	{ id: "2", name: "D Major", color: "#06B6D4", songCount: 0 },
	{ id: "3", name: "A Minor", color: "#F43F5E", songCount: 0 },
	{ id: "4", name: "Bati", color: "#F97316", songCount: 0 },
	{ id: "5", name: "Ambasel", color: "#10B981", songCount: 0 },
	{ id: "6", name: "Anchi Hoye", color: "#3B82F6", songCount: 0 },
];

export default function CategoriesScreen() {
	const [searchText, setSearchText] = useState("");
	const [categories, setCategories] = useState(defaultCategories);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<any>(null);

	const handleAddCategory = () => {
		setShowCreateModal(true);
	};

	const handleSaveCategory = (newCategory: any) => {
		setCategories((prev) => [...prev, newCategory]);
	};

	const handleCategoryPress = (category: any) => {
		setSelectedCategory(category);
	};

	const filteredCategories = categories.filter((category) =>
		category.name.toLowerCase().includes(searchText.toLowerCase())
	);

	if (selectedCategory) {
		return (
			<CategoryDetailScreen
				category={selectedCategory}
				songs={[]} // TODO: Load songs for this category
				onBack={() => setSelectedCategory(null)}
				onAddSong={() => console.log("Add song to category")}
				onSongPress={(song) => console.log("Song pressed:", song)}
				onToggleFavorite={(songId) => console.log("Toggle favorite:", songId)}
			/>
		);
	}

	return (
		<GradientBackground>
			<SafeAreaView style={styles.container}>
				<FloatingActionButton onPress={handleAddCategory} />

				<ScrollView showsVerticalScrollIndicator={false}>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.title}>Categories</Text>
						<Text style={styles.subtitle}>{categories.length} categories</Text>
					</View>

					{/* Search Bar */}
					<SearchBar
						placeholder="Search categories..."
						value={searchText}
						onChangeText={setSearchText}
					/>

					{/* Categories List */}
					{filteredCategories.length > 0 ? (
						<View style={styles.categoriesContainer}>
							{filteredCategories.map((category) => (
								<TouchableOpacity
									key={category.id}
									style={styles.categoryCard}
									onPress={() => handleCategoryPress(category)}
								>
									<View style={styles.categoryContent}>
										<View
											style={[
												styles.categoryIcon,
												{ backgroundColor: category.color },
											]}
										>
											<FolderOpen size={20} color="#FFFFFF" />
										</View>
										<View style={styles.categoryInfo}>
											<Text style={styles.categoryName}>{category.name}</Text>
											<Text style={styles.categorySongs}>
												{category.songCount} songs
											</Text>
										</View>
									</View>
								</TouchableOpacity>
							))}
						</View>
					) : (
						<View style={styles.emptyContainer}>
							<FolderOpen size={64} color="#D1D5DB" style={styles.emptyIcon} />
							<Text style={styles.emptyTitle}>No categories found</Text>
							<TouchableOpacity onPress={handleAddCategory}>
								<Text style={styles.emptyAction}>
									Create your first category
								</Text>
							</TouchableOpacity>
						</View>
					)}
				</ScrollView>

				<CreateCategoryModal
					visible={showCreateModal}
					onClose={() => setShowCreateModal(false)}
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
	categoriesContainer: {
		paddingHorizontal: 16,
	},
	categoryCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		marginBottom: 12,
		elevation: 2,
		shadowOpacity: 0.1,
		shadowRadius: 4,
		shadowOffset: { width: 0, height: 2 },
	},
	categoryContent: {
		flexDirection: "row",
		alignItems: "center",
		padding: 20,
	},
	categoryIcon: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	categoryInfo: {
		flex: 1,
	},
	categoryName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#374151",
		marginBottom: 4,
	},
	categorySongs: {
		fontSize: 14,
		color: "#6B7280",
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
});
