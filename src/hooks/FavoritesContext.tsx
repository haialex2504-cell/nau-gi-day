'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  query,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/utils/firebase/client';
import { useAuthContext } from './AuthContext';

const LOCAL_FAVORITES_KEY = 'nau_gi_day_favorites';

interface FavoritesContextType {
  favorites: string[];
  isLoaded: boolean;
  toggleFavorite: (recipeId: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  isLoaded: false,
  toggleFavorite: async () => {},
  isFavorite: () => false
});

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuthContext();
  const isAuthLoaded = !authLoading;
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Listen to Firestore / LocalStorage (Singleton for the whole app)
  useEffect(() => {
    if (!isAuthLoaded) {
      const timeout = setTimeout(() => {
        if (!isLoaded) {
          const stored = localStorage.getItem(LOCAL_FAVORITES_KEY);
          if (stored) setFavorites(JSON.parse(stored));
          setIsLoaded(true);
        }
      }, 2000);
      return () => clearTimeout(timeout);
    }

    if (!user) {
      const stored = localStorage.getItem(LOCAL_FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored));
      setIsLoaded(true);
      return;
    }

    // -- BẮT ĐẦU MIGRATION TRƯỚC KHI LẮNG NGHE FIRESTORE --
    // Tránh bị snapshot rỗng càn quét mất data local
    const localData = localStorage.getItem(LOCAL_FAVORITES_KEY);
    let localIds: string[] = [];
    if (localData) {
      localIds = JSON.parse(localData);
    }

    let isMigrating = false;

    // Gắn listener
    const favRef = collection(db, 'users', user.uid, 'favorites');
    const q = query(favRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const favIds = snapshot.docs.map(doc => doc.id);
      
      // Thực hiện merge ngay trong lần nhận snapshot đầu tiên
      const missingInFirestore = localIds.filter(id => !favIds.includes(id));
      
      if (missingInFirestore.length > 0 && !isMigrating) {
        isMigrating = true;
        console.log(`[Singleton] 🔄 Merging ${missingInFirestore.length} local favorites to Firestore...`);
        const batch = writeBatch(db);
        missingInFirestore.forEach(id => {
          const ref = doc(db, 'users', user.uid, 'favorites', id);
          batch.set(ref, { 
            created_at: new Date().toISOString(),
            migrated_from_local: true 
          });
        });
        batch.commit()
          .then(() => {
             console.log("Migration successful");
             // Sau khi migrate xong, localIds hết giá trị
             localIds = []; 
             isMigrating = false;
          })
          .catch(err => {
             console.error('Migration failed:', err);
             isMigrating = false;
          });
          
        // Tạm gộp data để UI không bị giật lag trong lúc chờ batch commit
        setFavorites([...favIds, ...missingInFirestore]);
      } else {
        setFavorites(favIds);
        // Chỉ lưu đè vào LocalStorage khi không có dữ liệu cần migrate
        if (missingInFirestore.length === 0) {
           localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(favIds));
        }
      }
      
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [user, isAuthLoaded]);

  const toggleFavorite = async (recipeId: string) => {
    if (!user) {
      const newFavs = favorites.includes(recipeId)
        ? favorites.filter(id => id !== recipeId)
        : [...favorites, recipeId];
      setFavorites(newFavs);
      localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(newFavs));
      return;
    }

    const favRef = doc(db, 'users', user.uid, 'favorites', recipeId);
    if (favorites.includes(recipeId)) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, { created_at: new Date().toISOString() });
    }
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, isLoaded }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  return useContext(FavoritesContext);
}
