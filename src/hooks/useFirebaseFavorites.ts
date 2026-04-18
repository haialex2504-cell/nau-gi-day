'use client';

import { useState, useEffect } from 'react';
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
import { useFavoritesContext } from './FavoritesContext';

export function useFirebaseFavorites() {
  return useFavoritesContext();
}
