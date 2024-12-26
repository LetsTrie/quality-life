import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import constants from '../../navigation/constants';
import colors from '../../config/colors';
import { ErrorButton, SubmitButton } from '../../components';

import { useBackPress, useHelper } from '../../hooks';
import { ApiDefinitions } from '../../services/api';
import { capitalizeFirstLetter } from '../../utils/string';

const SCREEN_NAME = constants.PROF_PROFILE;

const MyProfileScreen = () => {
  const { ApiExecutor } = useHelper();
  useBackPress(SCREEN_NAME);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const response = await ApiExecutor(ApiDefinitions.getProfessionalsProfile());
      if (!response.success) {
        setError(response.error.message);
        return;
      }

      setError(null);
      setData(response.data.prof);
    })();
  }, []);

  const renderAvailableTime = (availableTime) => {
    return availableTime.map((item) => (
      <View key={item._id} style={styles.timeContainer}>
        <Text style={styles.timeDay}>{item.day}</Text>
        {item.timeRange.length > 0 ? (
          item.timeRange.map((range) => (
            <Text key={range._id} style={styles.timeRange}>
              {range.from} - {range.to}
            </Text>
          ))
        ) : (
          <Text style={styles.noTime}>No availability</Text>
        )}
      </View>
    ));
  };

  const renderClients = (clients) => {
    return clients.map((client, index) => (
      <View
        key={client._id}
        style={[styles.clientContainer, index + 1 === clients.length && { borderBottomWidth: 0 }]}
      >
        <Text style={styles.clientLocation}>{client.location}:</Text>
        <Text style={styles.clientCount}>{client.count || '0'} clients</Text>
      </View>
    ));
  };

  if (error) return <ErrorButton title={error} style={{ marginVertical: 20 }} />;
  if (!data) return null;

  const address = [data.union, data.upazila, data.zila].filter(Boolean).join(', ');

  return (
    <ScrollView style={{ paddingBottom: 10 }}>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Personal Details</Text>
        <View style={styles.smDetailRow}>
          <Text style={styles.detailKey}>Name:</Text>
          <Text style={styles.detailValue}>{capitalizeFirstLetter(data.name)}</Text>
        </View>
        <View style={styles.smDetailRow}>
          <Text style={styles.detailKey}>Email:</Text>
          <Text style={styles.detailValue}>{data.email}</Text>
        </View>
        <View style={styles.smDetailRow}>
          <Text style={styles.detailKey}>Gender:</Text>
          <Text style={styles.detailValue}>{data.gender}</Text>
        </View>
        <View style={styles.smDetailRow}>
          <Text style={styles.detailKey}>Telephone:</Text>
          <Text style={styles.detailValue}>{data.telephone}</Text>
        </View>
        <View style={styles.smDetailRow}>
          <Text style={styles.detailKey}>Address:</Text>
          <Text style={styles.detailValue}>{address}</Text>
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Professional Details</Text>
        <View style={[styles.detailRow, { paddingBottom: 3 }]}>
          <Text style={[styles.detailKey, { paddingBottom: 2 }]}>Designation:</Text>
          <Text style={styles.detailValue}>{data.designation}</Text>
        </View>
        <View style={[styles.detailRow, { paddingBottom: 3 }]}>
          <Text style={[styles.detailKey, { paddingBottom: 2 }]}>Workplace:</Text>
          <Text style={styles.detailValue}>{data.workplace}</Text>
        </View>
        <View style={[styles.detailRow, { paddingBottom: 3 }]}>
          <Text style={[styles.detailKey, { paddingBottom: 2 }]}>Profession:</Text>
          <Text style={styles.detailValue}>{data.profession}</Text>
        </View>
        <View style={[styles.detailRow, { paddingBottom: 3 }]}>
          <Text style={[styles.detailKey, { paddingBottom: 2 }]}>Specialization Area:</Text>
          <Text style={styles.detailValue}>{data.specializationArea}</Text>
        </View>
        {data.otherSpecializationArea && (
          <View style={[styles.detailRow, { paddingBottom: 3 }]}>
            <Text style={[styles.detailKey, { paddingBottom: 2 }]}>Other Specialization Area:</Text>
            <Text style={styles.detailValue}>{data.otherSpecializationArea || 'N/A'}</Text>
          </View>
        )}
        <View style={[styles.detailRow, { paddingBottom: 3 }]}>
          <Text style={[styles.detailKey, { paddingBottom: 2 }]}>Education Qualification:</Text>
          <Text style={styles.detailValue}>{data.eduQualification}</Text>
        </View>
        <View style={[styles.detailRow, { paddingBottom: 3 }]}>
          <Text style={[styles.detailKey, { paddingBottom: 2 }]}>Experience:</Text>
          <Text style={styles.detailValue}>{data.experience}</Text>
        </View>
        {data.bmdc && (
          <View style={[styles.detailRow, { paddingBottom: 3 }]}>
            <Text style={[styles.detailKey, { paddingBottom: 2 }]}>BMDC:</Text>
            <Text style={styles.detailValue}>{data.bmdc}</Text>
          </View>
        )}
        {data.batch && (
          <View style={styles.smDetailRow}>
            <Text style={styles.detailKey}>Batch:</Text>
            <Text style={styles.detailValue}>{data.batch}</Text>
          </View>
        )}
        <View style={styles.smDetailRow}>
          <Text style={styles.detailKey}>Fee:</Text>
          <Text style={styles.detailValue}>{data.fee} BDT</Text>
        </View>
        <View style={styles.smDetailRow}>
          <Text style={styles.detailKey}>Visibility Status:</Text>
          <Text style={styles.detailValue}>{data.visibility ? 'Visible' : 'Hidden'}</Text>
        </View>
        <View style={styles.smDetailRow}>
          <Text style={styles.detailKey}>Average Weekly Client:</Text>
          <Text style={styles.detailValue}>{data.averageWeeklyClient}</Text>
        </View>
        <View style={styles.smDetailRow}>
          <Text style={styles.detailKey}>Maximum Weekly Client:</Text>
          <Text style={styles.detailValue}>{data.maximumWeeklyClient}</Text>
        </View>
        {data.reference && (
          <View style={[styles.detailRow, { paddingBottom: 3 }]}>
            <Text style={[styles.detailKey, { paddingBottom: 2 }]}>Reference:</Text>
            <Text style={styles.detailValue}>{data.reference || '-'}</Text>
          </View>
        )}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Available Time</Text>
        {renderAvailableTime(data.availableTime)}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Number of Clients</Text>
        {renderClients(data.numberOfClients)}
      </View>

      <SubmitButton title={'Edit Profile'} style={{ marginBottom: 15 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
    paddingBottom: 24,
  },
  sectionContainer: {
    margin: 12,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    marginBottom: 2,
  },
  sectionHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 20,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  detail: {
    fontSize: 16,
    color: '#4A4A4A',
    paddingBottom: 4,
    lineHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeContainer: {
    marginVertical: 8,
  },
  timeDay: {
    fontSize: 16.5,
    fontWeight: 'bold',
    color: colors.textPrimary,
    paddingBottom: 3,
  },
  timeRange: {
    fontSize: 14.5,
    color: colors.textSecondary,
  },
  noTime: {
    fontSize: 14,
    color: colors.danger,
    fontStyle: 'italic',
  },
  clientContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  clientLocation: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  clientCount: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  smDetailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 5,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailKey: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textPrimary,
  },
});

export default MyProfileScreen;
