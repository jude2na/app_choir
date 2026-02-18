import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Song {
  id: string;
  title: string;
  lyrics: string;
  category: string;
  composer?: string;
  dateAdded: string;
  isFavorite: boolean;
  audioFile?: {
    uri: string;
    name: string;
    size: number;
  } | null;
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

export interface Category {
  id: string;
  name: string;
  color: string;
  songCount: number;
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

// Database reference
let db: any = null;
let dbInitialized = false;

// Get database instance
const getDatabase = async () => {
  if (Platform.OS === 'web') {
    throw new Error('SQLite is not available on web platform');
  }

  if (!db) {
    try {
      const SQLite = await import('expo-sqlite');
      
      // Try new API first
      if (SQLite.openDatabaseAsync) {
        db = await SQLite.openDatabaseAsync(DB_NAME);
      } else if (SQLite.openDatabase) {
        // Fallback to legacy API
        const legacyDb = SQLite.openDatabase(DB_NAME);
        
        // Create wrapper for new API compatibility
        db = {
          execAsync: async (sql: string) => {
            return new Promise<void>((resolve, reject) => {
              legacyDb.transaction(
                (tx: any) => {
                  const statements = sql.split(';').filter(s => s.trim());
                  let index = 0;
                  
                  const executeNext = () => {
                    if (index >= statements.length) {
                      resolve();
                      return;
                    }
                    
                    const statement = statements[index++].trim();
                    if (statement) {
                      tx.executeSql(
                        statement,
                        [],
                        () => executeNext(),
                        (_: any, error: any) => {
                          reject(error);
                          return true;
                        }
                      );
                    } else {
                      executeNext();
                    }
                  };
                  
                  executeNext();
                },
                (error: any) => reject(error)
              );
            });
          },
          
          runAsync: async (sql: string, params: any[] = []) => {
            return new Promise<any>((resolve, reject) => {
              legacyDb.transaction(
                (tx: any) => {
                  tx.executeSql(
                    sql,
                    params,
                    (_: any, result: any) => resolve(result),
                    (_: any, error: any) => {
                      reject(error);
                      return true;
                    }
                  );
                },
                (error: any) => reject(error)
              );
            });
          },
          
          getAllAsync: async (sql: string, params: any[] = []) => {
            return new Promise<any[]>((resolve, reject) => {
              legacyDb.transaction(
                (tx: any) => {
                  tx.executeSql(
                    sql,
                    params,
                    (_: any, result: any) => {
                      const rows = [];
                      for (let i = 0; i < result.rows.length; i++) {
                        rows.push(result.rows.item(i));
                      }
                      resolve(rows);
                    },
                    (_: any, error: any) => {
                      reject(error);
                      return true;
                    }
                  );
                },
                (error: any) => reject(error)
              );
            });
          }
        };
      } else {
        throw new Error('No SQLite API available');
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
  
  return db;
};

// Initialize database
const initializeDatabase = async (): Promise<void> => {
  if (Platform.OS === 'web' || dbInitialized) return;

  try {
    const database = await getDatabase();

    // Create tables with proper schema
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS songs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        lyrics TEXT NOT NULL,
        category TEXT NOT NULL,
        composer TEXT,
        dateAdded TEXT NOT NULL,
        isFavorite INTEGER NOT NULL DEFAULT 0,
        audioUri TEXT,
        audioName TEXT,
        audioSize INTEGER
      );

      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        voicePart TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        dateAdded TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        songCount INTEGER NOT NULL DEFAULT 0,
        dateCreated TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS choirs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        members TEXT NOT NULL,
        dateCreated TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        fontSize INTEGER NOT NULL DEFAULT 16,
        fontFamily TEXT NOT NULL DEFAULT 'System',
        fontColor TEXT NOT NULL DEFAULT '#374151',
        backgroundColor TEXT NOT NULL DEFAULT '#FFFFFF',
        isDarkMode INTEGER NOT NULL DEFAULT 0,
        verseRotationFrequency TEXT NOT NULL DEFAULT 'daily'
      );

      CREATE TABLE IF NOT EXISTS verse_rotation (
        id INTEGER PRIMARY KEY DEFAULT 1,
        lastVerseDate TEXT
      );
    `);

    dbInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Ensure database is ready
const ensureDbReady = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  if (!dbInitialized) {
    await initializeDatabase();
  }
};

// Songs operations
export const saveSongs = async (songs: Song[]): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('choir_app_songs', JSON.stringify(songs));
    return;
  }

  await ensureDbReady();
  try {
    const database = await getDatabase();

    // Clear and insert all songs
    await database.runAsync('DELETE FROM songs');

    for (const song of songs) {
      await database.runAsync(
        `INSERT INTO songs (id, title, lyrics, category, composer, dateAdded, isFavorite, audioUri, audioName, audioSize) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          song.id,
          song.title,
          song.lyrics,
          song.category,
          song.composer || null,
          song.dateAdded,
          song.isFavorite ? 1 : 0,
          song.audioFile?.uri || null,
          song.audioFile?.name || null,
          song.audioFile?.size || null
        ]
      );
    }
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

  await ensureDbReady();
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT * FROM songs ORDER BY dateAdded DESC');

    return result.map((item: any) => ({
      id: item.id,
      title: item.title,
      lyrics: item.lyrics,
      category: item.category,
      composer: item.composer,
      dateAdded: item.dateAdded,
      isFavorite: item.isFavorite === 1,
      audioFile: item.audioUri ? {
        uri: item.audioUri,
        name: item.audioName || 'audio',
        size: item.audioSize || 0
      } : null,
    }));
  } catch (error) {
    console.error('Error loading songs:', error);
    return [];
  }
};

