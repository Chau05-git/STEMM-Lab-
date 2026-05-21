// ─── Theme ───────────────────────────────────────────────────────

export type ColorScheme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// ─── Team ────────────────────────────────────────────────────────

export interface TeamMember {
    id: string;
    firstName: string;
}

export interface Team {
    id: string;
    name: string;
    discriminator: string;   // auto-assigned 4-digit code
    gradeLevel: string;
    schoolName?: string;
    members: TeamMember[];
    createdAt: number;       // unix ms
}

// ─── Activity ────────────────────────────────────────────────────

export type ActivityCategory = 'engineering' | 'health';

export type SensorType =
    | 'camera'
    | 'accelerometer'
    | 'gyroscope'
    | 'microphone'
    | 'touchscreen'
    | 'timer';

export type ActivityStatus = 'not_started' | 'in_progress' | 'completed';

export interface CurriculumLink {
    subject: string;
    code: string;
    description: string;
}

export interface DataTableColumn {
    key: string;
    label: string;
    editable: boolean;
}

export interface DataTableTemplate {
    columns: DataTableColumn[];
    exampleRows: string[][];
}

export interface ActivityInstruction {
    step: number;
    text: string;
    requiresSensor?: boolean;
    sensorLabel?: string;
}

export interface ActivityWriteUp {
    prompts: string[];
}

export interface ActivityFormula {
    name: string;
    formula: string;
    example?: string;
    level: 'primary' | 'secondary';
}

export interface ActivityDefinition {
    id: string;
    name: string;
    shortDescription: string;
    overview: string;
    category: ActivityCategory;
    categoryLabel: string;
    icon: string;
    sensorType: SensorType;
    sensorLabel: string;
    keyMeasurement: string;
    equipment: string[];
    instructions: ActivityInstruction[];
    dataTable: DataTableTemplate;
    writeUp: ActivityWriteUp;
    discussion: string;
    formulas: ActivityFormula[];
    curriculumLinks: CurriculumLink[];
    maxIterations: number;
    hasTimer: boolean;
    timerMinutes?: number;
}

// ─── Activity Progress (local state) ─────────────────────────────

export interface ActivityProgress {
    status: ActivityStatus;
    bestScore?: number;
    bestScoreUnit?: string;
    lastAttemptAt?: number;
}

// ─── Sensor Reading ──────────────────────────────────────────────

export interface SensorReading {
    id: string;
    sensorType: SensorType;
    value: number;
    unit: string;
    timestamp: number;
    latitude?: number;
    longitude?: number;
    label?: string;
}

// ─── Data Table ──────────────────────────────────────────────────

export interface DataTableRow {
    [key: string]: string;
}

// ─── Activity Attempt ────────────────────────────────────────────

export interface ActivityAttempt {
    id: string;
    teamId: string;
    activityId: string;
    iteration: number;
    sensorReadings: SensorReading[];
    dataTableRows: DataTableRow[];
    videoUri?: string;
    rating: number;          // 1–5 stars
    comment: string;
    gpsLatitude?: number;
    gpsLongitude?: number;
    startedAt: number;
    completedAt?: number;
    synced: boolean;         // false = chưa upload lên Firestore
}

// ─── Leaderboard ─────────────────────────────────────────────────

export interface LeaderboardEntry {
    id: string;
    teamId: string;
    teamName: string;
    teamDiscriminator: string;
    schoolName?: string;
    gradeLevel: string;
    activityId: string;
    bestScore: number;
    bestScoreUnit: string;
    dateAchieved: number;
}

// ─── Media ───────────────────────────────────────────────────────

export type MediaType = 'video' | 'image';

export interface MediaFile {
    id: string;
    attemptId: string;
    localUri: string;
    remoteUrl?: string;
    thumbnailUri?: string;
    type: MediaType;
    sizeBytes?: number;
    uploadedAt?: number;
}

// ─── Notification ────────────────────────────────────────────────

export interface AppNotification {
    id: string;
    type: 'activity_complete' | 'activity_reminder' | 'leaderboard_update' | 'challenge';
    title: string;
    body: string;
    data?: Record<string, unknown>;
    scheduledAt: number;
    read: boolean;
}

// ─── Settings ────────────────────────────────────────────────────

export interface AppSettings {
    theme: ColorScheme;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    gradeFilter: string;     // for leaderboard filtering
}

// ─── Navigation param types (Expo Router) ────────────────────────

export type ActivityRouteParams = {
    id: string;
};

// ─── Battery ─────────────────────────────────────────────────────

export interface BatteryState {
    level: number;        // 0–1
    isCharging: boolean;
    isLow: boolean;       // level < 0.2
}
