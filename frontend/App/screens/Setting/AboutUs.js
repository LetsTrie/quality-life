import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Text from '../../components/Text';
import { aboutUs } from './content';
import ShowContent from './ShowContent';
const AboutUs = () => {
  return (
    <>
      <ShowContent container={aboutUs} />
    </>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    padding: 12,
    margin: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 3,
  },
  titleStyle: {
    paddingVertical: 10,
    fontSize: 30,
  },
  descriptionStyle: {
    fontSize: 16.5,
    fontWeight: '300',
    lineHeight: 28,
    color: '#444',
    paddingBottom: 30,
  },
});

export default AboutUs;
