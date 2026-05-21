import type { ActivityDefinition } from '@/constants/types';

const humanPerformance: ActivityDefinition = {
    id: 'human-performance',
    name: 'Human Performance Lab',
    shortDescription: 'Measure speed, smoothness, and coordination of body movements.',
    overview:
        'Students investigate how the human body moves by measuring speed, smoothness, and coordination during controlled stretching activities.',
    category: 'health',
    categoryLabel: 'Medical Science + Biomechanics',
    icon: '🏃',
    sensorType: 'accelerometer',
    sensorLabel: 'Accelerometer (smoothness score)',
    keyMeasurement: 'Smoothness score, movement time',
    equipment: [
        'Mobile phone with STEMM Lab app',
        'Open space to move safely',
    ],
    instructions: [
        { step: 1, text: 'Hold the phone firmly in one hand. Activate the app vibration sensor.', requiresSensor: true, sensorLabel: 'Activate Vibration Sensor' },
        { step: 2, text: 'Perform guided movement slowly as shown in the app. Record the vibration.' },
        { step: 3, text: 'Repeat the activity with vibration feedback enabled.' },
        { step: 4, text: 'Review speed, smoothness, and range-of-motion data.' },
        { step: 5, text: 'Upload results and reflect as a group.' },
    ],
    dataTable: {
        columns: [
            { key: 'attempt',   label: 'Attempt',                  editable: false },
            { key: 'predicted', label: 'Predicted phone vibration', editable: true  },
            { key: 'outcome',   label: 'Outcome (time + movement)', editable: true  },
            { key: 'correct',   label: 'Were you right?',           editable: true  },
        ],
        exampleRows: [
            ['Attempt 1', '±1 cm', '5 mm in 20 seconds', ''],
            ['Attempt 2', '',       '5 mm in 5 seconds',  ''],
            ['Attempt 3', '',       '',                   ''],
        ],
    },
    writeUp: {
        prompts: [
            'Which movement was the hardest to keep the vibration low?',
            'Record the results.',
            'Were you right? Any surprises?',
        ],
    },
    discussion:
        'Muscles and joints work together to create movement. Faster movements often reduce control, while smoother movements show better coordination.',
    formulas: [],
    curriculumLinks: [
        { subject: 'Health & Physical Education', code: 'ACPPS051', description: 'Movement skills' },
        { subject: 'Health & Physical Education', code: 'ACPPS054', description: 'Physical performance' },
        { subject: 'Science (Biology)',            code: 'ACSSU176', description: 'Structure and function of body systems' },
    ],
    maxIterations: 3,
    hasTimer: false,
};

export default humanPerformance;
