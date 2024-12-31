import React from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View } from 'react-native';
import colors from '../config/colors';

const YesNoModal = ({ modalVisible, setModalVisible, deleteAccount }) => {
  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
        transparent={true}
      >
        <View style={[styles.centeredView, styles.modalContainer]}>
          <View style={styles.modalView}>
            <Text style={styles.promptText}>
            আপনি কি নিশ্চিত? আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলা হবে।
            </Text>
            <View style={styles.buttonDiv}>
              <Pressable style={[styles.button, styles.buttonYes]} onPress={deleteAccount}>
                <Text style={styles.textStyle}>হ্যাঁ</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonNo]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text style={styles.textStyle}>না</Text>
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
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 9,
    elevation: 2,
  },
  buttonDiv: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonYes: {
    backgroundColor: colors.success,
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
  promptText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
    color: '#3f3f3f',
  },
});

export default YesNoModal;
