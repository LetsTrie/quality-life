import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Text from '../../components/Text';

const ShowContent = ({ container }) => {
  return (
    <ScrollView style={{ backgroundColor: '#eee' }}>
      {container.map((d) => (
        <View key={d.description[0]} style={styles.infoContainer}>
          {d.title && (
            <Text style={styles.header} style={styles.titleStyle}>
              {d.title}
            </Text>
          )}
          {d.description.map((dd, ind) => (
            <Text
              key={dd}
              style={[
                styles.descriptionStyle,
                ind != d.description.length - 1 ? { paddingBottom: 20 } : {},
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
  infoContainer: {
    padding: 12,
    margin: 15,
    marginBottom: 2,
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 3,
    paddingBottom: 20,
  },
  titleStyle: {
    paddingVertical: 5,
    paddingBottom: 8,
    fontSize: 28,
    color: '#444',
    fontWeight: 'bold',
    marginVertical: 7,
    textAlign: 'center',
  },
  descriptionStyle: {
    paddingHorizontal: 4,
    fontSize: 16.5,
    fontWeight: '300',
    lineHeight: 28,
    color: '#444',
    textAlign: 'justify',
  },
});

export default ShowContent;
