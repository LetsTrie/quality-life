import React from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View } from 'react-native';

const ProfileActModal = ({modalVisibleAct, setModalVisibleAct, activation}) => {
  
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleAct}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisibleAct(!modalVisibleAct);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>Are you sure?</Text>
            <View style={styles.buttonDiv}>
            <Pressable
              style={[styles.button, styles.buttonYes]}
              onPress={activation}
              >
              <Text style={styles.textStyle}>Yes</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonNo]}
              onPress={() => setModalVisibleAct(!modalVisibleAct)}>
              <Text style={styles.textStyle}>No</Text>
            </Pressable>
            </View>
          </View>
        </View>
      </Modal> 
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 2,
  },
  buttonDiv:{
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonYes: {
    backgroundColor: 'green',
    marginRight: 10,
  },
  buttonNo: {
    backgroundColor: 'red',
  },
  textStyle: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textStylebtn: {
    color: '#333',
    textAlign: 'left',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default ProfileActModal;