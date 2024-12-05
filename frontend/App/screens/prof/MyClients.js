import React, { useState, useCallback, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../components/Text';
import { useBackPress, useHelper } from '../../hooks';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ApiDefinitions } from '../../services/api';
import { ErrorButton, Loader } from '../../components';
import constants from '../../navigation/constants';
import { numberWithCommas } from '../../utils/number';
import { capitalizeFirstLetter } from '../../utils/string';
import colors from '../../config/colors';

const genderMap = (gender) => {
  if (gender === 'Male') return 'পুরুষ';
  if (gender === 'Female') return 'মহিলা';
  return 'অন্যান্য';
};

const SCREEN_NAME = constants.PROFESSIONALS_CLIENT;
const MyClients = () => {
  const route = useRoute();
  const { goToBack } = route.params || {};
  useBackPress(SCREEN_NAME, goToBack);

  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const navigation = useNavigation();
  const { ApiExecutor } = useHelper();

  const fetchClients = async () => {
    const response = await ApiExecutor(ApiDefinitions.getProfessionalsClient());
    setIsLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    setClients([...response.data.clients]);
  };

  const onRefresh = useCallback(() => {
    (async () => {
      setIsRefreshing(true);
      await fetchClients();
      setIsRefreshing(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await fetchClients();
    })();
  }, []);

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      style={styles.scrollView}
    >
      {isLoading ? (
        <Loader visible={isLoading} style={{ marginVertical: 20 }} />
      ) : error ? (
        <ErrorButton visible={error} title={error} style={{ marginVertical: 10 }} />
      ) : (
        <View>
          {clients.map((client) => (
            <View style={styles.clientCard} key={client._id}>
              <Text style={styles.clientId}>ID: {client.customId}</Text>
              <Text style={styles.clientName}>{capitalizeFirstLetter(client.user.name)}</Text>
              <View style={styles.locationContainer}>
                <Text style={styles.locationText}>
                  {`বয়স - ${numberWithCommas(client.user.age)} বছর, ${genderMap(client.user.gender)}, ${client.user.isMarried ? 'বিবাহিত' : 'অবিবাহিত'}`}
                </Text>
              </View>
              <View style={styles.locationContainer}>
                <Text style={styles.locationText}>
                  {[
                    client.user.location.union,
                    client.user.location.upazila,
                    client.user.location.zila,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() =>
                  navigation.navigate(constants.CLIENT_PROFILE, {
                    clientId: client._id,
                    userId: client.user._id,
                    goToBack: SCREEN_NAME,
                  })
                }
              >
                <View style={styles.profileButtonContainer}>
                  <Text style={styles.profileButtonText}>See Profile</Text>
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
  scrollView: {
    flex: 1,
    paddingTop: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  clientCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  clientId: {
    fontSize: 12,
    color: '#9e9e9e',
    marginBottom: 4,
    fontWeight: '500',
  },
  clientName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  locationIcon: {
    color: '#f44336',
    fontSize: 22,
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#757575',
  },
  profileButton: {
    alignSelf: 'flex-end',
  },
  profileButtonContainer: {
    backgroundColor: colors.secondary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  profileButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyClients;
