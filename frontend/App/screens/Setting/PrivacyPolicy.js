import React from 'react';
import ShowContent from './ShowContent';
import { policy } from './content';
import { View } from 'react-native';
const PrivacyPolicy = () => {
  return (
    <>
      <View>
        <ShowContent container={policy} />
      </View>
    </>
  );
};

export default PrivacyPolicy;
