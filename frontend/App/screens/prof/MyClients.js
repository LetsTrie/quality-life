import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  BackHandler,
} from 'react-native';
import Text from '../../components/Text';
import BaseUrl from '../../config/BaseUrl';
import colors from '../../config/colors';
import { connect } from 'react-redux';
import { logoutAction } from '../../redux/actions/prof';
import { addAllMyClient } from '../../redux/actions/prof_client';

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const routeName = 'ProMyClients';

const MyClients = ({ navigation, route, ...props }) => {
  let goToBack = route.params.goToBack ?? 'ProHomepage';
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const { jwtToken, isAuthenticated, clients, logoutAction, addAllMyClient } =
    props;

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${jwtToken}`,
  };

  const signOutHandler = () => {
    logoutAction();
    navigation.navigate('LoginPro');
  };

  const getClients = async () => {
    if (!isAuthenticated) {
      signOutHandler();
      return;
    }
    try {
      const response = await axios.get(`${BaseUrl}/prof/my-clients`, {
        headers,
      });
      addAllMyClient(response.data.clients);
    } catch (err) {
      if (err?.response?.status === 401) signOutHandler();
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getClients();
    wait(2000).then(() => setRefreshing(false));
  }, []);

  function handleBackButtonClick() {
    navigation.navigate(goToBack);
    return true;
  }

  useEffect(() => {
    getClients();
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
        <View>
          <TouchableOpacity
            style={[
              styles.box,
              { backgroundColor: '#fead07', borderColor: '#fead07' },
            ]}
            onPress={() =>
              navigation.navigate('recentlyContacted', {
                goToBack: routeName,
              })
            }
          >
            <Text
              style={[
                styles.boxText,
                {
                  color: 'white',
                  textAlign: 'center',
                  fontSize: 19.5,
                  paddingVertical: 5,
                  fontWeight: 'bold',
                },
              ]}
            >
              Your Requested Clients
            </Text>
          </TouchableOpacity>
          {clients.map((c, i) => (
            <View style={styles.blockStyle} key={c._id}>
              <Text style={styles.clientIdStyle}> ID: {c.clientIdByProf} </Text>
              <Text style={styles.nameStyle}> {c.userName} </Text>
              <View style={styles.iconBlockStyle}>
                <MaterialCommunityIcons
                  name={'map-marker-radius'}
                  style={styles.iconStyle}
                />
                <Text style={styles.descStyle}>{c.userLocation}</Text>
              </View>
              <TouchableOpacity
                style={styles.responseStyle}
                onPress={() =>
                  navigation.navigate('ClientProfile', {
                    userId: c.userId,
                    goToBack: routeName,
                  })
                }
              >
                <View style={styles.buttonContainer}>
                  <Text style={styles.BtnTextStyle}> See Profile </Text>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  clientIdStyle: {
    fontSize: 13.5,
    color: '#555',
    paddingBottom: 2,
    fontWeight: 'bold',
  },
  box: {
    margin: 10,
    padding: 5,
    paddingVertical: 7,
    borderWidth: 1,
    elevation: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'white',
    marginTop: 15,
  },
  nameStyle: {
    fontSize: 19,
    paddingBottom: 1,
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
    marginBottom: 10,
  },
  iconStyle: {
    color: '#444',
    fontSize: 18.5,
    paddingHorizontal: 5,
    paddingVertical: 4,
    paddingBottom: 0,
  },
  descStyle: {
    color: '#444',
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
    fontSize: 15,
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
  clients: state.profClient.clients,
});

const mapActionToProps = { logoutAction, addAllMyClient };

export default connect(mapStateToProps, mapActionToProps)(MyClients);
