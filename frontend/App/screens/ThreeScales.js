import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';
import Box from '../components/Homepage/Box';
import * as Type from '../data/type';
import getMatra from '../helpers/getMatra';
import { useBackPress } from '../hooks';
import constants from '../navigation/constants';

// Updated At: 22/03/2024
// Updated By: MD. Sakib Khan

const SCREEN_NAME = constants.THREE_SCALES;

const ThreeScales = () => {
  const navigation = useNavigation();
  useBackPress(SCREEN_NAME);

  const { msm_score, moj_score, moj_date, mcn_score, mcn_date, dn_score, dn_date } = useSelector(
    (state) => state.user
  );

  const [_, lastMojScore, lastMcnScore, lastDnScore] = getMatra(
    msm_score,
    moj_score,
    mcn_score,
    dn_score
  );

  const navigate = (link, type) => {
    navigation.navigate('AskForTest', {
      link,
      redirectTo: Type.RESULT_OUT_OF_100,
      type,
      preTest: false,
    });
  };

  return (
    <ScrollView style={{ backgroundColor: 'white' }}>
      <View>
        <Box
          source={require('../assests/images/Picture1.png')}
          name="মানসিক অবস্থা যাচাইকরণ (General Health Questionnaire (GHQ)-12)"
          lastScore={moj_date ? lastMojScore : undefined}
          lastDate={moj_date ? moj_date : undefined}
          onPress={() => navigate(Type.GHQ, 'manoshikObosthaJachaikoron')}
        />
        <Box
          source={require('../assests/images/Picture2.png')}
          name="মানসিক চাপ নির্ণয় (Perceived Stress Scale (PSS)- 10)"
          lastScore={mcn_date ? lastMcnScore : undefined}
          lastDate={mcn_date ? mcn_date : undefined}
          onPress={() => navigate(Type.PSS, 'manoshikChapNirnoy')}
        />
        <Box
          source={require('../assests/images/Picture3.png')}
          name="দুশ্চিন্তা নির্ণয় (Anxiety Scale)"
          lastScore={dn_date ? lastDnScore : undefined}
          lastDate={dn_date ? dn_date : undefined}
          onPress={() => navigate(Type.ANXIETY, 'duschintaNirnoy')}
        />
      </View>
    </ScrollView>
  );
};

export default ThreeScales;
