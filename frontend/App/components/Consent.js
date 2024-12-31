import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from './Button';
import Text from './Text';
import colors from '../config/colors';

const Consent = ({ header, description, buttonTitle, redirectTo }) => {
    const navigation = useNavigation();

    const handlePress = async () => {
        try {
            navigation.navigate(redirectTo);
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {header && (
                <Text style={styles.headerText} accessibilityLabel={header}>
                    {header}
                </Text>
            )}

            <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText} accessibilityLabel={description}>
                    {description}
                </Text>
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title={buttonTitle}
                    style={styles.button}
                    textStyle={styles.buttonText}
                    onPress={handlePress}
                    accessibilityLabel={buttonTitle}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    header: {
        paddingTop: 5,
        marginBottom: 20,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        textAlign: 'center',
        paddingBottom: 15,
    },
    descriptionContainer: {
        marginBottom: 16,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'justify',
        color: colors.textSecondary,
        letterSpacing: 0.3,
    },
    buttonContainer: {
        alignItems: 'center',
    },
    button: {
        width: '100%',
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 14,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
    },
});

export default Consent;
