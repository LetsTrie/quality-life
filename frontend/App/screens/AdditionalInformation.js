import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import Container from '../components/Auth/Container';
import TopHeading from '../components/Auth/TopHeading';
import Button from '../components/Button';
import useFormFields from '../components/HandleForm';
import Picker from '../components/Picker';
import TextInput from '../components/TextInput';
import colors from '../config/colors';
import { useHelper } from '../contexts/helper';
import Region from '../data/RegionInformation.json';
import constants from '../navigation/constants';
import { submitAdditionalInfo } from '../services/api';

let borderRadius = 35;
const genderLists = [
  { label: 'পুরুষ', value: 0 },
  { label: 'মহিলা', value: 1 },
  { label: 'অন্যান্য', value: 2 },
];
const maritalStatusLists = [
  { label: 'বিবাহিত', value: 10 },
  { label: 'অবিবাহিত', value: 11 },
];

const zillaList = Region.districts.map((d) => ({
  label: d.districtName,
  value: d.districtName,
}));

const initialState = {
  name: '',
  age: '',
  gender: '',
  maritalStatus: '',
  zila: '',
  upazila: '',
  union: '',
};

const AdditionalInformation = () => {
  const navigation = useNavigation();
  const { processApiError } = useHelper();
  const { jwtToken } = useSelector((state) => state.auth);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [gender, setGender] = useState(null);
  const [maritalStatus, setMaritalStatus] = useState(null);

  const [zilla, setZilla] = useState(null);
  const [upozila, setUpozila] = useState(null);
  const [upozilaList, setUpozilaList] = useState([]);
  const [union, setUnion] = useState(null);
  const [unionList, setUnionList] = useState([]);

  const { formFields, createChangeHandler } = useFormFields(initialState);

  const zillaHandleChange = (item) => {
    setZilla(item);
    const upozilaList = Region.districts
      .find((d) => d.districtName === item.label)
      .subDistricts.map((sb) => ({
        label: sb.subDistrictName,
        value: sb.subDistrictName,
      }));
    setUpozilaList(upozilaList);
    setUpozila(null);
    setUnion(null);
  };

  const upozilaHandleChange = (item) => {
    setUpozila(item);
    const unionList = Region.districts
      .find((d) => d.districtName === zilla.label)
      .subDistricts.find((sb) => sb.subDistrictName === item.label)
      .unions.map((u) => ({
        label: u.unionName,
        value: u.unionName,
      }));

    setUnionList(unionList);
    setUnion(null);
  };

  const handleFormSubmit = async () => {
    let fields = { ...formFields };
    let fieldAbsent = false;

    for (let key in initialState) {
      if (key != 'union' && key != 'upazila' && fields[key] === '') {
        fieldAbsent = true;
      }
    }

    if (fieldAbsent) {
      setError('Fill up all fields properly');
      return;
    }

    const payload = {
      name: fields.name,
      age: fields.age,
      gender: fields.gender,
      isMarried: fields.maritalStatus === 'বিবাহিত',
      location: {
        zila: fields.zila,
        upazila: fields.upazila,
        union: fields.union,
      },
    };

    setIsLoading(true);
    setError(null);

    const response = await submitAdditionalInfo({ payload, jwtToken });
    if (response.success) {
      setIsLoading(false);
      navigation.navigate(constants.ONBOARDING_GUIDELINE);
    } else {
      setIsLoading(false);
      setError(response?.error?.message);
      processApiError(response);
    }
  };

  return (
    <Container>
      <TopHeading heading="Your profile!" height={150} />
      <View style={[styles.loginContainer, { paddingTop: 10 }]}>
        <View style={styles.loginButtons}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="account"
            name="name"
            placeholder="নাম"
            onChangeText={(text) => createChangeHandler(text, 'name')}
            textContentType="name"
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="account-clock"
            keyboardType="numeric"
            name="age"
            placeholder="বয়স"
            onChangeText={(text) => createChangeHandler(text, 'age')}
          />

          <Picker
            width="92%"
            icon="gender-male-female-variant"
            placeholder="লিঙ্গ"
            selectedItem={gender}
            onSelectItem={(g) => setGender(g)}
            items={genderLists}
            onChange={(text) => createChangeHandler(text, 'gender')}
            name="gender"
          />

          <Picker
            width="92%"
            icon="card-account-details-star"
            placeholder="বৈবাহিক অবস্থা"
            selectedItem={maritalStatus}
            onSelectItem={(d) => setMaritalStatus(d)}
            items={maritalStatusLists}
            onChange={(text) => createChangeHandler(text, 'maritalStatus')}
            name="maritalStatus"
          />

          <Picker
            width="92%"
            icon="home-map-marker"
            placeholder="বর্তমান ঠিকানা (জেলা)"
            selectedItem={zilla}
            onSelectItem={zillaHandleChange}
            items={zillaList}
            style={{ marginBottom: 5 }}
            name="zila"
            onChange={(text) => createChangeHandler(text, 'zila')}
          />

          <Picker
            width="92%"
            icon="map-marker-radius"
            placeholder="বর্তমান ঠিকানা (উপজেলা)"
            selectedItem={upozila}
            onSelectItem={upozilaHandleChange}
            items={upozilaList}
            style={{ marginBottom: 5 }}
            name="upazila"
            onChange={(text) => createChangeHandler(text, 'upazila')}
          />

          <Picker
            width="92%"
            icon="map-marker-check"
            placeholder="বর্তমান ঠিকানা (ইউনিয়ন)"
            selectedItem={union}
            onSelectItem={(item) => setUnion(item)}
            items={unionList}
            style={{ marginBottom: 5 }}
            name="union"
            onChange={(text) => createChangeHandler(text, 'union')}
          />
          {isLoading && (
            <ActivityIndicator size="large" color={colors.primary} style={{ paddingTop: 10 }} />
          )}
          {error && (
            <Button
              title={error}
              style={{
                marginVertical: 10,
                marginBottom: 0,
                padding: 15,
                backgroundColor: 'white',
                borderColor: colors.primary,
                borderWidth: 3,
              }}
              textStyle={{
                fontSize: 14.5,
                color: colors.primary,
              }}
            />
          )}
          <Button
            title="Register"
            style={{
              marginVertical: 10,
              marginBottom: 0,
            }}
            textStyle={{
              fontSize: 20,
            }}
            onPress={handleFormSubmit}
          />
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderTopLeftRadius: borderRadius,
    borderTopRightRadius: borderRadius,
  },

  loginButtons: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 20,
  },
});

export default AdditionalInformation;
