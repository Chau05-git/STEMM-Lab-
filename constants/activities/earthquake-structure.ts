import type { ActivityDefinition } from '@/constants/types';

const earthquakeStructure: ActivityDefinition = {
    id: 'earthquake-structure',
    name: 'Earthquake-Resistant Structure',
    shortDescription: 'Design structures that withstand simulated earthquake vibrations.',
    overview:
        'Students design structures that withstand vibration, simulating earthquakes. They iterate designs to minimise phone movement.',
    category: 'engineering',
    categoryLabel: 'Engineering + Earth Science',
    icon: '🏗️',
    sensorType: 'accelerometer',
    sensorLabel: 'Accelerometer (vibration amplitude)',
    keyMeasurement: 'Vibration amplitude (mm)',
    equipment: [
        'Cardboard, paper, scissors, sticky tape, plastic/paper cups',
        'Mobile phone with vibration sensor',
    ],
    instructions: [
        { step: 1, text: 'Build an anti-vibration layer by folding paper/cardboard.' },
        { step: 2, text: 'Place a flat cardboard platform on top.' },
        { step: 3, text: 'Place the phone in the centre and activate vibration mode on the STEMM Lab app.', requiresSensor: true, sensorLabel: 'Activate Vibration Sensor' },
        { step: 4, text: 'Modify the structure to reduce movement (e.g. more pillars, more folds).' },
    ],
    dataTable: {
        columns: [
            { key: 'design',    label: 'Design',                  editable: true },
            { key: 'predicted', label: 'Predicted phone movement', editable: true },
            { key: 'outcome',   label: 'Outcome (mm)',             editable: true },
            { key: 'correct',   label: 'Were you right?',          editable: true },
        ],
        exampleRows: [
            ['4 folds + 4 pillars', '±1 cm', '4 cm', ''],
            ['10 folds + 4 pillars', '', '', ''],
            ['3 folds + 6 pillars', '', '', ''],
        ],
    },
    writeUp: {
        prompts: [
            'Predict which fold design makes the phone move the least.',
            'Record the results.',
            'Were you right? Any surprises?',
        ],
    },
    discussion:
        'Earthquakes cause ground vibrations that can collapse poorly designed structures. Engineers design buildings to absorb and distribute energy safely.',
    formulas: [],
    curriculumLinks: [
        { subject: 'Science',               code: 'ACSSU096',  description: 'Earth processes' },
        { subject: 'Design & Technologies', code: 'ACTDEP036', description: 'Testing and improving designs' },
    ],
    maxIterations: 1,
    hasTimer: false,
};

export default earthquakeStructure;
