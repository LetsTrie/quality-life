import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Text from '../../components/Text';
import colors from '../../config/colors';

const ShowContent = ({ container }) => {
  return (
    <ScrollView style={styles.scrollView}>
      {container.map((d, index) => (
        <View
          key={d.description[0]}
          style={[styles.infoContainer, index !== container.length - 1 ? {} : { marginBottom: 20 }]}
        >
          {d.title && <Text style={styles.titleStyle}>{d.title}</Text>}
          {d.description.map((dd, ii) => (
            <Text
              key={dd}
              style={[
                styles.descriptionStyle,
                ii !== d.description.length - 1 && { marginBottom: 20 },
              ]}
            >
              {dd}
            </Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
  },
  infoContainer: {
    padding: 16,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  titleStyle: {
    fontSize: 22.5,
    color: colors.dark,
    fontWeight: 'bold',
    marginBottom: 13,
    textAlign: 'center',
  },
  descriptionStyle: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
    textAlign: 'justify',
    marginBottom: 10,
  },
});

export default ShowContent;
