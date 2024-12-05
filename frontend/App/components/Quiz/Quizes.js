import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Text from '../Text';
import { ProgressBar } from 'react-native-paper';
import colors from '../../config/colors';
import OptionForm from './OptionForm';

const Quizes = ({ questions, answers, setAnswers, setSubmitted, isLoading }) => {
  let [currentQuestion, setCurrentQuestion] = useState(0);
  const handleQuestionChange = (next, prev) => {
    setTimeout(() => {
      if (next && currentQuestion + 1 < questions.length) {
        setCurrentQuestion((prevState) => prevState + 1);
      }
      if (prev && currentQuestion > 0) {
        setCurrentQuestion((prevState) => prevState - 1);
      }
    }, 100);
  };

  const disabledButton = {
    color: 'rgba(0, 0, 0, 0.26)',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  };

  const SubmitButton = () => {
    if (currentQuestion !== questions.length - 1) return null;
    let addiStyle = {};
    let lastPosition = false;

    if (!answers[questions.length - 1]) {
      addiStyle = { ...disabledButton };
      lastPosition = true;
    }
    return (
      <TouchableOpacity
        style={[styles.buttonStyle, addiStyle]}
        onPress={!lastPosition ? () => setSubmitted(true) : null}
        disabled={lastPosition}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    );
  };

  const PreviousButton = () => {
    let init = currentQuestion === 0 ? true : false;
    return (
      <TouchableOpacity
        style={styles.buttonStyle}
        disabled={init}
        onPress={init ? null : () => handleQuestionChange(false, true)}
      >
        <Text style={styles.buttonText}>Previous</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.quizContainer}>
      <Text style={styles.questionNumber}>
        Questions {currentQuestion + 1} of {questions.length}
      </Text>

      <ProgressBar color={colors.primary} progress={(currentQuestion + 1) / questions.length} />
      <View style={styles.quizes}>
        {questions.map((q, index) => {
          return index === currentQuestion ? (
            <View key={q.question}>
              <Text style={styles.questionText}>{q.question}</Text>

              <OptionForm
                options={q.options}
                handleQuestionChange={handleQuestionChange}
                answers={answers}
                setAnswers={setAnswers}
                currentQuestion={currentQuestion}
              />
            </View>
          ) : null;
        })}
        <View style={styles.twoButtons}>
          {isLoading ? (
            <View
              style={{
                textAlign: 'center',
                width: '100%',
                paddingTop: 5,
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              <PreviousButton />
              <SubmitButton />
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quizContainer: {
    padding: 18,
    paddingTop: 20,
  },
  questionNumber: {
    fontSize: 17,
    paddingBottom: 15,
    color: '#444',
    fontWeight: '700',
  },
  quizes: {
    paddingVertical: 20,
    paddingTop: 26,
  },
  questionText: {
    fontSize: 20,
    paddingVertical: 6,
    paddingBottom: 20,
    lineHeight: 30,
  },
  twoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonStyle: {
    backgroundColor: colors.primary,
    paddingHorizontal: 17,
    paddingVertical: 12,
    marginVertical: 14,
    borderRadius: 5,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    letterSpacing: 0.3,
  },
});

export default Quizes;
