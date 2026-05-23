import { useVideoPlayer, VideoView } from 'expo-video';
import React from 'react';
import { StyleSheet } from 'react-native';

import { BorderRadius } from '@/constants/theme';

/**
 * Inline video player for reviewing a recorded activity clip. Native controls
 * let the team scrub frame-by-frame (e.g. to read off the landing contact
 * time for the parachute g-force calculation).
 */
export function VideoReview({ uri }: { uri: string }) {
    const player = useVideoPlayer(uri, (p) => {
        p.loop = false;
    });

    return (
        <VideoView
            player={player}
            style={styles.video}
            nativeControls
            contentFit="contain"
            allowsFullscreen
        />
    );
}

const styles = StyleSheet.create({
    video: {
        width: '100%',
        height: 220,
        borderRadius: BorderRadius.lg,
        backgroundColor: '#000000',
    },
});

export default VideoReview;
