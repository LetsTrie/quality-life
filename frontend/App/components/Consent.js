import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Button from './Button';
import Text from './Text';

const Consent = ({ header, description, buttonTitle, redirectTo }) => {
  const navigation = useNavigation();

  const handlePress = async () => navigation.navigate(redirectTo);

  return (
    <>
      <ScrollView style={{ backgroundColor: 'white' }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{header}</Text>
        </View>
        <View style={styles.desc}>
          <Text style={styles.descText}>{description}</Text>
        </View>
        <Button
          title={buttonTitle}
          style={{ marginBottom: 5, padding: 12.5, marginTop: 15 }}
          textStyle={{ fontSize: 22 }}
          onPress={handlePress}
        />
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 10,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 33,
    color: '#333',
    paddingTop: 6,
    paddingBottom: 2,
  },
  desc: {
    paddingHorizontal: 15,
  },
  descText: {
    fontSize: 17,
    letterSpacing: 0.5,
    textAlign: 'justify',
    lineHeight: 26.5,
    color: '#555',
  },
});

export default Consent;
