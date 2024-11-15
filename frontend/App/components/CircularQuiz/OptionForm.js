import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Option from './Option';

const OptionForm = ({
  options,
  handleQuestionChange,
  answers,
  setAnswers,
  currentQuestion,
}) => {
  let [selected, setSelected] = useState(null);
  const handleClick = (ans) => {
    const prevAnswers = [...answers];
    prevAnswers[currentQuestion] = ans;
    setAnswers(prevAnswers);
    setSelected(ans);
  };
  return (
    <View style={styles.OptionListContainer}>
      {options.map((op) => (
        <Option
          key={op.label}
          text={op.label}
          selected={selected}
          handleClick={handleClick}
          handleQuestionChange={handleQuestionChange}
          answers={answers}
          setAnswers={setAnswers}
          currentQuestion={currentQuestion}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  OptionListContainer: {
    paddingBottom: 3,
  },
});

export default OptionForm;
