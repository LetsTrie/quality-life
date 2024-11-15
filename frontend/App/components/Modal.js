import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from './Button';

const AppModal = ({ modalVisible, setModalVisible, title, description }) => {
  return (
    <>
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView
              style={styles.scrollViewStyle}
              showsVerticalScrollIndicator={false}
            >
              <View>
                <Text style={styles.modalHeading}>{title}</Text>
                {description.map((d) => (
                  <View key={d}>
                    {d.startsWith(':::') ? (
                      <Text style={styles.modalBoldText}>{d.slice(3)}</Text>
                    ) : (
                      <Text style={styles.modalText}>{d}</Text>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
            <Button
              onPress={() => setModalVisible(!modalVisible)}
              title='Close'
            ></Button>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    marginBottom: 12,
  },
  modalView: {
    margin: 10,
    marginTop: 15,
    marginBottom: 30,
    padding: 30,
    paddingHorizontal: 25,
    backgroundColor: 'white',
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeading: {
    color: 'gray',
    fontSize: 27,
    paddingVertical: 10,
    paddingBottom: 25,
    alignSelf: 'center',
    textAlign: 'center',
    lineHeight: 39,
  },
  modalText: {
    fontSize: 17,
    lineHeight: 29,
    color: '#555',
    paddingBottom: 5,
    textAlign: 'justify',
  },
  modalBoldText: {
    fontSize: 17,
    lineHeight: 29,
    color: '#444',
    paddingBottom: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollViewStyle: {
    marginBottom: 20,
    minHeight: '82%',
  },
});

export default AppModal;
