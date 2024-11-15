import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import { connect } from 'react-redux';
import Button from '../../components/Button';
import Text from '../../components/Text';
import AppTextInput from '../../components/TextInput';
import BaseUrl from '../../config/BaseUrl';
import colors from '../../config/colors';
import { logoutAction } from '../../redux/actions/prof';
import {
  addAllMyClient,
  addAllRequestedClient,
  addOneMyClient,
  removeOneRequestedClient,
} from '../../redux/actions/prof_client';

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const routeName = 'recentlyContacted';

const recentlyContacted = ({ navigation, route, ...props }) => {
  let goToBack = route.params.goToBack ?? 'ProHomepage';
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [curClient, setCurClient] = useState({});
  const [modalError, setModalError] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const {
    jwtToken,
    isAuthenticated,
    reqClients,
    logoutAction,
    addAllRequestedClient,
    removeOneRequestedClient,
    addOneMyClient,
  } = props;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwtToken}`,
  };

  const signOutHandler = () => {
    logoutAction();
    navigation.navigate('LoginPro');
  };

  const confirmHandler = async () => {
    if (!clientId) {
      setModalError('Please give this client an ID');
      return;
    }
    setModalIsLoading(true);
    const body = {
      user: curClient.userId,
      prof: curClient.profId,
      clientId: clientId,
      recContactedPersonId: curClient._id,
    };
    try {
      const response = await axios.post(`${BaseUrl}/prof/add-as-client`, body, {
        headers,
      });
      setModalError(null);
      setModalVisible(!modalVisible);
      setClientId(null);
      removeOneRequestedClient(curClient._id);
      addOneMyClient(response.data.client);
      navigation.navigate('ProMyClients');
    } catch (err) {
      setModalError(err.response.data.message);
    } finally {
      setModalIsLoading(false);
    }
  };

  async function seenAppointment() {
    if (!isAuthenticated) {
      signOutHandler();
      return;
    }
    try {
      const url = `${BaseUrl}/prof/recently-contacted`;
      const response = await axios.get(url, { headers });
      addAllRequestedClient(response.data.contacts);
    } catch (err) {
      if (err?.response?.status === 401) signOutHandler();
    } finally {
      setIsLoading(false);
    }
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    seenAppointment();
    wait(2000).then(() => setRefreshing(false));
  }, []);

  function handleBackButtonClick() {
    navigation.navigate(goToBack);
    return true;
  }

  useEffect(() => {
    seenAppointment();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick
      );
    };
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: 'white' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {isLoading ? (
        <View
          style={{
            textAlign: 'center',
            width: '100%',
            paddingTop: 10,
          }}
        >
          <ActivityIndicator size='large' color={colors.primary} />
        </View>
      ) : (
        <>
          {reqClients.length === 0 ? (
            <Text
              style={{
                textAlign: 'center',
                fontSize: 25,
                fontWeight: 'bold',
                paddingTop: 10,
                color: '#333',
              }}
            >
              No Clients Available
            </Text>
          ) : (
            <>
              {reqClients.map((c) => (
                <View style={styles.blockStyle} key={c.userId}>
                  <Text style={styles.nameStyle}> {c.name} </Text>
                  <View style={styles.iconBlockStyle}>
                    <MaterialCommunityIcons
                      name={'card-account-details'}
                      style={styles.iconStyle}
                    />
                    <Text style={styles.descStyle}> {c.status} </Text>
                  </View>
                  <View style={styles.iconBlockStyle}>
                    <MaterialCommunityIcons
                      name={'map-marker-radius'}
                      style={styles.iconStyle}
                    />
                    <Text style={styles.descStyle}>{c.location}</Text>
                  </View>
                  {/* <View style={styles.iconBlockStyle}>
                <MaterialCommunityIcons
                  name={'clock-time-three'}
                  style={styles.iconStyle}
                />
                <Text style={styles.descStyle}> 08:30AM, 08/03/21 </Text>
              </View> */}

                  <TouchableOpacity
                    style={styles.responseStyle}
                    onPress={() => {
                      setModalVisible(true);
                      setCurClient(c);
                    }}
                  >
                    <View style={styles.buttonContainer}>
                      <Text style={styles.BtnTextStyle}> Add as Client </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

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
                    <Text style={styles.modalHeading}>
                      Do you want to add{' '}
                      <Text
                        style={[styles.modalHeading, { fontWeight: 'bold' }]}
                      >
                        "{curClient.name}"
                      </Text>{' '}
                      as your client?
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#666',
                        textAlign: 'justify',
                        marginBottom: 5,
                      }}
                    >
                      * Before adding as a client, please make sure, you both
                      have communicated through phone calls and client has
                      completed his payments.
                    </Text>

                    <AppTextInput
                      width={'100%'}
                      style={{
                        borderRadius: 10,
                        borderColor: '#eee',
                      }}
                      placeholder='Client ID (i.e. DMC-021)'
                      onChangeText={(text) => setClientId(text)}
                    />

                    {modalError && (
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          color: 'red',
                          paddingTop: 5,
                          textAlign: 'center',
                        }}
                      >
                        {modalError}
                      </Text>
                    )}
                  </View>
                </ScrollView>
                {modalIsLoading ? (
                  <>
                    <ActivityIndicator size='large' color={colors.primary} />
                  </>
                ) : (
                  <View style={styles.twoButtonContainer}>
                    <Button
                      onPress={() => setModalVisible(!modalVisible)}
                      title='Close'
                      style={styles.eachButton}
                    />
                    <Button
                      onPress={confirmHandler}
                      title='Confirm'
                      style={[
                        styles.eachButton,
                        { backgroundColor: '#15aa6e' },
                      ]}
                    />
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  nameStyle: {
    fontSize: 20,
    paddingBottom: 3,
    fontWeight: 'bold',
  },
  blockStyle: {
    padding: 10,
    margin: 10,
    paddingLeft: 8,
    borderColor: 'gray',
    borderWidth: 2,
    borderRadius: 5,
    elevation: 1,
    marginBottom: 0,
  },
  iconBlockStyle: {
    display: 'flex',
    flexDirection: 'row',
  },
  iconStyle: {
    color: '#444',
    fontSize: 18.5,
    paddingHorizontal: 5,
    paddingVertical: 4,
    paddingBottom: 0,
  },
  descStyle: {
    color: '#333',
    fontSize: 15.5,
    paddingVertical: 3,
    paddingBottom: 0,
  },
  responseStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  buttonContainer: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    elevation: 1,
  },
  BtnTextStyle: {
    color: '#eee',
    padding: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    paddingBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    // marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    color: '#333',
    fontSize: 22,
    paddingVertical: 10,
    paddingBottom: 15,
    alignSelf: 'center',
    textAlign: 'center',
    lineHeight: 30,
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
  },

  twoButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -5,
  },
  eachButton: { width: '47%', borderRadius: 5 },
});

const mapStateToProps = (state) => ({
  jwtToken: state.prof.jwtToken,
  isAuthenticated: state.prof.isAuthenticated,
  reqClients: state.profClient.reqClients,
  clients: state.profClient.clients,
});

const mapActionToProps = {
  logoutAction,
  addAllMyClient,
  addAllRequestedClient,
  removeOneRequestedClient,
  addOneMyClient,
};

export default connect(mapStateToProps, mapActionToProps)(recentlyContacted);
