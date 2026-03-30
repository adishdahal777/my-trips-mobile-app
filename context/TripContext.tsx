import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Expense, MOCK_TRIPS, Note, Photo, PrivacySettings, Trip } from "../data/mockData";

interface TripCtx {
  trips: Trip[];
  getTripById: (id: string) => Trip | undefined;
  addTrip: (trip: Trip) => Promise<void>;
  updateTrip: (id: string, data: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  addExpense: (tripId: string, expense: Expense) => Promise<void>;
  deleteExpense: (tripId: string, expenseId: string) => Promise<void>;
  toggleExpensePrivacy: (tripId: string, expenseId: string) => Promise<void>;
  addPhoto: (tripId: string, photo: Photo) => Promise<void>;
  deletePhoto: (tripId: string, photoId: string) => Promise<void>;
  togglePhotoPrivacy: (tripId: string, photoId: string) => Promise<void>;
  addNote: (tripId: string, note: Note) => Promise<void>;
  updateNote: (tripId: string, noteId: string, data: Partial<Note>) => Promise<void>;
  deleteNote: (tripId: string, noteId: string) => Promise<void>;
  toggleNotePrivacy: (tripId: string, noteId: string) => Promise<void>;
  updateTripVisibility: (tripId: string, visibility: "public" | "private") => Promise<void>;
  updateTripPrivacy: (tripId: string, settings: Partial<PrivacySettings>) => Promise<void>;
}

const TripContext = createContext<TripCtx>({} as TripCtx);
const STORAGE_KEY = "mytrips_data";

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) setTrips(JSON.parse(stored));
    })();
  }, []);

  const persist = async (updated: Trip[]) => {
    setTrips(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const getTripById = (id: string) => trips.find((t) => t.id === id);

  const addTrip = async (trip: Trip) => persist([...trips, trip]);
  const updateTrip = async (id: string, data: Partial<Trip>) =>
    persist(trips.map((t) => (t.id === id ? { ...t, ...data } : t)));
  const deleteTrip = async (id: string) => persist(trips.filter((t) => t.id !== id));

  const addExpense = async (tripId: string, expense: Expense) =>
    persist(trips.map((t) => t.id === tripId ? { ...t, expenses: [...t.expenses, expense], spent: t.spent + expense.amount } : t));
  const deleteExpense = async (tripId: string, expenseId: string) =>
    persist(trips.map((t) => {
      if (t.id !== tripId) return t;
      const exp = t.expenses.find((e) => e.id === expenseId);
      return { ...t, expenses: t.expenses.filter((e) => e.id !== expenseId), spent: t.spent - (exp?.amount || 0) };
    }));
  const toggleExpensePrivacy = async (tripId: string, expenseId: string) =>
    persist(trips.map((t) => t.id === tripId ? { ...t, expenses: t.expenses.map((e) => e.id === expenseId ? { ...e, isPrivate: !e.isPrivate } : e) } : t));

  const addPhoto = async (tripId: string, photo: Photo) =>
    persist(trips.map((t) => t.id === tripId ? { ...t, photos: [...t.photos, photo] } : t));
  const deletePhoto = async (tripId: string, photoId: string) =>
    persist(trips.map((t) => t.id === tripId ? { ...t, photos: t.photos.filter((p) => p.id !== photoId) } : t));
  const togglePhotoPrivacy = async (tripId: string, photoId: string) =>
    persist(trips.map((t) => t.id === tripId ? { ...t, photos: t.photos.map((p) => p.id === photoId ? { ...p, isPrivate: !p.isPrivate } : p) } : t));

  const addNote = async (tripId: string, note: Note) =>
    persist(trips.map((t) => t.id === tripId ? { ...t, notes: [...t.notes, note] } : t));
  const updateNote = async (tripId: string, noteId: string, data: Partial<Note>) =>
    persist(trips.map((t) => t.id === tripId ? { ...t, notes: t.notes.map((n) => n.id === noteId ? { ...n, ...data } : n) } : t));
  const deleteNote = async (tripId: string, noteId: string) =>
    persist(trips.map((t) => t.id === tripId ? { ...t, notes: t.notes.filter((n) => n.id !== noteId) } : t));
  const toggleNotePrivacy = async (tripId: string, noteId: string) =>
    persist(trips.map((t) => t.id === tripId ? { ...t, notes: t.notes.map((n) => n.id === noteId ? { ...n, isPrivate: !n.isPrivate } : n) } : t));

  const updateTripVisibility = async (tripId: string, visibility: "public" | "private") =>
    persist(trips.map((t) => t.id === tripId ? { ...t, visibility } : t));
  const updateTripPrivacy = async (tripId: string, settings: Partial<PrivacySettings>) =>
    persist(trips.map((t) => t.id === tripId ? { ...t, privacySettings: { ...t.privacySettings, ...settings } } : t));

  return (
    <TripContext.Provider value={{
      trips, getTripById, addTrip, updateTrip, deleteTrip,
      addExpense, deleteExpense, toggleExpensePrivacy, addPhoto, deletePhoto, togglePhotoPrivacy,
      addNote, updateNote, deleteNote, toggleNotePrivacy,
      updateTripVisibility, updateTripPrivacy,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export const useTrips = () => useContext(TripContext);
