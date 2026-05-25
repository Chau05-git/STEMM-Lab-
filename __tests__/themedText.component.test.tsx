jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { render } from '@testing-library/react-native';
import React from 'react';

import { ThemedText } from '@/components/ThemedText';
import { SettingsProvider } from '@/context/SettingsContext';

describe('ThemedText component', () => {
    it('renders its children inside the settings provider', async () => {
        const { findByText } = render(
            <SettingsProvider>
                <ThemedText>Hello STEMM</ThemedText>
            </SettingsProvider>,
        );
        expect(await findByText('Hello STEMM')).toBeTruthy();
    });

    it('applies the requested typography variant style', async () => {
        const { findByText } = render(
            <SettingsProvider>
                <ThemedText variant="headlineLarge">Big title</ThemedText>
            </SettingsProvider>,
        );
        const node = await findByText('Big title');
        const flat = Array.isArray(node.props.style)
            ? Object.assign({}, ...node.props.style.flat())
            : node.props.style;
        expect(flat.fontSize).toBe(32); // headlineLarge
    });
});
