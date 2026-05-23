import * as SQLite from 'expo-sqlite';

import type { ActivityAttempt, SensorReading } from '@/constants/types';

const DB_NAME = 'stemmlab.db';

let _db: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!_db) {
        _db = await SQLite.openDatabaseAsync(DB_NAME);
        await initSchema(_db);
    }
    return _db;
}

async function initSchema(db: SQLite.SQLiteDatabase): Promise<void> {
    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS attempts (
            id           TEXT PRIMARY KEY,
            team_id      TEXT NOT NULL,
            activity_id  TEXT NOT NULL,
            iteration    INTEGER NOT NULL DEFAULT 1,
            data_rows    TEXT NOT NULL DEFAULT '[]',
            video_uri    TEXT,
            rating       INTEGER NOT NULL DEFAULT 0,
            comment      TEXT NOT NULL DEFAULT '',
            gps_lat      REAL,
            gps_lon      REAL,
            started_at   INTEGER NOT NULL,
            completed_at INTEGER,
            synced       INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS readings (
            id          TEXT PRIMARY KEY,
            attempt_id  TEXT NOT NULL,
            sensor_type TEXT NOT NULL,
            value       REAL NOT NULL,
            unit        TEXT NOT NULL DEFAULT '',
            label       TEXT,
            timestamp   INTEGER NOT NULL,
            FOREIGN KEY (attempt_id) REFERENCES attempts(id)
        );

        CREATE INDEX IF NOT EXISTS idx_attempts_team     ON attempts(team_id);
        CREATE INDEX IF NOT EXISTS idx_attempts_activity ON attempts(activity_id);
        CREATE INDEX IF NOT EXISTS idx_readings_attempt  ON readings(attempt_id);
    `);
}

// ─── Save ────────────────────────────────────────────────────────

export async function saveAttempt(attempt: ActivityAttempt): Promise<void> {
    const db = await getDb();

    await db.runAsync(
        `INSERT OR REPLACE INTO attempts
         (id, team_id, activity_id, iteration, data_rows, video_uri,
          rating, comment, gps_lat, gps_lon, started_at, completed_at, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        attempt.id,
        attempt.teamId,
        attempt.activityId,
        attempt.iteration,
        JSON.stringify(attempt.dataTableRows),
        attempt.videoUri ?? null,
        attempt.rating,
        attempt.comment,
        attempt.gpsLatitude ?? null,
        attempt.gpsLongitude ?? null,
        attempt.startedAt,
        attempt.completedAt ?? null,
        attempt.synced ? 1 : 0,
    );

    // Save sensor readings in parallel (Promise.all → parallel programming).
    await Promise.all(attempt.sensorReadings.map((r) => saveReading(r, attempt.id)));
}

async function saveReading(reading: SensorReading, attemptId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync(
        `INSERT OR REPLACE INTO readings
         (id, attempt_id, sensor_type, value, unit, label, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        reading.id,
        attemptId,
        reading.sensorType,
        reading.value,
        reading.unit,
        reading.label ?? null,
        reading.timestamp,
    );
}

// ─── Read ────────────────────────────────────────────────────────

interface AttemptRow {
    id: string; team_id: string; activity_id: string; iteration: number;
    data_rows: string; video_uri: string | null; rating: number; comment: string;
    gps_lat: number | null; gps_lon: number | null;
    started_at: number; completed_at: number | null; synced: number;
}

function rowToAttempt(row: AttemptRow, readings: SensorReading[]): ActivityAttempt {
    return {
        id: row.id,
        teamId: row.team_id,
        activityId: row.activity_id,
        iteration: row.iteration,
        dataTableRows: JSON.parse(row.data_rows),
        videoUri: row.video_uri ?? undefined,
        rating: row.rating,
        comment: row.comment,
        gpsLatitude: row.gps_lat ?? undefined,
        gpsLongitude: row.gps_lon ?? undefined,
        startedAt: row.started_at,
        completedAt: row.completed_at ?? undefined,
        synced: row.synced === 1,
        sensorReadings: readings,
    };
}

async function readingsFor(attemptId: string): Promise<SensorReading[]> {
    const db = await getDb();
    return db.getAllAsync<SensorReading>(
        `SELECT id, sensor_type as sensorType, value, unit, label, timestamp
         FROM readings WHERE attempt_id = ? ORDER BY timestamp ASC`,
        attemptId,
    );
}

export async function getAttemptsByTeam(teamId: string): Promise<ActivityAttempt[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<AttemptRow>(
        'SELECT * FROM attempts WHERE team_id = ? ORDER BY started_at DESC',
        teamId,
    );
    return Promise.all(rows.map(async (r) => rowToAttempt(r, await readingsFor(r.id))));
}

export async function getAttemptCount(teamId: string, activityId: string): Promise<number> {
    const db = await getDb();
    const res = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM attempts WHERE team_id = ? AND activity_id = ?',
        teamId,
        activityId,
    );
    return res?.count ?? 0;
}

export async function getUnsyncedAttempts(): Promise<ActivityAttempt[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<AttemptRow>('SELECT * FROM attempts WHERE synced = 0');
    return Promise.all(rows.map(async (r) => rowToAttempt(r, await readingsFor(r.id))));
}

export async function markSynced(attemptId: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('UPDATE attempts SET synced = 1 WHERE id = ?', attemptId);
}