import { addCategory } from './storage';

export const addSong = async (song: Song): Promise<void> => {
  const songs = await loadSongs();
  songs.unshift(song);
  await saveSongs(songs);
  
  // Update category count
  await recomputeCategoryCounts();
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
  
  // Update category count
  await recomputeCategoryCounts();
};

// Members operations
export const saveMembers = async (members: Member[]): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('choir_app_members', JSON.stringify(members));
    return;
  }

  await ensureDbReady();
  try {
    const database = await getDatabase();

    await database.runAsync('DELETE FROM members');

    for (const member of members) {
      await database.runAsync(
        `INSERT INTO members (id, name, voicePart, email, phone, dateAdded) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          member.id,
          member.name,
          member.voicePart,
          member.email || null,
          member.phone || null,
          member.dateAdded
        ]
      );
    }
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

  await ensureDbReady();
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT * FROM members ORDER BY dateAdded DESC');

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

// Categories operations
export const saveCategories = async (categories: Category[]): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('choir_app_categories', JSON.stringify(categories));
    return;
  }

  await ensureDbReady();
  try {
    const database = await getDatabase();

    await database.runAsync('DELETE FROM categories');

    for (const category of categories) {
      await database.runAsync(
        `INSERT INTO categories (id, name, color, songCount, dateCreated) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          category.id,
          category.name,
          category.color,
          category.songCount,
          category.dateCreated
        ]
      );
    }
  } catch (error) {
    console.error('Error saving categories:', error);
    throw error;
  }
};

export const loadCategories = async (): Promise<Category[]> => {
  if (Platform.OS === 'web') {
    const data = await AsyncStorage.getItem('choir_app_categories');
    return data ? JSON.parse(data) : [];
  }

  await ensureDbReady();
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT * FROM categories ORDER BY name ASC');

    return result.map((item: any) => ({
      id: item.id,
      name: item.name,
      color: item.color,
      songCount: item.songCount || 0,
      dateCreated: item.dateCreated,
    }));
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
};

export const addCategory = async (category: Category): Promise<void> => {
  const categories = await loadCategories();
  categories.push(category);
  await saveCategories(categories);
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
  const categories = await loadCategories();
  const index = categories.findIndex(c => c.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updates };
    await saveCategories(categories);
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  const categories = await loadCategories();
  const filtered = categories.filter(c => c.id !== id);
  await saveCategories(filtered);
};

