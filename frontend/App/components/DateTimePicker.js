import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import Text from './Text';
import defaultStyles from '../config/styles';

function AppDateTimePicker({
  icon,
  placeholder,
  mode = 'date',
  onSelectDateTime,
  selectedDateTime,
  style,
  width = '100%',
}) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (_event, date) => {
    setShowPicker(false);
    if (date) {
      onSelectDateTime(date);
    }
  };

  const formattedDate = selectedDateTime
    ? selectedDateTime.toLocaleDateString() 
    : '';
  const formattedTime = selectedDateTime
    ? selectedDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) 
    : '';

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setShowPicker(true)}>
        <View style={[styles.container, { width }, style]}>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={defaultStyles.colors.medium}
              style={styles.icon}
            />
          )}
          {selectedDateTime ? (
            <Text style={styles.text}>
              {mode === 'date' ? formattedDate : formattedTime}
            </Text>
          ) : (
            <Text style={[styles.placeholder]}>{placeholder}</Text>
          )}

          <MaterialCommunityIcons
            name={mode === 'date' ? 'calendar' : 'clock'}
            size={20}
            color={defaultStyles.colors.medium}
            style={{ marginTop: 2}}
          />
        </View>
      </TouchableWithoutFeedback>
      
      {selectedDateTime && (
        <TouchableOpacity 
          onPress={() => onSelectDateTime(null)} 
          style={styles.clearButton}
        >
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      )}

      {showPicker && (
        <DateTimePicker
          value={selectedDateTime || new Date()}
          mode={mode}
          display="default"
          onChange={handleChange}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultStyles.colors.light,
    borderRadius: 5,
    flexDirection: 'row',
    padding: 15,
    marginTop: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    backgroundColor: '#fff',
  },
  icon: {
    marginRight: 10,
    alignSelf: 'center',
  },
  placeholder: {
    color: defaultStyles.colors.medium,
    flex: 1,
  },
  text: {
    flex: 1,
  },
  clearButton: {
    marginTop: 5,
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  clearText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AppDateTimePicker;
