import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

import Text from './Text';
import colors from '../config/colors';

function PickerItem({ item, onPress, onChange, selectedItem }) {
    const handlePress = () => {
        onPress();
        if (onChange) {
            onChange(item.value);
        }
    };
    return (
        <TouchableOpacity onPress={handlePress}>
            <Text style={[styles.text, selectedItem.value === item.value && styles.selectedText]}>
                {item.label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    text: {
        padding: 10,
        borderBottomColor: '#c9d6df',
        borderBottomWidth: 1.2,
        paddingLeft: 13,
        color: '#2b2e4a',
        fontSize: 18.5,
    },
    selectedText: {
        backgroundColor: colors.overlay,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: colors.primary,
        paddingHorizontal: 15,
        color: colors.textSecondary,
    },
});

export default PickerItem;
