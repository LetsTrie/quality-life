import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Text from '../../components/Text';

const ShowContent = ({ container }) => {
  return (
    <ScrollView style={styles.scrollView}>
      {container.map((d, index) => (
        <View
          key={d.description[0]}
          style={[styles.infoContainer, index !== container.length - 1 ? {} : { marginBottom: 10 }]}
        >
          {d.title && <Text style={styles.titleStyle}>{d.title}</Text>}
          {d.description.map((dd, ind) => (
            <Text
              key={dd}
              style={[
                styles.descriptionStyle,
                ind !== d.description.length - 1 ? styles.descriptionSpacing : {},
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
    fontSize: 24,
    color: '#334155',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  descriptionStyle: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    color: '#475569',
    textAlign: 'justify',
  },
  descriptionSpacing: {
    marginBottom: 15,
  },
});

export default ShowContent;
