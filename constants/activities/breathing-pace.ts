import type { ActivityDefinition } from '@/constants/types';

const breathingPace: ActivityDefinition = {
    id: 'breathing-pace',
    name: 'Breathing Pace Trainer',
    shortDescription: 'Analyse breathing patterns at rest and after exercise.',
    overview:
        'Students analyse breathing patterns at rest and after exercise using the phone accelerometer placed on the chest.',
    category: 'health',
    categoryLabel: 'Medical Science',
    icon: '🫁',
    sensorType: 'accelerometer',
    sensorLabel: 'Accelerometer (chest movement)',
    keyMeasurement: 'Breaths per minute, amplitude',
    equipment: [
        'Mobile phone with STEMM Lab app',
        'Flat surface or mat',
    ],
    instructions: [
        { step: 1, text: 'Place the phone gently on the chest.' },
        { step: 2, text: 'Record breathing at rest.', requiresSensor: true, sensorLabel: 'Start Breathing Sensor' },
        { step: 3, text: 'Perform light exercise: jog one minute on the spot or 100 star jumps.' },
        { step: 4, text: 'Record breathing again and compare results.', requiresSensor: true, sensorLabel: 'Start Breathing Sensor' },
        { step: 5, text: 'Rotate for each team member.' },
    ],
    dataTable: {
        columns: [
            { key: 'condition', label: 'Condition',                      editable: false },
            { key: 'predicted', label: 'Predicted breaths per minute',   editable: true  },
            { key: 'outcome',   label: 'Outcome (time + movement)',       editable: true  },
            { key: 'correct',   label: 'Were you right?',                 editable: true  },
        ],
        exampleRows: [
            ['Breathing at Rest', '6 breaths per minute', '', ''],
            ['After Exercise 1',   '',                     '', ''],
            ['After Exercise 2',   '',                     '', ''],
        ],
    },
    writeUp: {
        prompts: [
            'Before you start: predict how many breaths per minute you take at rest.',
            'After exercise: predict by how much your breathing rate will increase.',
            'Record your actual breathing rate for each condition.',
            'Compare your prediction to the results — were you right?',
            'Why does your breathing speed up during exercise?',
        ],
    },
    discussion:
        'Breathing rate increases during exercise to supply more oxygen to muscles. Sensors detect chest movement, helping students visualise breathing patterns.',
    formulas: [],
    curriculumLinks: [
        { subject: 'Science', code: 'ACSSU176', description: 'Body systems' },
        { subject: 'Health',  code: 'ACPPS054', description: 'Physical activity and health' },
    ],
    maxIterations: 1,
    hasTimer: false,
};

export default breathingPace;
