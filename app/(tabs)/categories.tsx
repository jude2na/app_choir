import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FolderOpen } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import GradientBackground from "../../components/GradientBackground";
import SearchBar from "../../components/SearchBar";
import FloatingActionButton from "../../components/FloatingActionButton";
import CreateCategoryModal from "../../components/CreateCategoryModal";
import CategoryDetailScreen from "../../components/CategoryDetailScreen";
import Card from "../../components/ui/Card";
import { theme, colorFromString } from "../../components/theme";
import { loadCategories, addCategory, Category } from "../../utils/storage";
import { useIsFocused } from "@react-navigation/native";
import { useEventBus } from "../../components/EventBus";

export default function CategoriesScreen() {
	const [searchText, setSearchText] = useState("");
	const [categories, setCategories] = useState<Category[]>([]);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState<any>(null);
	const isFocused = useIsFocused();
	const eventBus = useEventBus();

	useEffect(() => {
		(async () => {
			const loaded = await loadCategories();
			setCategories(loaded);
		})();
	}, []);

	// refresh on focus and when songs are added anywhere
	useEffect(() => {
		(async () => {
			const loaded = await loadCategories();
			setCategories(loaded);
		})();
	}, [isFocused]);

	useEffect(() => {
		const unsub = eventBus.on("songs:added", async () => {
			const loaded = await loadCategories();
			setCategories(loaded);
		});
		return unsub;
	}, [eventBus]);

	const handleAddCategory = () => {
		setShowCreateModal(true);
	};

	const handleSaveCategory = async (newCategory: any) => {
		await addCategory(newCategory as Category);
		const updatedCategories = await loadCategories();
		setCategories(updatedCategories);
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
				songs={[]}
				onBack={() => setSelectedCategory(null)}
				onAddSong={() => {
					setSelectedCategory(null);
					setShowCreateModal(true);
				}}
				onSongPress={(song) => {
					// Handle song press if needed
				}}
				onToggleFavorite={(songId) => {
					// Handle toggle favorite if needed
				}}
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
					{filteredCategories.map((category) => {
					const color = category.color || colorFromString(category.name);
					return (
					<LinearGradient
					key={category.id}
					colors={[color, theme.colors.surface]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={styles.gradientCard}
					>
					<Card
					title={category.name}
					subtitle={`${category.songCount} songs`}
					leading={
					<View style={[styles.categoryIcon, { backgroundColor: color }]}>
					<FolderOpen size={20} color="#FFFFFF" />
					</View>
					}
					onPress={() => handleCategoryPress(category)}
					style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.08)' }}
					/>
					</LinearGradient>
					);
					})}
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
	color: theme.colors.text,
	marginBottom: 4,
	},
	subtitle: {
	fontSize: 16,
	color: theme.colors.muted,
	},
	categoriesContainer: {
	paddingHorizontal: 16,
	paddingBottom: 120,
	},
	categoryCard: {
	backgroundColor: theme.colors.surface,
	borderRadius: 16,
	marginBottom: 12,
	borderWidth: 1,
	borderColor: theme.colors.border,
	...theme.shadow.md,
	},
	gradientCard: {
	borderRadius: 16,
	marginBottom: 12,
	padding: 1,
	...theme.shadow.md,
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
	color: theme.colors.text,
	marginBottom: 4,
	},
	categorySongs: {
	fontSize: 14,
	color: theme.colors.muted,
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
