import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from '../../components/Text';
import BaseUrl from '../../config/BaseUrl';
import colors from '../../config/colors';
import { logoutAction, numOfNewNotificationsAction } from '../../redux/actions/prof';
import { connect } from 'react-redux';
import YesNoModal from '../../components/YesNoModal';
import ProfileActModal from './ProfileActModal';
import constants from '../../navigation/constants';
import { useBackPress, useHelper } from '../../hooks';
import { AppButton } from '../../components';
import { deleteProfAccount } from '../../services/api';
import { numberWithCommas } from '../../utils/number';

const wait = (timeout) => {
  return new Promise((resolve) => setTimeout(resolve, timeout));
};

const p = (a) => parseFloat(a);

const SCREEN_NAME = constants.PROF_HOMEPAGE;

const Homepage = ({ navigation, route, ...props }) => {
  useBackPress(SCREEN_NAME);
  const { logout } = useHelper();

  const {
    _id,
    visibility,
    jwtToken,
    isAuthenticated,
    logoutAction,
    numOfNewNotifications,
    numOfNewClientRequests,
    numOfNewNotificationsAction,
  } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleAct, setModalVisibleAct] = useState(false);
  const [activeText, setActiveText] = useState(visibility);
  const [error,setError] = useState(null)

  const logoutHandler = () => {
    logoutAction(); // TODO: REMOVE THIS
    logout();
  };

  async function getHomepageData() {
    if (!isAuthenticated) {
      navigation.navigate('LoginPro');
      return;
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    };

    try {
      const response = await axios.get(`${BaseUrl}/prof/homepage`, { headers });
      const { appointments, notifications } = response.data;
      numOfNewNotificationsAction(p(notifications), p(appointments));
    } catch (err) {
      if (err?.response?.status === 401) {
        logoutHandler();
      }
    } finally {
      setIsLoading(false);
    }
  }

  const anyNewNotifications = !(!numOfNewNotifications || numOfNewNotifications <= 0);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getHomepageData();
    wait(2000).then(() => setRefreshing(false));
  }, []);

  const deleteAccount = async () => {
    setIsLoading(true);
    setError(null);

    const response = await deleteProfAccount({ profId: _id, jwtToken });
    
    setIsLoading(false);

    if (response.success) {
      logoutHandler();
    } else {
      setError(response.error.message);
    }
  };

  const activation = async () => {
    const variable = { _id: _id, visibility: activeText };
    await axios.post(`${BaseUrl}/prof/activation`, variable).then((res) => {
      if (res.data === 'success') {
        setActiveText(!activeText);
        setModalVisibleAct(!modalVisibleAct);
      }
    });
  };

  useEffect(() => {
    getHomepageData();
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: '#efefef' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {isLoading ? (
        <View
          style={{
            textAlign: 'center',
            width: '100%',
            paddingTop: 10,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={{ paddingTop: 10 }}>
          {anyNewNotifications && (
            <TouchableOpacity
              style={[styles.box, { backgroundColor: '#fead07', borderColor: '#fead07' }]}
              onPress={() =>
                navigation.navigate('ProNotification', {
                  goToBack: SCREEN_NAME,
                })
              }
            >
              <Text
                style={[
                  styles.boxText,
                  {
                    color: 'white',
                    textAlign: 'center',
                    fontSize: 17,
                    paddingVertical: 5,
                    fontWeight: 'bold',
                  },
                ]}
              >
                আপনার {numberWithCommas(numOfNewNotifications)} টি নতুন নোটিফিকেশন আছে
              </Text>
            </TouchableOpacity>
          )}

          {error && (
            <Text style={{ color: 'red', textAlign: 'center', fontSize: 15 }}>{error}</Text>
          )}

          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate(constants.PROF_CLIENT_REQUEST)}
          >
            <Text style={styles.boxText}>Client Request</Text>
            {numOfNewClientRequests > 0 && (
              <Text style={{ fontSize: 14, paddingTop: 2, color: '#727272' }}>
                ◉ {numOfNewClientRequests} new requests
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() =>
              navigation.navigate('ProAssessments', {
                goToBack: SCREEN_NAME,
              })
            }
          >
            <Text style={styles.boxText}>Assessment Tools</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() => navigation.navigate(constants.PROF_PROFILE)}
          >
            <Text style={styles.boxText}>আমার প্রোফাইল</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.box}
            onPress={() =>
              navigation.navigate('ProMyClients', {
                goToBack: SCREEN_NAME,
              })
            }
          >
            <Text style={styles.boxText}>আমার ক্লায়েন্টস</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.box}
            onPress={() =>
              navigation.navigate('ProActivityLog', {
                goToBack: SCREEN_NAME,
              })
            }
          >
            <Text style={styles.boxText}>Clinical Documentation Form</Text>
          </TouchableOpacity> */}

          {!anyNewNotifications && (
            <TouchableOpacity
              style={styles.box}
              onPress={() =>
                navigation.navigate('ProNotification', {
                  goToBack: SCREEN_NAME,
                })
              }
            >
              <Text style={styles.boxText}>নোটিফিকেশন</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.box} onPress={() => setModalVisibleAct(true)}>
            <Text style={styles.boxText}>{!activeText ? 'অ্যাকাউন্ট সক্রিয় করুন' : 'অ্যাকাউন্ট গোপন করুন'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.box} onPress={() => setModalVisible(true)}>
            <Text style={styles.boxText}>অ্যাকাউন্ট ডিলিট করুন </Text>
          </TouchableOpacity>

          <AppButton title="সাইন আউট" onPress={logoutHandler} />

          <YesNoModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            deleteAccount={deleteAccount}
          />

          <ProfileActModal
            modalVisibleAct={modalVisibleAct}
            setModalVisibleAct={setModalVisibleAct}
            activation={activation}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  box: {
    margin: 10,
    padding: 15,
    paddingVertical: 13,
    borderWidth: 1,
    elevation: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginVertical: 0,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  boxText: {

  },
});

const mapStateToProps = (state) => ({
  _id: state.prof?.prof?._id,
  jwtToken: state.prof.jwtToken,
  isAuthenticated: state.prof.isAuthenticated,
  numOfNewNotifications: state.prof.numOfNewNotifications,
  numOfNewClientRequests: state.prof.numOfNewClientRequests,
  visibility: state.prof?.prof?.visibility,
});

export default connect(mapStateToProps, {
  logoutAction,
  numOfNewNotificationsAction,
})(Homepage);