// Recompute category counts
export const recomputeCategoryCounts = async (): Promise<void> => {
  try {
    const [categories, songs] = await Promise.all([loadCategories(), loadSongs()]);
    
    const countMap: Record<string, number> = {};
    
    // Count songs by category
    for (const song of songs) {
      if (song.category) {
        countMap[song.category] = (countMap[song.category] || 0) + 1;
      }
    }
    
    // Update categories with new counts
    const updatedCategories = categories.map(category => ({
      ...category,
      songCount: countMap[category.id] || countMap[category.name] || 0
    }));
    
    await saveCategories(updatedCategories);
  } catch (error) {
    console.error('Error recomputing category counts:', error);
  }
};

// Choirs operations
export const saveChoirs = async (choirs: Choir[]): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('choir_app_choirs', JSON.stringify(choirs));
    return;
  }

  await ensureDbReady();
  try {
    const database = await getDatabase();

    await database.runAsync('DELETE FROM choirs');

    for (const choir of choirs) {
      await database.runAsync(
        `INSERT INTO choirs (id, name, type, members, dateCreated) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          choir.id,
          choir.name,
          choir.type,
          JSON.stringify(choir.members),
          choir.dateCreated
        ]
      );
    }
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

  await ensureDbReady();
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT * FROM choirs ORDER BY dateCreated DESC');

    return result.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.type as 'A' | 'B' | 'C',
      members: JSON.parse(item.members || '[]'),
      dateCreated: item.dateCreated,
    }));
  } catch (error) {
    console.error('Error loading choirs:', error);
    return [];
  }
};

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

// Settings operations
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem('choir_app_settings', JSON.stringify(settings));
    return;
  }

  await ensureDbReady();
  try {
    const database = await getDatabase();

    await database.runAsync(
      `INSERT OR REPLACE INTO settings (id, fontSize, fontFamily, fontColor, backgroundColor, isDarkMode, verseRotationFrequency) 
       VALUES (1, ?, ?, ?, ?, ?, ?)`,
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
  const defaultSettings: AppSettings = {
    fontSize: 16,
    fontFamily: 'System',
    fontColor: '#374151',
    backgroundColor: '#FFFFFF',
    isDarkMode: false,
    verseRotationFrequency: 'daily',
  };

  if (Platform.OS === 'web') {
    const settingsData = await AsyncStorage.getItem('choir_app_settings');
    return settingsData ? JSON.parse(settingsData) : defaultSettings;
  }

  await ensureDbReady();
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT * FROM settings WHERE id = 1');

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

  return defaultSettings;
};

// Verse rotation
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

  await ensureDbReady();
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync('SELECT lastVerseDate FROM verse_rotation WHERE id = 1');

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

  await ensureDbReady();
  try {
    const database = await getDatabase();
    await database.runAsync(
      'INSERT OR REPLACE INTO verse_rotation (id, lastVerseDate) VALUES (1, ?)',
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
    const [songs, members, choirs, settings, categories] = await Promise.all([
      loadSongs(),
      loadMembers(),
      loadChoirs(),
      loadSettings(),
      loadCategories(),
    ]);

    const exportData = {
      songs,
      members,
      choirs,
      settings,
      categories,
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
    if (data.categories) promises.push(saveCategories(data.categories));

    await Promise.all(promises);
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

export const resetAllData = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    await AsyncStorage.multiRemove([
      'choir_app_songs',
      'choir_app_members',
      'choir_app_choirs',
      'choir_app_categories'
    ]);
    return;
  }

  await ensureDbReady();
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM songs');
    await database.runAsync('DELETE FROM members');
    await database.runAsync('DELETE FROM categories');
    await database.runAsync('DELETE FROM choirs');
  } catch (error) {
    console.error('Error resetting data:', error);
    throw error;
  }
};

// Initialize database on import for native platforms
if (Platform.OS !== 'web') {
  initializeDatabase().catch(error => {
    console.error('Failed to initialize database on import:', error);
  });
}