import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import validator from 'validator';
import { Loader, BasedOnProfession } from '../../components';
import Container from '../../components/Auth/Container';
import EndOptions from '../../components/Auth/EndOptions';
import TopHeading from '../../components/Auth/TopHeading';
import Button from '../../components/Button';
import useFormFields from '../../components/HandleForm';
import Picker from '../../components/Picker';
import TextInput from '../../components/TextInput';
import colors from '../../config/colors';
import Region from '../../data/RegionInformation.json';
import constants from '../../navigation/constants';
import { registerProfStep1 } from '../../services/api';
import { useBackPress } from '../../hooks';

let borderRadius = 35;

const batchLists = [];
const CurrentYear = new Date().getFullYear();
for (let i = 1997; i < CurrentYear; i++) {
  const v = `Batch ${i - 1997 + 1} - ${i}/${(i + 1).toString().slice(2)}`;
  batchLists.unshift({ label: v, value: v });
}

const genderLists = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Others', value: 'Others' },
];

const professionLists = [
  { label: 'Clinical psychologist', value: 'Clinical psychologist' },
  { label: 'Assistant clinical psychologist', value: 'Assistant clinical psychologist' },
  { label: 'Psychiatrist', value: 'Psychiatrist' },
];

const zillaList = Region.districts.map((d) => ({
  label: d.districtName,
  value: d.districtName,
}));

const SCREEN_NAME = constants.PROF_REGISTER_STEP_1;

const RegisterStep1 = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();

  const [gender, setGender] = useState(null);
  const [profession, setprofession] = useState(null);
  const [batch, setBatch] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const initialState = {
    name: '',
    email: '',
    gender: '',
    password: '',
    confirmPassword: '',
    designation: '',
    batch: '',
    bmdc: '',
    profession: '',
    workplace: '',
    zila: '',
    upazila: '',
    union: '',
  };

  const { formFields, createChangeHandler } = useFormFields(initialState);

  const [zilla, setZilla] = useState(null);
  const [upozila, setUpozila] = useState(null);
  const [union, setUnion] = useState(null);

  const [upozilaList, setUpozilaList] = useState([]);
  const [unionList, setUnionList] = useState([]);

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
      if (key === 'union') continue;

      if (key === 'batch' || key === 'bmdc') {
        if (fields.batch === '' && fields.key === '') {
          fieldAbsent = true;
        }
      } else if (fields[key] === '') {
        fieldAbsent = true;
      }
    }

    console.log(fields)

    if (fieldAbsent) {
      setError('ফর্মটি সঠিকভাবে পূরণ করুন');
      return;
    } else if (!validator.isEmail(fields.email)) {
      setError('ইমেলটি বৈধ নয়');
      return;
    } else if (fields.password !== fields.confirmPassword) {
      setError('পাসওয়ার্ড মেলেনি');
      return;
    }

    setIsLoading(true);
    setError(null);

    fields.email = fields.email.toString().trim().toLowerCase();
    fields.password = fields.password.toString().trim().toLowerCase();

    const response = await registerProfStep1(fields);
    console.log(response);

    setIsLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    navigation.navigate(constants.WAIT_FOR_VERIFICATION);
  };

  return (
    <Container>
      <TopHeading heading="Join now!" subHeading="professional" height={165} />
      <View style={[styles.loginContainer, { paddingTop: 10 }]}>
        <View style={styles.loginButtons}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="account"
            name="name"
            placeholder="Name"
            onChangeText={(text) => createChangeHandler(text, 'name')}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="email"
            keyboardType="email-address"
            name="email"
            placeholder="Email"
            textContentType="emailAddress"
            onChangeText={(text) => createChangeHandler(text, 'email')}
          />

          <Picker
            width="92%"
            icon="gender-male-female-variant"
            placeholder="Gender"
            selectedItem={gender}
            onSelectItem={(g) => setGender(g)}
            items={genderLists}
            name="gender"
            onChange={(text) => createChangeHandler(text, 'gender')}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="password"
            placeholder="Password"
            secureTextEntry
            textContentType="password"
            keyboardType="default"
            onChangeText={(text) => createChangeHandler(text, 'password')}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="lock"
            name="confirmPassword"
            placeholder="Confirm password"
            secureTextEntry
            keyboardType="default"
            onChangeText={(text) => createChangeHandler(text, 'confirmPassword')}
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

          <Picker
            width="92%"
            icon="card-account-details-star"
            placeholder="Profession"
            selectedItem={profession}
            onSelectItem={(d) => setprofession(d)}
            items={professionLists}
            onChange={(text) => createChangeHandler(text, 'profession')}
          />

          <BasedOnProfession
            profession={profession}
            createChangeHandler={createChangeHandler}
            batch={batch}
            setBatch={setBatch}
            batchLists={batchLists}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="briefcase-account"
            name="designation"
            placeholder="Designation"
            onChangeText={(text) => createChangeHandler(text, 'designation')}
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="map-marker-radius"
            name="workplace"
            placeholder="Workplace"
            onChangeText={(text) => createChangeHandler(text, 'workplace')}
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
            title="নিবন্ধন করুন"
            style={{
              marginVertical: 10,
              marginBottom: 0,
              padding: 15,
            }}
            textStyle={{
              fontSize: 20,
            }}
            onPress={handleFormSubmit}
          />
          <EndOptions
            title1={`Already have an account?`}
            title2={`Login here`}
            title3={`Register as a user`}
            onPress1={() => navigation.navigate('LoginPro')}
            onPress2={() => navigation.navigate('Register')}
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

export default RegisterStep1;
