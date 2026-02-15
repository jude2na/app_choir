import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Song {
  id: string;
  title: string;
  lyrics: string;
  category: string;
  dateAdded: string;
  isFavorite: boolean;
}

export interface Member {
  id: string;
  name: string;
  voicePart: 'Soprano' | 'Alto' | 'Tenor' | 'Bass';
  email?: string;
  phone?: string;
  dateAdded: string;
}

export interface Choir {
  id: string;
  name: string;
  type: 'A' | 'B' | 'C';
  members: string[]; // member IDs
  dateCreated: string;
}

export interface AppSettings {
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  backgroundColor: string;
  isDarkMode: boolean;
  verseRotationFrequency: 'daily' | 'weekly' | 'onAppOpen';
}

const DB_NAME = 'choir_app.db';

// Database reference - will be initialized when needed
let db: any = null;

// Dynamically import SQLite for native platforms
const getDatabase = async () => {
  if (Platform.OS === 'web') {
    throw new Error('SQLite is not available on web platform');
  }

  if (!db) {
    try {
      const SQLite = await import('expo-sqlite');
      db = await SQLite.openDatabaseAsync(DB_NAME);
    } catch (error) {
      console.error('Error opening database:', error);
      throw error;
    }
  }
  return db;
};

// Database initialization
const initializeDatabase = async (): Promise<void> => {
  if (Platform.OS === 'web') return;

  try {
    const database = await getDatabase();

    // Create tables
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        lyrics TEXT NOT NULL,
        category TEXT NOT NULL,
        dateAdded TEXT NOT NULL,
        isFavorite INTEGER NOT NULL DEFAULT 0
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        voicePart TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        dateAdded TEXT NOT NULL
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS choirs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        members TEXT NOT NULL,
        dateCreated TEXT NOT NULL
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        fontSize INTEGER NOT NULL DEFAULT 16,
        fontFamily TEXT NOT NULL DEFAULT 'System',
        fontColor TEXT NOT NULL DEFAULT '#374151',
        backgroundColor TEXT NOT NULL DEFAULT '#FFFFFF',
        isDarkMode INTEGER NOT NULL DEFAULT 0,
        verseRotationFrequency TEXT NOT NULL DEFAULT 'daily'
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS verse_rotation (
        id INTEGER PRIMARY KEY DEFAULT 1,
        lastVerseDate TEXT
      );
    `);

    // Check if migration is needed
    await migrateFromAsyncStorage();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Migrate data from AsyncStorage to SQLite
const migrateFromAsyncStorage = async (): Promise<void> => {
  try {
    // Check if migration already done
    const migrated = await AsyncStorage.getItem('choir_app_migrated');
    if (migrated) return;

    console.log('Migrating data from AsyncStorage to SQLite...');

    // Migrate songs
    const songsData = await AsyncStorage.getItem('choir_app_songs');
    if (songsData) {
      const songs: Song[] = JSON.parse(songsData);
      await saveSongs(songs);
    }

    // Migrate members
    const membersData = await AsyncStorage.getItem('choir_app_members');
    if (membersData) {
      const members: Member[] = JSON.parse(membersData);
      await saveMembers(members);
    }

    // Migrate choirs
    const choirsData = await AsyncStorage.getItem('choir_app_choirs');
    if (choirsData) {
      const choirs: Choir[] = JSON.parse(choirsData);
      await saveChoirs(choirs);
    }

    // Migrate settings
    const settingsData = await AsyncStorage.getItem('choir_app_settings');
    if (settingsData) {
      const settings: AppSettings = JSON.parse(settingsData);
      await saveSettings(settings);
    }

    // Migrate verse rotation date
    const verseDate = await AsyncStorage.getItem('choir_app_last_verse_date');
    if (verseDate) {
      await updateLastVerseDate();
    }

    // Mark migration as complete
    await AsyncStorage.setItem('choir_app_migrated', 'true');
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
};

// Ensure database is initialized
let dbInitialized = false;
const ensureDbInitialized = async (): Promise<void> => {
  if (!dbInitialized && Platform.OS !== 'web') {
    await initializeDatabase();
    dbInitialized = true;
  }
};

// Songs
export const saveSongs = async (songs: Song[]): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('choir_app_songs', JSON.stringify(songs));
    return;
  }

  await ensureDbInitialized();
  try {
    const database = await getDatabase();

    // Start a transaction
    await database.execAsync('BEGIN TRANSACTION;');

    // Clear existing songs
    await database.execAsync('DELETE FROM songs;');

    // Insert all songs
    for (const song of songs) {
      await database.runAsync(
        'INSERT INTO songs (id, title, lyrics, category, dateAdded, isFavorite) VALUES (?, ?, ?, ?, ?, ?);',
        [song.id, song.title, song.lyrics, song.category, song.dateAdded, song.isFavorite ? 1 : 0]
      );
    }

    await database.execAsync('COMMIT;');
  } catch (error) {
    console.error('Error saving songs:', error);
    throw error;
  }
};

export const loadSongs = async (): Promise<Song[]> => {
  if (Platform.OS === 'web') {
    const songsData = await AsyncStorage.getItem('choir_app_songs');
    return songsData ? JSON.parse(songsData) : [];
  }

  await ensureDbInitialized();
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT * FROM songs ORDER BY dateAdded DESC;');

    return result.map((item: any) => ({
      id: item.id,
      title: item.title,
      lyrics: item.lyrics,
      category: item.category,
      dateAdded: item.dateAdded,
      isFavorite: item.isFavorite === 1,
    }));
  } catch (error) {
    console.error('Error loading songs:', error);
    return [];
  }
};

// Add individual song operations
export const addSong = async (song: Song): Promise<void> => {
  const songs = await loadSongs();
  songs.unshift(song); // Add to beginning
  await saveSongs(songs);
};

export const updateSong = async (id: string, updates: Partial<Song>): Promise<void> => {
  const songs = await loadSongs();
  const index = songs.findIndex(song => song.id === id);
  if (index !== -1) {
    songs[index] = { ...songs[index], ...updates };
    await saveSongs(songs);
  }
};

export const deleteSong = async (id: string): Promise<void> => {
  const songs = await loadSongs();
  const filteredSongs = songs.filter(song => song.id !== id);
  await saveSongs(filteredSongs);
};

// Members
export const saveMembers = async (members: Member[]): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('choir_app_members', JSON.stringify(members));
    return;
  }

  await ensureDbInitialized();
  try {
    const database = await getDatabase();

    await database.execAsync('BEGIN TRANSACTION;');
    await database.execAsync('DELETE FROM members;');

    for (const member of members) {
      await database.runAsync(
        'INSERT INTO members (id, name, voicePart, email, phone, dateAdded) VALUES (?, ?, ?, ?, ?, ?);',
        [member.id, member.name, member.voicePart, member.email || null, member.phone || null, member.dateAdded]
      );
    }

    await database.execAsync('COMMIT;');
  } catch (error) {
    console.error('Error saving members:', error);
    throw error;
  }
};

export const loadMembers = async (): Promise<Member[]> => {
  if (Platform.OS === 'web') {
    const membersData = await AsyncStorage.getItem('choir_app_members');
    return membersData ? JSON.parse(membersData) : [];
  }

  await ensureDbInitialized();
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT * FROM members ORDER BY dateAdded DESC;');

    return result.map((item: any) => ({
      id: item.id,
      name: item.name,
      voicePart: item.voicePart as 'Soprano' | 'Alto' | 'Tenor' | 'Bass',
      email: item.email,
      phone: item.phone,
      dateAdded: item.dateAdded,
    }));
  } catch (error) {
    console.error('Error loading members:', error);
    return [];
  }
};

// Add individual member operations
export const addMember = async (member: Member): Promise<void> => {
  const members = await loadMembers();
  members.unshift(member);
  await saveMembers(members);
};

export const updateMember = async (id: string, updates: Partial<Member>): Promise<void> => {
  const members = await loadMembers();
  const index = members.findIndex(member => member.id === id);
  if (index !== -1) {
    members[index] = { ...members[index], ...updates };
    await saveMembers(members);
  }
};

export const deleteMember = async (id: string): Promise<void> => {
  const members = await loadMembers();
  const filteredMembers = members.filter(member => member.id !== id);
  await saveMembers(filteredMembers);
};

// Choirs
export const saveChoirs = async (choirs: Choir[]): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('choir_app_choirs', JSON.stringify(choirs));
    return;
  }

  await ensureDbInitialized();
  try {
    const database = await getDatabase();

    await database.execAsync('BEGIN TRANSACTION;');
    await database.execAsync('DELETE FROM choirs;');

    for (const choir of choirs) {
      await database.runAsync(
        'INSERT INTO choirs (id, name, type, members, dateCreated) VALUES (?, ?, ?, ?, ?);',
        [choir.id, choir.name, choir.type, JSON.stringify(choir.members), choir.dateCreated]
      );
    }

    await database.execAsync('COMMIT;');
  } catch (error) {
    console.error('Error saving choirs:', error);
    throw error;
  }
};

export const loadChoirs = async (): Promise<Choir[]> => {
  if (Platform.OS === 'web') {
    const choirsData = await AsyncStorage.getItem('choir_app_choirs');
    return choirsData ? JSON.parse(choirsData) : [];
  }

  await ensureDbInitialized();
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT * FROM choirs ORDER BY dateCreated DESC;');

    return result.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type as 'A' | 'B' | 'C',
      members: JSON.parse(item.members),
      dateCreated: item.dateCreated,
    }));
  } catch (error) {
    console.error('Error loading choirs:', error);
    return [];
  }
};

// Add individual choir operations
export const addChoir = async (choir: Choir): Promise<void> => {
  const choirs = await loadChoirs();
  choirs.unshift(choir);
  await saveChoirs(choirs);
};

export const updateChoir = async (id: string, updates: Partial<Choir>): Promise<void> => {
  const choirs = await loadChoirs();
  const index = choirs.findIndex(choir => choir.id === id);
  if (index !== -1) {
    choirs[index] = { ...choirs[index], ...updates };
    await saveChoirs(choirs);
  }
};

export const deleteChoir = async (id: string): Promise<void> => {
  const choirs = await loadChoirs();
  const filteredChoirs = choirs.filter(choir => choir.id !== id);
  await saveChoirs(filteredChoirs);
};

// Settings
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('choir_app_settings', JSON.stringify(settings));
    return;
  }

  await ensureDbInitialized();
  try {
    const database = await getDatabase();

    await database.runAsync(
      'INSERT OR REPLACE INTO settings (id, fontSize, fontFamily, fontColor, backgroundColor, isDarkMode, verseRotationFrequency) VALUES (1, ?, ?, ?, ?, ?, ?);',
      [
        settings.fontSize,
        settings.fontFamily,
        settings.fontColor,
        settings.backgroundColor,
        settings.isDarkMode ? 1 : 0,
        settings.verseRotationFrequency
      ]
    );
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

export const loadSettings = async (): Promise<AppSettings> => {
  if (Platform.OS === 'web') {
    const settingsData = await AsyncStorage.getItem('choir_app_settings');
    if (settingsData) {
      return JSON.parse(settingsData);
    }
  }

  await ensureDbInitialized();

  if (Platform.OS !== 'web') {
    try {
      const database = await getDatabase();
      const result = await database.getAllAsync('SELECT * FROM settings WHERE id = 1;');

      if (result.length > 0) {
        const item = result[0] as any;
        return {
          fontSize: item.fontSize,
          fontFamily: item.fontFamily,
          fontColor: item.fontColor,
          backgroundColor: item.backgroundColor,
          isDarkMode: item.isDarkMode === 1,
          verseRotationFrequency: item.verseRotationFrequency as 'daily' | 'weekly' | 'onAppOpen',
        };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  // Return default settings
  return {
    fontSize: 16,
    fontFamily: 'System',
    fontColor: '#374151',
    backgroundColor: '#FFFFFF',
    isDarkMode: false,
    verseRotationFrequency: 'daily',
  };
};

// Bible verse rotation
export const shouldRotateVerse = async (frequency: 'daily' | 'weekly' | 'onAppOpen'): Promise<boolean> => {
  if (Platform.OS === 'web') {
    const lastVerseDate = await AsyncStorage.getItem('choir_app_last_verse_date');
    if (!lastVerseDate) return true;

    const now = new Date();
    const last = new Date(lastVerseDate);

    switch (frequency) {
      case 'daily':
        return now.toDateString() !== last.toDateString();
      case 'weekly':
        const weekDiff = Math.floor((now.getTime() - last.getTime()) / (7 * 24 * 60 * 60 * 1000));
        return weekDiff >= 1;
      case 'onAppOpen':
        return true;
      default:
        return false;
    }
  }

  await ensureDbInitialized();
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT lastVerseDate FROM verse_rotation WHERE id = 1;') as { lastVerseDate?: string }[];

    if (result.length === 0 || !result[0].lastVerseDate) {
      return true;
    }

    const lastDate = result[0].lastVerseDate as string;
    const now = new Date();
    const last = new Date(lastDate);

    switch (frequency) {
      case 'daily':
        return now.toDateString() !== last.toDateString();
      case 'weekly':
        const weekDiff = Math.floor((now.getTime() - last.getTime()) / (7 * 24 * 60 * 60 * 1000));
        return weekDiff >= 1;
      case 'onAppOpen':
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking verse rotation:', error);
    return true;
  }
};

export const updateLastVerseDate = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('choir_app_last_verse_date', new Date().toISOString());
    return;
  }

  await ensureDbInitialized();
  try {
    const database = await getDatabase();
    await database.runAsync(
      'INSERT OR REPLACE INTO verse_rotation (id, lastVerseDate) VALUES (1, ?);',
      [new Date().toISOString()]
    );
  } catch (error) {
    console.error('Error updating last verse date:', error);
    throw error;
  }
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const exportData = async (): Promise<string> => {
  try {
    const [songs, members, choirs, settings] = await Promise.all([
      loadSongs(),
      loadMembers(),
      loadChoirs(),
      loadSettings(),
    ]);

    const exportData = {
      songs,
      members,
      choirs,
      settings,
      exportDate: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const importData = async (jsonData: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonData);

    const promises = [];
    if (data.songs) promises.push(saveSongs(data.songs));
    if (data.members) promises.push(saveMembers(data.members));
    if (data.choirs) promises.push(saveChoirs(data.choirs));
    if (data.settings) promises.push(saveSettings(data.settings));

    await Promise.all(promises);
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

// Initialize storage when imported (for web, use AsyncStorage immediately)
if (Platform.OS === 'web') {
  // For web, ensure we have default data in AsyncStorage
  const initializeWebStorage = async () => {
    try {
      const songs = await loadSongs();
      if (songs.length === 0) {
        // Add some sample data for web
        const sampleSongs: Song[] = [
          {
            id: generateId(),
            title: 'Amazing Grace',
            lyrics: 'Amazing grace, how sweet the sound...',
            category: 'Hymns',
            dateAdded: new Date().toISOString(),
            isFavorite: true,
          },
          {
            id: generateId(),
            title: 'How Great Thou Art',
            lyrics: 'O Lord my God, when I in awesome wonder...',
            category: 'Hymns',
            dateAdded: new Date().toISOString(),
            isFavorite: false,
          },
        ];
        await saveSongs(sampleSongs);
      }
    } catch (error) {
      console.error('Error initializing web storage:', error);
    }
  };

  // Initialize web storage (non-blocking)
  initializeWebStorage();
}