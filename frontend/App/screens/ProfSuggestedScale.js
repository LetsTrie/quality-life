import React, { useEffect, useState } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import Quizes from '../components/Quiz/Quizes';
import data from '../data/profScales';
import BaseUrl from '../config/BaseUrl';
import axios from 'axios';
import { logoutAction } from '../redux/actions/auth';
import Text from '../components/Text';
import colors from '../config/colors';

const ProfSuggestedScale = ({ navigation, route, ...props }) => {
  const { jwtToken, logoutAction } = props;
  const { profId, notificationId, questionId, appointmentId } = route.params;
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const questionObject = data.find((d) => d.id === questionId);
  const questions = questionObject?.ques;

  const [answers, setAnswers] = useState(
    new Array(questions.length).fill(null)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwtToken}`,
  };

  useEffect(() => {
    const fld = {
      profId,
      questionId,
    };
    axios
      .post(`${BaseUrl}/user/suggested-scale/check`, fld, { headers })
      .then((res) => {
        if (res.data.found) {
          setAlreadySubmitted(true);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (submitted) {
      setIsLoading(true);
      let totalWeight = 0;
      let maxWeight = 0;
      for (let index = 0; index < answers.length; index++) {
        const maxx = Math.max(...questions[index].options.map((o) => o.weight));
        const wght = questions[index].options.find(
          (o) => o.label === answers[index]
        ).weight;
        totalWeight += wght;
        maxWeight += maxx;
      }
      let stage;
      for (let j = 0; j < questionObject.range.length; j++) {
        if (
          questionObject.range[j].min <= totalWeight &&
          questionObject.range[j].max >= totalWeight
        ) {
          stage = questionObject.range[j].severity;
          break;
        }
      }

      const fld = {
        profId,
        notificationId,
        appointmentId,
        questionId,
        totalWeight,
        stage,
        maxWeight,
        answers,
      };
      axios
        .post(`${BaseUrl}/user/submit-prof-scale`, fld, { headers })
        .then((res) => {
          navigation.navigate('ProfScaleResult', {
            totalWeight,
            stage,
            maxWeight,
            questionId,
          });
        })
        .catch((err) => {
          console.log(err);
          logoutAction();
        })
        .finally(() => {
          setIsLoading(true);
        });
    }
  }, [submitted]);

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {isLoading ? (
        <ActivityIndicator size='large' color={colors.primary} />
      ) : (
        <>
          {alreadySubmitted ? (
            <Text
              style={{
                paddingTop: 10,
                textAlign: 'center',
                fontSize: 25,
                fontWeight: 'bold',
              }}
            >
              Already Submitted
            </Text>
          ) : (
            <ScrollView>
              <Quizes
                questions={questions}
                answers={answers}
                setAnswers={setAnswers}
                setSubmitted={setSubmitted}
                isLoading={isLoading}
              />
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
};

const mapStateToProps = (state) => ({
  name: state.auth.name,
  photoUrl: state.auth.photoUrl,
  jwtToken: state.auth.jwtToken,
});

export default connect(mapStateToProps, { logoutAction })(ProfSuggestedScale);
