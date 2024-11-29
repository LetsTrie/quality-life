import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { BasedOnProfession, ErrorButton, Loader } from '../../components';
import AppButton from '../../components/Button';
import useFormFields from '../../components/HandleForm';
import Picker from '../../components/Picker';
import TextInput from '../../components/TextInput';
import { useBackPress } from '../../hooks';
import constants from '../../navigation/constants';
import { logoutAction, updateProfileActionProf } from '../../redux/actions/prof';
import { updateProfProfile } from '../../services/api';

const professionLists = [
  { label: 'Clinical psychologist', value: 10 },
  { label: 'Assistant clinical psychologist', value: 11 },
  { label: 'Psychiatrist', value: 12 },
];

const batchLists = [];
const CurrentYear = new Date().getFullYear();
for (let i = 1997; i < CurrentYear; i++) {
  const v = `Batch ${i - 1997 + 1} - ${i}/${(i + 1).toString().slice(2)}`;
  batchLists.unshift({ label: v, value: v });
}

const SCREEN_NAME = constants.PROF_UPDATE_PROFILE;
const UpdateProfileProf = () => {
  useBackPress(SCREEN_NAME);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [batch, setBatch] = useState(null);
  const [profession, setprofession] = useState(null);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    _id,
    name,
    profession: currentProfession,
    batch: currentBatch,
    bmdc,
    designation,
    eduQualification,
    experience,
    fee,
  } = useSelector((state) => state.prof.prof || {});
  const { jwtToken } = useSelector((state) => state.auth);

  useEffect(() => {
    setprofession(professionLists.find((profession) => profession.label === currentProfession));
  }, [currentProfession]);

  useEffect(() => {
    setBatch(batchLists.find((batch) => batch.label === currentBatch));
  }, [currentBatch]);

  let initialState = {
    name,
    profession: currentProfession,
    designation,
    batch: currentBatch,
    bmdc,
    eduQualification,
    experience,
    fee,
  };

  let { formFields, createChangeHandler } = useFormFields(initialState);

  const handleFormSubmit = async () => {
    let fields = { ...formFields };

    const payload = {
      name: fields.name ?? name,
      profession: fields.profession ?? currentProfession,
      batch: fields.batch ?? currentBatch,
      bmdc: fields.bmdc ?? bmdc,
      designation: fields.designation ?? designation,
      eduQualification: fields.eduQualification ?? eduQualification,
      experience: fields.experience ?? experience,
      fee: fields.fee ?? fee,
    };

    setIsLoading(true);
    setError(null);

    const response = await updateProfProfile({ _id, jwtToken, payload });
    console.log(response);
    setIsLoading(false);

    if (response.success) {
      dispatch(updateProfileActionProf(response.data));
      navigation.navigate('ProfileProf');
      return;
    }

    setError(response?.error?.message);
    if (response.status === 401) dispatch(logoutAction());
    processApiError(response);
  };

  return (
    <>
      <ScrollView>
        <View style={[styles.container, { paddingTop: 10 }]}>
          <View style={styles.formContainer}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              icon="account"
              name="name"
              placeholder="Name"
              style={styles.input}
              defaultValue={name}
              onChangeText={(text) => createChangeHandler(text, 'name')}
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
              icon="card-account-details-star"
              name="designation"
              placeholder="Designation"
              style={styles.input}
              defaultValue={designation}
              onChangeText={(text) => createChangeHandler(text, 'designation')}
            />

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              icon="book-open"
              name="eduQualification"
              placeholder="Edu. Qualifications"
              style={styles.input}
              defaultValue={eduQualification}
              onChangeText={(text) => createChangeHandler(text, 'eduQualification')}
            />

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              icon="stethoscope"
              name="experience"
              placeholder="Experience"
              style={styles.input}
              defaultValue={experience}
              onChangeText={(text) => createChangeHandler(text, 'experience')}
            />

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numeric"
              icon="credit-card"
              name="fee"
              placeholder="Fee"
              style={styles.input}
              defaultValue={fee}
              onChangeText={(text) => createChangeHandler(text, 'fee')}
            />

            <Loader visible={isLoading} style={styles.loader} />

            <ErrorButton visible={error} errorMessage={error} />

            <AppButton
              title="Update Profile"
              style={styles.submitBtn}
              textStyle={styles.submitBtnText}
              onPress={handleFormSubmit}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  formContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 20,
  },
  input: {
    marginBottom: 5,
  },
  loader: { paddingTop: 10 },
  submitBtn: {
    marginVertical: 10,
    marginBottom: 0,
  },
  submitBtnText: {
    fontSize: 16,
  },
});

export default UpdateProfileProf;
