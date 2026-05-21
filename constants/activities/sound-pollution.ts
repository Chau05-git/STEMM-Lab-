import type { ActivityDefinition } from '@/constants/types';

const soundPollution: ActivityDefinition = {
    id: 'sound-pollution',
    name: 'Sound Pollution Hunter',
    shortDescription: 'Measure and compare sound levels in your environment.',
    overview:
        'Students measure and compare sound levels in different classroom activities, mapping loud and quiet zones.',
    category: 'engineering',
    categoryLabel: 'Environmental Science',
    icon: '🔊',
    sensorType: 'microphone',
    sensorLabel: 'Microphone (dB meter)',
    keyMeasurement: 'Sound level (dB)',
    equipment: ['Mobile phone with STEMM Lab app'],
    instructions: [
        { step: 1, text: 'Measure noise from different actions (dropping pens, books, talking, walking, stamping feet).', requiresSensor: true, sensorLabel: 'Start Sound Meter' },
        { step: 2, text: 'Record sound levels and locations.' },
        { step: 3, text: 'Map loud and quiet zones.' },
    ],
    dataTable: {
        columns: [
            { key: 'action',     label: 'Action',                              editable: true },
            { key: 'prediction', label: 'Prediction (louder or softer than)',  editable: true },
            { key: 'outcome',    label: 'Outcome (dB)',                        editable: true },
            { key: 'correct',    label: 'Were you right?',                     editable: true },
        ],
        exampleRows: [
            ['Dropping a book on the table', '', '', ''],
            ['Action 2', '', '', ''],
            ['Action 3', '', '', ''],
        ],
    },
    writeUp: {
        prompts: [
            'Predict which action created the loudest sound.',
            'Record the results.',
            'Were you right? Any surprises?',
            'Should we wear ear muffs in your classroom?',
        ],
    },
    discussion:
        'Sound intensity varies depending on energy and surfaces. Prolonged loud noise can impact health and concentration.',
    formulas: [
        { name: 'Sound Level', formula: 'Measured in decibels (dB)', level: 'primary' },
    ],
    curriculumLinks: [
        { subject: 'Science', code: 'ACSSU073', description: 'Sound and energy' },
        { subject: 'Health',  code: 'ACPPS053', description: 'Health and wellbeing' },
    ],
    maxIterations: 1,
    hasTimer: false,
};

export default soundPollution;
