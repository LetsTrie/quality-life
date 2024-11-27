import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Container from '../components/Auth/Container';
import TopHeading from '../components/Auth/TopHeading';
import useFormFields from '../components/HandleForm';
import Picker from '../components/Picker';
import TextInput from '../components/TextInput';
import { useHelper } from '../contexts/helper';
import Region from '../data/RegionInformation.json';
import constants from '../navigation/constants';
import { ApiDefinitions } from '../services/api';
import { ErrorButton, Loader } from '../components';
import { SubmitButton } from '../components/SubmitButton';
import { useBackPress } from '../hooks';

let borderRadius = 35;
const genderLists = [
  { label: 'পুরুষ', value: 'Male' },
  { label: 'মহিলা', value: 'Female' },
  { label: 'অন্যান্য', value: 'Others' },
];
const maritalStatusLists = [
  { label: 'বিবাহিত', value: 'Married' },
  { label: 'অবিবাহিত', value: 'Single' },
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

const SCREEN_NAME = constants.REGISTER_WITH_EXTRA_INFORMATION;
const AdditionalInformation = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const { ApiExecutor } = useHelper();

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
      setError('ফর্মটি সঠিকভাবে পূরণ করুন');
      return;
    }

    setError(null);

    const payload = {
      name: fields.name,
      age: fields.age,
      gender: fields.gender,
      isMarried: fields.maritalStatus === 'Married',
      location: {
        zila: fields.zila,
        upazila: fields.upazila,
        union: fields.union,
      },
    };

    setIsLoading(true);
    const response = await ApiExecutor(ApiDefinitions.additionalInfo({ payload }));
    console.log(response);
    setIsLoading(false);

    if (!response.success) {
      setError(response?.error?.message);
      return;
    }

    navigation.navigate(constants.ONBOARDING_GUIDELINE);
  };

  return (
    <Container>
      <TopHeading heading="প্রয়োজনীয় তথ্য" />
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

          <Loader visible={!!isLoading} style={{ marginTop: 10 }} />
          <ErrorButton title={error} visible={!!error} />
          <SubmitButton title={'সাবমিট করুন'} onPress={handleFormSubmit} />
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
