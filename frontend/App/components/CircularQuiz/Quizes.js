import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import colors from '../../config/colors';
import Text from '../Text';
import CircularPicker from './index';

const Quizes = ({
  questions,
  answers,
  setAnswers,
  setSubmitted,
  isLoading,
}) => {
  const [ans, setAns] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const handleChange = (a) => setAns(parseInt(a));

  const handleQuestionChange = (next, prev) => {
    setTimeout(() => {
      if (next && currentQuestion + 1 < questions.length) {
        setAns(answers[currentQuestion + 1] ?? 0);
        setCurrentQuestion((prevState) => prevState + 1);
      }
      if (prev && currentQuestion > 0) {
        setAns(answers[currentQuestion - 1]);
        setCurrentQuestion((prevState) => prevState - 1);
      }
    }, 100);
  };

  const NextSubmitButton = () => {
    let lastPosition = false;
    if (currentQuestion == questions.length - 1) lastPosition = true;

    const onPressHandler = () => {
      const prevAnswers = [...answers];
      prevAnswers[currentQuestion] = ans;
      setAnswers(prevAnswers);
      if (lastPosition) setSubmitted(true);
      else handleQuestionChange(true, false);
    };
    return (
      <TouchableOpacity style={styles.buttonStyle} onPress={onPressHandler}>
        <Text style={styles.buttonText}>
          {lastPosition ? 'Submit' : 'Next'}
        </Text>
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

      <ProgressBar
        color={colors.primary}
        progress={(currentQuestion + 1) / questions.length}
      />
      <View style={styles.quizes}>
        {questions.map((q, index) => {
          return index === currentQuestion ? (
            <View key={q}>
              <Text style={styles.questionText}>{q}</Text>
              <View style={{ paddingBottom: 13 }}>
                <CircularPicker
                  size={270}
                  strokeWidth={40}
                  steps={[25, 50, 75, 100]}
                  gradients={{
                    0: ['rgb(52, 199, 89)', 'rgb(48, 209, 88)'],
                    50: ['rgb(255, 97, 99)', 'rgb(247, 129, 119)'],
                  }}
                  onChange={handleChange}
                  defaultPos={answers[currentQuestion] ?? 0}
                >
                  <>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 50,
                        marginBottom: 8,
                        fontWeight: 'bold',
                        color: '#333',
                      }}
                    >
                      {ans}
                    </Text>
                  </>
                </CircularPicker>
              </View>
            </View>
          ) : null;
        })}
        <View>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 15,
              lineHeight: 22,
              color: '#555',
              marginTop: -8,
              paddingHorizontal: 2,
            }}
          >
            এখানে 0 মানে হচ্ছে একেবারেই না এবং 100 মানে হচ্ছে সর্বোচ্চ পরিমানে
          </Text>
        </View>
        {isLoading ? (
          <View
            style={{
              textAlign: 'center',
              width: '100%',
              paddingTop: 5,
            }}
          >
            <ActivityIndicator size='large' color={colors.primary} />
          </View>
        ) : (
          <View style={styles.twoButtons}>
            <PreviousButton />
            <NextSubmitButton />
          </View>
        )}
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
    fontSize: 22.5,
    paddingVertical: 6,
    paddingBottom: 16,
    lineHeight: 33,
    textAlign: 'center',
    paddingTop: 0,
  },
  twoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonStyle: {
    backgroundColor: colors.primary,
    paddingHorizontal: 17,
    paddingVertical: 12,
    marginVertical: 10,
    borderRadius: 5,
    marginBottom: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    letterSpacing: 0.3,
  },
});

export default Quizes;
