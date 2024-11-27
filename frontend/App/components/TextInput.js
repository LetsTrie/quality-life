import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import defaultStyles from '../config/styles';

function AppTextInput({ icon, style, width = '92%', textContentType, ...otherProps }) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isPasswordField = textContentType === 'password';

  return (
    <View style={[styles.container, { width }, style]}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={defaultStyles.colors.medium}
          style={styles.icon}
        />
      )}
      <TextInput
        placeholderTextColor={defaultStyles.colors.medium}
        style={[defaultStyles.text, styles.textInputStyle]}
        secureTextEntry={isPasswordField && !isPasswordVisible}
        textContentType={textContentType}
        {...otherProps}
      />
      {isPasswordField && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible((prevState) => !prevState)}
          style={styles.eyeIcon}
        >
          <MaterialCommunityIcons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={20}
            color={defaultStyles.colors.medium}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultStyles.colors.light,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginTop: 10,
  },
  icon: {
    marginRight: 10,
  },
  textInputStyle: {
    flex: 1,
  },
  eyeIcon: {
    marginLeft: 10,
    alignSelf: 'center',
  },
});

export default AppTextInput;
