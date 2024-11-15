import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const SeeMoreButton = ({ icon, text, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.button}>
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            style={styles.icon}
          />
        )}
        <Text style={styles.text}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    paddingBottom: 10,
  },
  button: {
    backgroundColor: '#139b64',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    elevation: 1,
    alignItems: 'center',
  },
  icon: {
    fontSize: 19,
    color: '#ffffff',
    marginRight: -3,
  },
  text: {
    color: 'white',
    fontSize: 15,
    paddingLeft: 6,
  },
});

export default SeeMoreButton;
