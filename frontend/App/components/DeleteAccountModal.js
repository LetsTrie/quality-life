import React from 'react';
import { Modal, StyleSheet, Text, Pressable, View } from 'react-native';
import colors from '../config/colors';

const DeleteAccountModal = ({ modalVisible, setModalVisible, onPress, title }) => {
  return (
    <Modal
      animationType="fade"
      visible={modalVisible}
      onRequestClose={() => setModalVisible(!modalVisible)}
      transparent={true}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.promptText}>{title}</Text>
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.button, styles.buttonYes]} onPress={onPress}>
              <Text style={styles.buttonText}>হ্যাঁ</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonNo]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.buttonText}>না</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  promptText: {
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
    lineHeight: 26,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 25,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonYes: {
    backgroundColor: colors.success,
  },
  buttonNo: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DeleteAccountModal;
