const TEST_ADMOB_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_ADMOB_IOS = 'ca-app-pub-3940256099942544~1458002511';

export default ({ config }) => ({
    expo: {
        name: 'STEMM Lab',
        slug: 'stemm-lab',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: 'stemmlab',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,

        ios: {
            supportsTablet: true,
            bundleIdentifier: 'com.stemmlab.app',
        },

        android: {
            package: 'com.stemmlab.app',
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            adaptiveIcon: {
                backgroundColor: '#0F172A',
                foregroundImage: './assets/images/android-icon-foreground.png',
                backgroundImage: './assets/images/android-icon-background.png',
                monochromeImage: './assets/images/android-icon-monochrome.png',
            },
            googleMaps: {
                apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
            },
            permissions: [
                'android.permission.RECORD_AUDIO',
                'android.permission.MODIFY_AUDIO_SETTINGS',
                'android.permission.ACCESS_COARSE_LOCATION',
                'android.permission.ACCESS_FINE_LOCATION',
            ],
        },

        web: {
            output: 'static',
            favicon: './assets/images/favicon.png',
        },

        plugins: [
            'expo-router',
            'expo-asset',
            [
                'expo-splash-screen',
                {
                    image: './assets/images/splash-icon.png',
                    imageWidth: 200,
                    resizeMode: 'contain',
                    backgroundColor: '#0F172A',
                    dark: { backgroundColor: '#0F172A' },
                },
            ],
            'expo-audio',
            [
                'expo-notifications',
                {
                    icon: './assets/images/icon.png',
                    color: '#4F46E5',
                    defaultChannel: 'stemm-alerts',
                },
            ],
            [
                'expo-location',
                {
                    locationWhenInUsePermission:
                        'STEMM Lab uses your location to tag where science activities are completed.',
                    locationAlwaysAndWhenInUsePermission:
                        'STEMM Lab uses your location to tag where science activities are completed.',
                },
            ],
            'expo-sqlite',
            'expo-video',
            [
                'expo-camera',
                {
                    cameraPermission: 'STEMM Lab uses the camera to scan record QR codes from other devices.',
                },
            ],
            [
                'expo-image-picker',
                {
                    cameraPermission: 'STEMM Lab uses the camera to record your activity drops and experiments.',
                },
            ],
            [
                'react-native-google-mobile-ads',
                {
                    androidAppId: process.env.ADMOB_ANDROID_APP_ID || TEST_ADMOB_ANDROID,
                    iosAppId: process.env.ADMOB_IOS_APP_ID || TEST_ADMOB_IOS,
                },
            ],
        ],

        experiments: {
            typedRoutes: true,
            reactCompiler: true,
        },

        extra: {
            router: {},
            eas: {
                projectId: '',
            },
        },

        runtimeVersion: {
            policy: 'appVersion',
        },
    },
});
