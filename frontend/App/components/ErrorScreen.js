import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const ErrorScreen = ({ onRetry }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Oops!</Text>
            <Text style={styles.message}>Something went wrong. Please try again later.</Text>
            {onRetry && (
                <TouchableOpacity style={styles.button} onPress={onRetry}>
                    <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    image: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ErrorScreen;
