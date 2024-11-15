import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Text from '../Text';
import colors from '../../config/colors';
import tests from '../../data/horizontalTab';

const Tab = ({ test }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity>
      <Text
        style={styles.tab}
        onPress={() => navigation.navigate('Test', { ...test })}
      >
        {test.label}
      </Text>
    </TouchableOpacity>
  );
};

const HorizontalTabTest = () => {
  return (
    <View style={styles.horizontalTab}>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        {tests.map((t) => (
          <Tab key={t.label} test={t} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalTab: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  tab: {
    borderColor: colors.primary,
    borderWidth: 2,
    marginRight: 8,
    padding: 3,
    paddingTop: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    color: '#fff',
    elevation: 1,
    fontSize: 16,
    backgroundColor: colors.primary,
  },
});

export default HorizontalTabTest;
