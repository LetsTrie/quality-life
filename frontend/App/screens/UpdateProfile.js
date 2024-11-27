import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, ToastAndroid, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from '../components';
import Button from '../components/Button';
import useFormFields from '../components/HandleForm';
import Picker from '../components/Picker';
import TextInput from '../components/TextInput';
import colors from '../config/colors';
import Region from '../data/RegionInformation.json';
import { useBackPress, useHelper } from '../hooks';
import { updateProfileAction } from '../redux/actions/user';
import { ApiDefinitions } from '../services/api';
import constants from '../navigation/constants';

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

const SCREEN_NAME = constants.UPDATE_USER_PROFILE;
const UpdateProfile = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { ApiExecutor, processApiError } = useHelper();

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [userGender, setGender] = useState(null);
  const [maritalStatus, setMaritalStatus] = useState(null);

  const [zilla, setZilla] = useState(null);

  const [upozila, setUpozila] = useState(null);
  const [upozilaList, setUpozilaList] = useState([]);

  const [union, setUnion] = useState(null);
  const [unionList, setUnionList] = useState([]);

  const { jwtToken } = useSelector((state) => state.auth);
  const { name, age, gender, isMarried, address } = useSelector((state) => state.user);

  let initialState = {
    name: '',
    age: '',
    gender: '',
    maritalStatus: '',
    zila: '',
    upazila: '',
    union: '',
  };

  let { formFields, createChangeHandler, setFormFields } = useFormFields(initialState);

  useEffect(() => {
    // =================================================================
    // ============================= GENDER ============================
    // =================================================================
    const findedGender = genderLists.find((g) => g.value === gender);
    setGender(findedGender);

    // =================================================================
    // ======================== Marital Status =========================
    // =================================================================
    const findedMaritalStatus = maritalStatusLists.find(
      (m) => m.label === (isMarried === 'Married' ? 'বিবাহিত' : 'অবিবাহিত')
    );
    setMaritalStatus(findedMaritalStatus);

    // =================================================================
    // ============================ ADDRESS ============================
    // =================================================================

    let findedZila;
    let findedUpaZila;
    let findedUnion;

    if (address) {
      const partsOfAddress = address.split(',').map((a) => a.toString().trim());

      if (partsOfAddress.length === 3) {
        findedZila = partsOfAddress[2];
        findedUpaZila = partsOfAddress[1];
        findedUnion = partsOfAddress[0];
      } else if (partsOfAddress.length === 2) {
        findedZila = partsOfAddress[1];
        findedUpaZila = partsOfAddress[0];
        findedUnion = null;
      } else if (partsOfAddress.length === 1) {
        findedZila = partsOfAddress[0];
        findedUpaZila = null;
        findedUnion = null;
      }
      findedZila = zillaList?.find((z) => z.label === findedZila);

      const upozilaList = Region?.districts
        ?.find((d) => d.districtName === findedZila?.label)
        ?.subDistricts.map((sb) => ({
          label: sb.subDistrictName,
          value: sb.subDistrictName,
        }));

      findedUpaZila = upozilaList?.find((u) => u.label === findedUpaZila);

      let unionList = [];
      if (findedUpaZila) {
        unionList = Region.districts
          .find((d) => d.districtName === findedZila?.label)
          .subDistricts.find((sb) => sb.subDistrictName === findedUpaZila?.label)
          .unions.map((u) => ({
            label: u.unionName,
            value: u.unionName,
          }));
      }

      if (findedUnion) {
        findedUnion = unionList.find((f) => f.label === findedUnion);
      }

      setUpozilaList(upozilaList);
      setUnionList(unionList);
      setZilla(findedZila);
      setUpozila(findedUpaZila);
      setUnion(findedUnion);
    }

    let initialState = {
      name: name?.toString() ?? '',
      age: age?.toString() ?? '',
      gender: findedGender?.label ?? '',
      maritalStatus: findedMaritalStatus?.label ?? '',
      zila: findedZila?.label ?? '',
      upazila: findedUpaZila?.label ?? '',
      union: findedUnion?.label ?? '',
    };

    setFormFields(initialState);
  }, []);

  const handleZillaChange = (item) => {
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
    createChangeHandler('', 'upazila');
    createChangeHandler('', 'union');
  };

  const handleUpozilaChange = (item) => {
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
    createChangeHandler('', 'union');
  };

  const handleFormSubmit = async () => {
    let fields = { ...formFields };
    let missingRequiredFields = false;

    for (let key in initialState) {
      if (key != 'union' && key != 'upazila' && fields[key].trim() === '') {
        missingRequiredFields = true;
      }
    }

    if (missingRequiredFields) {
      setError('ফর্মটি সঠিকভাবে পূরণ করুন');
      return;
    }

    setError(null);

    const payload = {
      name: fields.name.trim(),
      age: fields.age.trim(),
      gender: fields.gender.trim(),
      isMarried: fields.maritalStatus === 'Married',
      location: {
        zila: fields.zila.trim(),
        upazila: fields.upazila?.trim() || '',
        union: fields.union?.trim() || '',
      },
    };

    setIsLoading(true);
    const response = await ApiExecutor(ApiDefinitions.updateUserProfile({ payload }));
    setIsLoading(false);

    if (!response.success) {
      setError(response.message);
      return;
    }

    dispatch(updateProfileAction(response.data.user));
    navigation.navigate(constants.PROFILE);

    ToastAndroid.show('প্রোফাইল আপডেট সম্পন্ন হয়েছে!', ToastAndroid.SHORT);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingTop: 10 }}>
      <ScrollView>
        <View style={styles.loginButtons}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="account"
            name="name"
            placeholder="নাম"
            style={{ marginBottom: 5 }}
            defaultValue={name}
            onChangeText={(text) => createChangeHandler(text, 'name')}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="account-clock"
            keyboardType="numeric"
            name="age"
            placeholder="বয়স"
            style={{ marginBottom: 5 }}
            defaultValue={age?.toString()}
            onChangeText={(text) => createChangeHandler(text, 'age')}
          />

          <Picker
            width="92%"
            icon="gender-male-female-variant"
            placeholder="লিঙ্গ"
            selectedItem={userGender}
            onSelectItem={(g) => setGender(g)}
            items={genderLists}
            style={{ marginBottom: 5 }}
            onChange={(text) => createChangeHandler(text, 'gender')}
          />

          <Picker
            width="92%"
            icon="card-account-details-star"
            placeholder="বৈবাহিক অবস্থা"
            selectedItem={maritalStatus}
            onSelectItem={(d) => setMaritalStatus(d)}
            items={maritalStatusLists}
            style={{ marginBottom: 5 }}
            onChange={(text) => createChangeHandler(text, 'maritalStatus')}
          />

          <Picker
            width="92%"
            icon="home-map-marker"
            placeholder="বর্তমান ঠিকানা (জেলা)"
            selectedItem={zilla}
            onSelectItem={handleZillaChange}
            items={zillaList}
            style={{ marginBottom: 5 }}
            name="workplace"
            onChange={(text) => createChangeHandler(text, 'zila')}
          />

          <Picker
            width="92%"
            icon="map-marker-radius"
            placeholder="বর্তমান ঠিকানা (উপজেলা)"
            selectedItem={upozila}
            onSelectItem={handleUpozilaChange}
            items={upozilaList}
            style={{ marginBottom: 5 }}
            name="workplace"
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
            name="workplace"
            onChange={(text) => createChangeHandler(text, 'union')}
          />

          <Loader visible={isLoading} style={{ paddingTop: 10 }} />

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
            title="আপডেট করুন"
            style={{
              marginVertical: 10,
              marginBottom: 0,
            }}
            textStyle={{
              fontSize: 18,
            }}
            onPress={handleFormSubmit}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loginContainer: {
    backgroundColor: 'white',
    flex: 1,
  },

  loginButtons: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 20,
  },
});

export default UpdateProfile;
