import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ErrorButton, Loader } from '../../components';
import Container from '../../components/Auth/Container';
import useFormFields from '../../components/HandleForm';
import Picker from '../../components/Picker';
import TextInput from '../../components/TextInput';
import constants from '../../navigation/constants';
import { ApiDefinitions } from '../../services/api';
import { useBackPress, useHelper } from '../../hooks';
import { SubmitButton } from '../../components/SubmitButton';

const specAreaLists = [
  {
    label: 'কগনিটিভ বিহ্যাভিওরাল থেরাপি (সি বি টি)',
    value: 'কগনিটিভ বিহ্যাভিওরাল থেরাপি (সি বি টি)',
  },
  { label: 'সাইকো অ্যানালাইস', value: 'সাইকো অ্যানালাইস' },
  {
    label: 'ট্রাঞ্জেকসনাল অ্যানালাইস (টি এ)',
    value: 'ট্রাঞ্জেকসনাল অ্যানালাইস (টি এ)',
  },
  {
    label: 'ই এম ডি আর',
    value: 'ই এম ডি আর',
  },
  {
    label: 'কাপল থেরাপি',
    value: 'কাপল থেরাপি',
  },
  {
    label: 'ফ্যামিলি থেরাপি',
    value: 'ফ্যামিলি থেরাপি',
  },
  {
    label: 'ডায়ালেকটিকাল বিহ্যাভিওরাল থেরাপি',
    value: 'ডায়ালেকটিকাল বিহ্যাভিওরাল থেরাপি',
  },
  {
    label: 'মেডিসিনাল ট্রিট্মেন্ট',
    value: 'মেডিসিনাল ট্রিট্মেন্ট',
  },
  {
    label: 'অন্যান্য',
    value: 'অন্যান্য',
  },
  {
    label: 'প্রযোজ্য নয়',
    value: 'প্রযোজ্য নয়',
  },
];

const SCREEN_NAME = constants.PROF_REGISTER_STEP_2;

const RegisterStep2 = () => {
  useBackPress(SCREEN_NAME);
  const { ApiExecutor } = useHelper();

  const navigation = useNavigation();

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [specArea, setSpecArea] = useState(null);

  const initialState = {
    experience: '',
    eduQualification: '',
    specializationArea: '',
    otherSpecializationArea: '',
    fee: '',
    telephone: '',
  };
  const { formFields, createChangeHandler } = useFormFields(initialState);

  const HandleFormSubmit = async () => {
    let fields = { ...formFields };

    let fieldAbsent = false;
    for (let key in initialState) {
      if (key === 'specializationArea' || key === 'otherSpecializationArea') {
        if (fields['specializationArea'] === 'অন্যান্য') {
          if (fields.otherSpecializationArea === '') {
            fieldAbsent = true;
          }
        }
      } else if (fields[key] === '') {
        fieldAbsent = true;
      }
    }

    if (fieldAbsent) {
      setError('ফর্মটি সঠিকভাবে পূরণ করুন');
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await ApiExecutor(
      ApiDefinitions.registerProfessionalStep2({
        payload: fields,
      })
    );

    setIsLoading(false);

    if (response.success) {
      navigation.navigate(constants.PROF_REGISTER_STEP_3);
    } else {
      setError(response.error.message);
    }
  };

  return (
    <Container>
      <View style={styles.loginContainer}>
        <View style={styles.loginButtons}>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="account-tie"
            name="experience"
            placeholder="অভিজ্ঞতা"
            onChangeText={(text) => createChangeHandler(text, 'experience')}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="account-star"
            name="eduQualification"
            placeholder="শিক্ষাগত যোগ্যতা"
            onChangeText={(text) => createChangeHandler(text, 'eduQualification')}
          />

          <Picker
            width="92%"
            icon="card-account-details"
            placeholder="স্পেশ্যালাইজেশন এরিয়া"
            selectedItem={specArea}
            onSelectItem={(g) => setSpecArea(g)}
            items={specAreaLists}
            name="specializationArea"
            onChange={(text) => createChangeHandler(text, 'specializationArea')}
          />

          {formFields.specializationArea === 'অন্যান্য' && (
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              icon="card-account-details-outline"
              name="otherSpecializationArea"
              placeholder="এরিয়া উল্লেখ করুন"
              onChangeText={(text) => createChangeHandler(text, 'otherSpecializationArea')}
            />
          )}
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="cash"
            name="fee"
            placeholder="ফি"
            keyboardType="number-pad"
            onChangeText={(text) => createChangeHandler(text, 'fee')}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="phone-in-talk"
            name="telephone"
            placeholder="টেলিফোন নম্বর"
            keyboardType="number-pad"
            onChangeText={(text) => createChangeHandler(text, 'telephone')}
          />

          <Loader visible={isLoading} style={{ paddingTop: 10 }} />
          <ErrorButton visible={!!error && !isLoading} title={error} />
          <SubmitButton
            title={'সাবমিট করুন'}
            onPress={HandleFormSubmit}
            style={{ marginTop: 8 }}
            visible={!isLoading}
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
    paddingTop: 10,
  },

  loginButtons: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 5,
  },
});

export default RegisterStep2;
