import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from '../../components/Text';
import colors from '../../config/colors';
import { useSelector } from 'react-redux';
import { useBackPress, useHelper } from '../../hooks';
import { useNavigation } from '@react-navigation/native';
import { getProfessionalsClient } from '../../services/api';

const SCREEN_NAME = 'PROFESSIONALS_CLIENT';

const wait = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

const MyClients = () => {
  useBackPress(SCREEN_NAME);

  const { jwtToken } = useSelector((state) => state.auth);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const navigation = useNavigation();
  const { processApiError } = useHelper();

  const fetchClients = async () => {
    const response = await getProfessionalsClient({ jwtToken });
    if (!response.success) processApiError(response);
    else setClients(response.data.clients);
    setIsLoading(false);
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchClients();
    wait(1000).then(() => setIsRefreshing(false));
  }, []);

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      style={styles.scrollView}
    >
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View>
          {clients.map((client) => (
            <View style={styles.clientCard} key={client._id}>
              <Text style={styles.clientId}>ID: {client.customId}</Text>
              <Text style={styles.clientName}>{client.user.name}</Text>
              <View style={styles.locationContainer}>
                <MaterialCommunityIcons name="map-marker-radius" style={styles.locationIcon} />
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
                  navigation.navigate('ClientProfile', {
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
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    backgroundColor: '#f44336',
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
