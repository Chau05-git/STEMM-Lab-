const { ExecutionEnvironment } = jest.requireActual('expo-constants');

module.exports = {
    ...jest.requireActual('expo-constants'),
    executionEnvironment: ExecutionEnvironment.Bare,
    expoConfig: {
        name: 'STEMM Lab',
        slug: 'stemm-lab',
        extra: {},
    },
};
