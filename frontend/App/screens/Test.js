import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import Quizes from '../components/Quiz/Quizes';
import Quizes2 from '../components/Quiz/Quizes2';
import BaseUrl from '../config/BaseUrl';
import { chooseTest } from '../config/chooseTest';
import * as T from '../data/type';
import {
  mentalHeathProfileAction,
  updateDnAction,
  updateMcnAction,
  updateMojAction,
} from '../redux/actions/user';

import coronaProfile from '../data/coronaProfile';
import coronaProfile2 from '../data/coronaProfile2';

const Test = ({ navigation, route, ...props }) => {
  const navLink = route.params.link;
  const TestObject = chooseTest(navLink);
  const questions = TestObject.questions;
  const [submitted, setSubmitted] = useState(false);
  const [questionsExp,setQuestionsExp]=useState(coronaProfile?.questions)
  const [changeQ, setChangeQ]=useState(false)
  const [answers, setAnswers] = useState(
    new Array(questions.length).fill(null)
  );
  const [isLoading, setIsLoading] = useState(false);
  const {
    updateDnAction,
    updateMcnAction,
    updateMojAction,
    mentalHeathProfileAction,
  } = props;

  let { preTest } = route.params;
  let postTest = !preTest;

  function goToAnotherPage(
    redirectTo,
    navigation,
    route,
    score = null,
    stage = null,
    maxWeight = 0
  ) {
    switch (redirectTo) {
      case T.SHOW_VIDEO:
        navigation.navigate('VideoScreen', {
          ...route.params,
          needAction: false,
        });
        break;
      case T.HELP_CENTER:
        navigation.navigate('HelpCenter', {
          ...route.params,
          fromProfile: true,
        });
        break;
      case T.RESULT_OUT_OF_100:
        navigation.navigate('QuizResultOutOf100', {
          ...route.params,
          totalWeight: score,
          stage,
          maxWeight,
        });
        break;

      case T.NO_ACTION:
        navigation.navigate('Profile', {
          ...route.params,
        });
        break;

      default:
        navigation.navigate('Homepage');
        break;
    }
  }
  
  useEffect(() => {
    if (submitted) {
      setIsLoading(true);
      const { type } = route.params;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${props.jwtToken}`,
      };
      if (route.params.fromProfile) {
        console.log({ postTest });
        axios
          .post(
            `${BaseUrl}/user/test`,
            { answers, type, score: 0, fromProfile: true, postTest },
            { headers }
          )
          .then(async (res) => {
            mentalHeathProfileAction(route.params.link);
            const goToProfile = [
              'childCare',
              'domesticViolence',
              'suicideIdeation',
              'psychoticProfile',
            ];
            const convert = [...new Set(answers)];
            if (
              goToProfile.includes(route.params.link) &&
              convert.length === 1 &&
              convert[0] === 'না'
            ) {
              navigation.navigate('Profile');
            } else {
              goToAnotherPage(route.params.redirectTo, navigation, route);
            }

            setIsLoading(false);
          })
          .catch((e) => {
            console.log(e);
            setIsLoading(false);
          });
      } else {
        let index = 0;
        let w = 0;
        let maxWeight = 0;

        for (let a of answers) {
          w += questions[index].options.filter((x) => x.label === a)[0].weight;
          let mx = -1;
          for (let o of questions[index].options)
            if (mx < o.weight) mx = o.weight;

          maxWeight += mx;
          index++;
        }
        w = Math.round(w);

        let range = [];
        if (type === 'manoshikChapNirnoy') range = [13, 26];
        else if (type === 'duschintaNirnoy') range = [54, 66];
        if (type === 'manoshikObosthaJachaikoron') range = [4, 9];

        let stage;
        if (w <= range[0]) stage = 'স্বাভাবিক মাত্রা';
        else if (w <= range[1]) stage = 'মাঝামাঝি মাত্রা';
        else stage = 'তীব্র মাত্রা';

        console.log({ postTest });

        axios
          .post(
            `${BaseUrl}/user/test`,
            {
              answers,
              type,
              score: w,
              severity: stage,
              totalScore: maxWeight,
              postTest,
            },
            { headers }
          )
          .then(async (res) => {
            const { score, type } = res.data.test;
            const { mDate } = res.data;

            if (type === 'duschintaNirnoy') updateDnAction(score, mDate);
            if (type === 'manoshikChapNirnoy') updateMcnAction(score, mDate);
            if (type === 'manoshikObosthaJachaikoron') {
              updateMojAction(score, mDate);
            }

            goToAnotherPage(
              route.params.redirectTo,
              navigation,
              route,
              score,
              stage,
              maxWeight
            );
            setIsLoading(false);
          })
          .catch((e) => {
            console.log(e);
            setIsLoading(false);
          });
      }
    }
  }, [submitted]);

  useEffect(()=>{
    if(changeQ === true){
      setQuestionsExp(coronaProfile2?.questions)
    }
    if(changeQ === false){
      setQuestionsExp(coronaProfile?.questions)
    }
  },[changeQ])

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView>
      {/* new quiz created for coronaProfile */}
       {route?.params?.link === 'coronaProfile'? <Quizes2
          questions={questionsExp}
          answers={answers}
          setAnswers={setAnswers}
          setSubmitted={setSubmitted}
          isLoading={isLoading}
          setChangeQ={setChangeQ}
        />:
        <Quizes
        questions={questions}
        answers={answers}
        setAnswers={setAnswers}
        setSubmitted={setSubmitted}
        isLoading={isLoading}
      /> } 
      </ScrollView>
    </View>
  );
};

const mapStateToProps = (state) => ({
  name: state.auth.name,
  photoUrl: state.auth.photoUrl,
  jwtToken: state.auth.jwtToken,
});

export default connect(mapStateToProps, {
  updateDnAction,
  updateMcnAction,
  updateMojAction,
  mentalHeathProfileAction,
})(Test);
