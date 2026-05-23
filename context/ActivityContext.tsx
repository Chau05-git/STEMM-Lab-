import React, { createContext, useContext, useState } from 'react';

import type { ActivityAttempt, DataTableRow, SensorReading } from '@/constants/types';

/**
 * Holds the *in-progress* attempt while a team works through an activity
 * session. Persisted to SQLite / Firestore later (Phase 3+). For now it is
 * purely in-memory local state shared across the activity screens.
 */
interface ActivityContextValue {
    activeAttempt: ActivityAttempt | null;
    startAttempt: (activityId: string, teamId: string, iteration?: number) => void;
    addSensorReading: (reading: SensorReading) => void;
    setSensorReadings: (readings: SensorReading[]) => void;
    setDataTableRows: (rows: DataTableRow[]) => void;
    setRating: (rating: number) => void;
    setComment: (comment: string) => void;
    setVideoUri: (uri: string) => void;
    setLocation: (lat: number, lon: number) => void;
    finishAttempt: () => ActivityAttempt | null;
    discardAttempt: () => void;
}

const ActivityContext = createContext<ActivityContextValue>({
    activeAttempt: null,
    startAttempt: () => {},
    addSensorReading: () => {},
    setSensorReadings: () => {},
    setDataTableRows: () => {},
    setRating: () => {},
    setComment: () => {},
    setVideoUri: () => {},
    setLocation: () => {},
    finishAttempt: () => null,
    discardAttempt: () => {},
});

function makeId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ActivityProvider({ children }: { children: React.ReactNode }) {
    const [activeAttempt, setAttempt] = useState<ActivityAttempt | null>(null);

    const startAttempt = (activityId: string, teamId: string, iteration = 1) => {
        setAttempt({
            id: makeId(),
            teamId,
            activityId,
            iteration,
            sensorReadings: [],
            dataTableRows: [],
            rating: 0,
            comment: '',
            startedAt: Date.now(),
            synced: false,
        });
    };

    const addSensorReading = (reading: SensorReading) => {
        setAttempt((prev) =>
            prev ? { ...prev, sensorReadings: [...prev.sensorReadings, reading] } : prev,
        );
    };

    // Replace the whole readings array (avoids stale duplicates on re-submit).
    const setSensorReadings = (readings: SensorReading[]) =>
        setAttempt((prev) => (prev ? { ...prev, sensorReadings: readings } : prev));

    const setDataTableRows = (rows: DataTableRow[]) =>
        setAttempt((prev) => (prev ? { ...prev, dataTableRows: rows } : prev));

    const setRating = (rating: number) =>
        setAttempt((prev) => (prev ? { ...prev, rating } : prev));

    const setComment = (comment: string) =>
        setAttempt((prev) => (prev ? { ...prev, comment } : prev));

    const setVideoUri = (videoUri: string) =>
        setAttempt((prev) => (prev ? { ...prev, videoUri } : prev));

    const setLocation = (gpsLatitude: number, gpsLongitude: number) =>
        setAttempt((prev) => (prev ? { ...prev, gpsLatitude, gpsLongitude } : prev));

    const finishAttempt = (): ActivityAttempt | null => {
        if (!activeAttempt) return null;
        const completed: ActivityAttempt = { ...activeAttempt, completedAt: Date.now() };
        setAttempt(completed);
        return completed;
    };

    const discardAttempt = () => setAttempt(null);

    return (
        <ActivityContext.Provider
            value={{
                activeAttempt,
                startAttempt,
                addSensorReading,
                setSensorReadings,
                setDataTableRows,
                setRating,
                setComment,
                setVideoUri,
                setLocation,
                finishAttempt,
                discardAttempt,
            }}
        >
            {children}
        </ActivityContext.Provider>
    );
}

export function useActivity() {
    return useContext(ActivityContext);
}
