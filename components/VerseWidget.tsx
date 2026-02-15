import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	useWindowDimensions,
} from "react-native";
import { BookOpen } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { theme, colorFromString } from "./theme";

const verses = [
	{
		text: "The Lord is my shepherd; I shall not want.",
		reference: "Psalm 23:1",
	},
	{
		text: "I can do all things through Christ who strengthens me.",
		reference: "Philippians 4:13",
	},
	{
		text: "Trust in the Lord with all your heart and lean not on your own understanding.",
		reference: "Proverbs 3:5",
	},
	{
		text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.",
		reference: "Jeremiah 29:11",
	},
	{
		text: "Be strong and courageous. Do not be afraid; do not be discouraged.",
		reference: "Joshua 1:9",
	},
];

export default function VerseWidget() {
	const { width } = useWindowDimensions();
	const cardWidth = Math.min(width - 48, 520);
	const scrollRef = useRef<ScrollView | null>(null);
	const [index, setIndex] = useState(
		() => new Date().getDate() % verses.length,
	);

	// auto-advance every 5s
	useEffect(() => {
		const id = setInterval(() => {
			setIndex((i) => {
				const next = (i + 1) % verses.length;
				if (scrollRef.current) {
					scrollRef.current.scrollTo({
						x: next * (cardWidth + 16),
						animated: true,
					});
				}
				return next;
			});
		}, 5000);
		return () => clearInterval(id);
	}, [cardWidth]);

	// ensure initial scroll position is correct after mount
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTo({
				x: index * (cardWidth + 16),
				animated: false,
			});
		}
	}, [cardWidth]);

	return (
		<View style={styles.wrapper}>
			<View style={styles.header}>
				<BookOpen size={20} color={theme.colors.primary} />
				<Text style={styles.headerText}>Daily Verse</Text>
			</View>

			<ScrollView
				horizontal
				ref={scrollRef}
				pagingEnabled={false}
				snapToInterval={cardWidth + 16}
				decelerationRate="fast"
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ paddingHorizontal: 16 }}
			>
				{verses.map((v, i) => (
					<LinearGradient
						key={i}
						colors={[colorFromString(v.reference), theme.colors.surfaceAlt]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={[styles.container, { width: cardWidth, marginRight: 16 }]}
					>
						<Text style={styles.verseText}>{v.text}</Text>
						<Text style={styles.reference}>— {v.reference}</Text>
					</LinearGradient>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		marginVertical: 12,
	},
	container: {
		borderRadius: 16,
		padding: 20,
		// no outer margin here; ScrollView handles spacing
		elevation: 3,
		shadowOpacity: 0.18,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
		paddingHorizontal: 16,
	},
	headerText: {
		fontSize: 16,
		fontWeight: "700",
		color: theme.colors.text,
		marginLeft: 8,
	},
	verseText: {
		fontSize: 16,
		color: theme.colors.text,
		lineHeight: 24,
		fontStyle: "italic",
		marginBottom: 8,
	},
	reference: {
		fontSize: 14,
		color: theme.colors.accent,
		fontWeight: "700",
		textAlign: "right",
	},
});
