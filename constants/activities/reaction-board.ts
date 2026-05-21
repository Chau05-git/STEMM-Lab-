import type { ActivityDefinition } from '@/constants/types';

const reactionBoard: ActivityDefinition = {
    id: 'reaction-board',
    name: 'Reaction Board Challenge',
    shortDescription: 'Measure reaction time and coordination through digital challenges.',
    overview:
        'Students measure reaction time, coordination, and improvement through repeated digital and physical challenges.',
    category: 'health',
    categoryLabel: 'Neuroscience + Mathematics',
    icon: '⚡',
    sensorType: 'touchscreen',
    sensorLabel: 'Touchscreen timer',
    keyMeasurement: 'Reaction time (ms)',
    equipment: [
        'Mobile phone with STEMM Lab app',
        'Clear working space',
    ],
    instructions: [
        { step: 1, text: 'Phase 1 – Tap Reaction: Tap the screen as soon as the hidden button appears.' },
        { step: 2, text: 'Record reaction time.', requiresSensor: true, sensorLabel: 'Start Reaction Test' },
        { step: 3, text: 'Rotate through each team member.' },
        { step: 4, text: 'Phase 2 – Swap Hands: Repeat using the non-dominant hand.' },
        { step: 5, text: 'Compare results between dominant and non-dominant hand.' },
        { step: 6, text: 'Rotate through each team member.' },
        { step: 7, text: 'Phase 3 – Tracing Challenge: Trace a moving shape on the screen.' },
        { step: 8, text: 'Review accuracy and delay.' },
        { step: 9, text: 'Rotate through each team member.' },
    ],
    dataTable: {
        columns: [
            { key: 'attempt',   label: 'Attempt',                  editable: false },
            { key: 'predicted', label: 'Reaction time prediction',  editable: true  },
            { key: 'outcome',   label: 'Outcome (time + movement)', editable: true  },
            { key: 'correct',   label: 'Were you right?',           editable: true  },
        ],
        exampleRows: [
            ['Attempt 1', '±1 cm', '6 seconds delay', ''],
            ['Attempt 2', '',       '3 seconds delay',  ''],
            ['Attempt 3', '',       '',                 ''],
        ],
    },
    writeUp: {
        prompts: [
            'Predict your reaction time.',
            'Record the results.',
            'Were you right? Any surprises?',
        ],
    },
    discussion:
        'Reaction time measures how quickly the brain processes information and sends signals to muscles. Practice can improve speed and coordination.',
    formulas: [],
    curriculumLinks: [
        { subject: 'Science Inquiry', code: 'ACSIS130', description: 'Collecting and analysing data' },
        { subject: 'Mathematics',     code: 'ACMSP147', description: 'Averages and variation' },
        { subject: 'Health',          code: 'ACPPS057', description: 'Understanding physical performance' },
    ],
    maxIterations: 1,
    hasTimer: false,
};

export default reactionBoard;
