import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Text from '../Text';
import { RadioButton } from 'react-native-paper';
import colors from '../../config/colors';

const Option = ({
  text,
  selected,
  handleClick,
  handleQuestionChange,
  answers,
  setAnswers,
  currentQuestion,
}) => {
  const onPress = () => {
    handleClick(text);
    handleQuestionChange(true, false);
  };

  const checked = selected === text || answers[currentQuestion] === text;
  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[styles.optionContainer, checked ? styles.selectedOption : {}]}>
        <Text style={[styles.optionText, checked ? styles.selectedOptionText : {}]}>{text}</Text>
        <RadioButton
          value={text}
          status={checked ? 'checked' : 'unchecked'}
          color={colors.primary}
          uncheckedColor={colors.primary}
          style={styles.optionStyle}
          onPress={onPress}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  optionContainer: {
    flexDirection: 'row',
    borderWidth: 0.5,
    elevation: 2,
    borderColor: '#ddd',
    paddingHorizontal: 13.5,
    paddingVertical: 8,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: colors.primary,
    elevation: 1,
  },
  optionText: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    alignSelf: 'center',
  },
  selectedOptionText: {
    color: colors.primary,
  },
});

export default Option;
