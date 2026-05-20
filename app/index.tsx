import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>STEMM Lab</Text>
            <Text style={styles.sub}>Real-World STEMM Games</Text>
            <Text style={styles.note}>Phase 1 complete — project foundation ready.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#F8FAFF',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    sub: {
        fontSize: 16,
        color: '#94A3B8',
        marginBottom: 32,
    },
    note: {
        fontSize: 13,
        color: '#4F46E5',
        backgroundColor: '#1E1B4B',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
});
