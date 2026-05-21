import type { ActivityDefinition } from '@/constants/types';

const handFan: ActivityDefinition = {
    id: 'hand-fan',
    name: 'Hand Fan Challenge',
    shortDescription: 'Test how air movement affects flexible materials.',
    overview:
        'Students test how air movement affects flexible materials, exploring the relationship between fan design, distance, and bend angle.',
    category: 'engineering',
    categoryLabel: 'Physics – Air Movement',
    icon: '🌬️',
    sensorType: 'accelerometer',
    sensorLabel: 'Accelerometer (bend angle)',
    keyMeasurement: 'Bend angle (degrees)',
    equipment: [
        'Paper and cardboard',
        'Scissors',
        'Mobile phone',
        'Sticky tape',
        'STEMM Lab app',
    ],
    instructions: [
        { step: 1, text: 'Stand paper upright on a table.' },
        { step: 2, text: 'Fan air from 30 cm away.' },
        { step: 3, text: 'Observe and record movement.', requiresSensor: true, sensorLabel: 'Activate Accelerometer' },
        { step: 4, text: 'Repeat with different fan designs and fan distances (15 cm, 30 cm, 45 cm).' },
        { step: 5, text: 'Repeat with cardboard instead of paper as the vertical material.' },
    ],
    dataTable: {
        columns: [
            { key: 'design',    label: 'Design',                   editable: true },
            { key: 'predicted', label: 'Predicted bend (degrees)',  editable: true },
            { key: 'outcome',   label: 'Outcome (degrees)',         editable: true },
            { key: 'notes',     label: 'Observation notes',         editable: true },
        ],
        exampleRows: [
            ['1 cm back-and-forward folds', '30°', '', ''],
            ['No folds', '', '', ''],
            ['Design 3', '', '', ''],
        ],
    },
    writeUp: {
        prompts: [
            'Predict which fan design makes the paper move the most.',
            'Record the results.',
            'Were you right? Any surprises?',
            'How does material stiffness affect the bend angle?',
            'How does fan design influence air velocity and resulting paper movement?',
            'How does distance from the fan affect bending?',
        ],
    },
    discussion:
        'Moving air applies force to objects. Paper bends due to flexibility (plasticity), and repeated bending can weaken it.',
    formulas: [
        { name: 'Force Estimation',     formula: 'F ≈ k × θ',                        example: 'Thin paper: 0.05 × 0.524 ≈ 0.026 N', level: 'secondary' },
        { name: 'Stiffness Coefficient', formula: 'k varies by material thickness',  example: 'Thin paper k=0.05, Card stock k=0.2',  level: 'secondary' },
    ],
    curriculumLinks: [
        { subject: 'Science', code: 'ACSSU076', description: 'Forces and motion' },
    ],
    maxIterations: 1,
    hasTimer: false,
};

export default handFan;
