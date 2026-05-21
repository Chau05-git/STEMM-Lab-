import type { ActivityDefinition } from '@/constants/types';

const parachuteDrop: ActivityDefinition = {
    id: 'parachute-drop',
    name: 'Parachute Drop Challenge',
    shortDescription: 'Design and test parachutes to reduce landing speed and impact force.',
    overview:
        'Students design, build, and test a parachute for a small toy to reduce its landing speed and impact force. Teams iterate their designs under time and material constraints, aiming to achieve the slowest and safest landing within a target area.',
    category: 'engineering',
    categoryLabel: 'Engineering + Physics',
    icon: '🪂',
    sensorType: 'camera',
    sensorLabel: 'Camera (slow-motion video)',
    keyMeasurement: 'Drop time, velocity, drag force, g-force',
    equipment: [
        'Mobile phone with STEMM Lab app',
        'Small toy (e.g. army toy soldier)',
        'Table or elevated surface',
        'Paper or plastic',
        'String', 'Scissors', 'Tape',
    ],
    instructions: [
        { step: 1, text: 'Drop the toy without a parachute and record the fall (baseline test).', requiresSensor: true, sensorLabel: 'Start Recording' },
        { step: 2, text: 'Build a parachute using provided materials.' },
        { step: 3, text: 'Drop the toy from the same height and record the fall.', requiresSensor: true, sensorLabel: 'Start Recording' },
        { step: 4, text: 'Review speed and landing accuracy results in the app.' },
        { step: 5, text: 'Redesign and test up to three prototypes within 20 minutes.' },
        { step: 6, text: 'Upload videos, results, and team reflections.' },
    ],
    dataTable: {
        columns: [
            { key: 'action',    label: 'Action / Design',                               editable: true },
            { key: 'predicted', label: 'Predicted time to hit ground',                  editable: true },
            { key: 'actual',    label: 'Actual time to first hit ground',               editable: true },
            { key: 'correct',   label: 'Were you right?',                               editable: true },
            { key: 'slowmo',    label: 'Time from first hit to stop moving (slow-mo)',  editable: true },
        ],
        exampleRows: [
            ['No parachute (baseline)', '', '', '', ''],
            ['Plastic with four corners tied to toy', '', '', '', ''],
            ['Design 3', '', '', '', ''],
        ],
    },
    writeUp: {
        prompts: [
            'Predict which parachute design was the best.',
            'Sketch each design.',
            'Record the times of each design.',
            'Were you correct in your timings?',
            'What design was the easiest to make?',
        ],
    },
    discussion:
        'Gravity pulls objects downward, causing them to speed up as they fall. A parachute increases air resistance (drag). Drag acts upward, opposing the motion and slowing the fall. A slower fall reduces the force when the toy hits the ground, making the landing safer.',
    formulas: [
        { name: 'Final Velocity',     formula: 'v = distance / time',                       example: '1.0 m ÷ 0.5 s = 2.0 m/s',              level: 'primary'   },
        { name: 'Acceleration',       formula: 'a = (v_final − v_initial) / time',           example: '(2.0 − 0) ÷ 0.5 = 4.0 m/s²',          level: 'secondary' },
        { name: 'Net Force',          formula: 'F_net = mass × acceleration',                example: '0.20 × 4.0 = 0.8 N',                   level: 'secondary' },
        { name: 'Weight',             formula: 'W = mass × g',                               example: '0.20 × 9.8 = 1.96 N',                  level: 'secondary' },
        { name: 'Drag Force',         formula: 'F_drag = Weight − Net Force',                example: '1.96 − 0.8 = 1.16 N',                  level: 'secondary' },
        { name: 'G-Force (no bounce)',formula: 'g = (v_impact / t_contact) ÷ 9.8',          example: '(2.0 / 0.05) ÷ 9.8 ≈ 4.1 g',          level: 'secondary' },
        { name: 'G-Force (bounce)',   formula: 'g = ((v_impact + v_up) / t_contact) ÷ 9.8', example: '((2.0+1.47)/0.02) ÷ 9.8 ≈ 17.7 g',    level: 'secondary' },
    ],
    curriculumLinks: [
        { subject: 'Science',               code: 'ACSSU076 / ACSSU117', description: 'Forces affect motion' },
        { subject: 'Science',               code: 'ACSIS124',             description: 'Planning and conducting investigations' },
        { subject: 'Science',               code: 'ACSIS126',             description: 'Analysing patterns in data' },
        { subject: 'Design & Technologies', code: 'ACTDEP036',            description: 'Generate, test, and improve solutions' },
        { subject: 'Mathematics',           code: 'ACMMG108',             description: 'Measuring speed' },
        { subject: 'Mathematics',           code: 'ACMSP147',             description: 'Comparing data and averages' },
    ],
    maxIterations: 1,
    hasTimer: true,
    timerMinutes: 20,
};

export default parachuteDrop;
