import React, { createContext, useContext, useEffect, useState } from "react";
import { Expense, Note, Photo, PrivacySettings, Trip } from "../data/mockData";
import { apiFetch, uploadImage } from "../services/api";
import { useAuth } from "./AuthContext";

interface TripCtx {
  trips: Trip[];
  isLoading: boolean;
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

export function TripProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setTrips([]);
      return;
    }
    (async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch("/trips");
        setTrips(res.data);
      } catch {
        setTrips([]);
      }
      setIsLoading(false);
    })();
  }, [isAuthenticated]);

  const replaceTrip = (updated: Trip) => setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));

  const getTripById = (id: string) => trips.find((t) => t.id === id);

  const addTrip = async (trip: Trip) => {
    const coverPhoto = trip.coverPhoto ? await uploadImage(trip.coverPhoto) : trip.coverPhoto;
    const res = await apiFetch("/trips", {
      method: "POST",
      body: {
        name: trip.name, destination: trip.destination, flag: trip.flag,
        startDate: trip.startDate, endDate: trip.endDate, budget: trip.budget,
        currency: trip.currency, coverPhoto, description: trip.description,
        transport: trip.transport, route: trip.route, preferences: trip.preferences,
      },
    });
    setTrips((prev) => [...prev, res.data]);
  };

  const updateTrip = async (id: string, data: Partial<Trip>) => {
    const coverPhoto = data.coverPhoto ? await uploadImage(data.coverPhoto) : undefined;
    const res = await apiFetch(`/trips/${id}`, {
      method: "PATCH",
      body: { ...data, ...(coverPhoto ? { coverPhoto } : {}) },
    });
    replaceTrip(res.data);
  };

  const deleteTrip = async (id: string) => {
    await apiFetch(`/trips/${id}`, { method: "DELETE" });
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const addExpense = async (tripId: string, expense: Expense) => {
    const res = await apiFetch(`/trips/${tripId}/expenses`, { method: "POST", body: expense });
    replaceTrip(res.data);
  };
  const deleteExpense = async (tripId: string, expenseId: string) => {
    const res = await apiFetch(`/trips/${tripId}/expenses/${expenseId}`, { method: "DELETE" });
    replaceTrip(res.data);
  };
  const toggleExpensePrivacy = async (tripId: string, expenseId: string) => {
    const trip = getTripById(tripId);
    const expense = trip?.expenses.find((e) => e.id === expenseId);
    const res = await apiFetch(`/trips/${tripId}/expenses/${expenseId}`, {
      method: "PATCH",
      body: { isPrivate: !expense?.isPrivate },
    });
    replaceTrip(res.data);
  };

  const addPhoto = async (tripId: string, photo: Photo) => {
    const url = await uploadImage(photo.url);
    const res = await apiFetch(`/trips/${tripId}/photos`, { method: "POST", body: { ...photo, url } });
    replaceTrip(res.data);
  };
  const deletePhoto = async (tripId: string, photoId: string) => {
    const res = await apiFetch(`/trips/${tripId}/photos/${photoId}`, { method: "DELETE" });
    replaceTrip(res.data);
  };
  const togglePhotoPrivacy = async (tripId: string, photoId: string) => {
    const trip = getTripById(tripId);
    const photo = trip?.photos.find((p) => p.id === photoId);
    const res = await apiFetch(`/trips/${tripId}/photos/${photoId}`, {
      method: "PATCH",
      body: { isPrivate: !photo?.isPrivate },
    });
    replaceTrip(res.data);
  };

  const addNote = async (tripId: string, note: Note) => {
    const res = await apiFetch(`/trips/${tripId}/notes`, { method: "POST", body: note });
    replaceTrip(res.data);
  };
  const updateNote = async (tripId: string, noteId: string, data: Partial<Note>) => {
    const res = await apiFetch(`/trips/${tripId}/notes/${noteId}`, { method: "PATCH", body: data });
    replaceTrip(res.data);
  };
  const deleteNote = async (tripId: string, noteId: string) => {
    const res = await apiFetch(`/trips/${tripId}/notes/${noteId}`, { method: "DELETE" });
    replaceTrip(res.data);
  };
  const toggleNotePrivacy = async (tripId: string, noteId: string) => {
    const trip = getTripById(tripId);
    const note = trip?.notes.find((n) => n.id === noteId);
    const res = await apiFetch(`/trips/${tripId}/notes/${noteId}`, {
      method: "PATCH",
      body: { isPrivate: !note?.isPrivate },
    });
    replaceTrip(res.data);
  };

  const updateTripVisibility = async (tripId: string, visibility: "public" | "private") =>
    updateTrip(tripId, { visibility });
  const updateTripPrivacy = async (tripId: string, settings: Partial<PrivacySettings>) =>
    updateTrip(tripId, { privacySettings: settings } as Partial<Trip>);

  return (
    <TripContext.Provider value={{
      trips, isLoading, getTripById, addTrip, updateTrip, deleteTrip,
      addExpense, deleteExpense, toggleExpensePrivacy, addPhoto, deletePhoto, togglePhotoPrivacy,
      addNote, updateNote, deleteNote, toggleNotePrivacy,
      updateTripVisibility, updateTripPrivacy,
    }}>
      {children}
    </TripContext.Provider>
  );
}

export const useTrips = () => useContext(TripContext);
