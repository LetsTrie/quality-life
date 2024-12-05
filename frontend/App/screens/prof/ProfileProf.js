import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AppButton from '../../components/Button';
import Block from '../../components/Profile/Block';
import { useNavigation } from '@react-navigation/native';
import constants from '../../navigation/constants';
import { useBackPress } from '../../hooks';

const SCREEN_NAME = constants.PROF_PROFILE;

const ProfileProf = (props) => {
  throw new Error('Function not implemented.');

  // useBackPress(SCREEN_NAME);
  // const navigation = useNavigation();

  // return (
  //   <ScrollView style={{ paddingBottom: 10 }}>
  //     <View style={styles.block}>
  //       <Block name={'Name'} data={props?.name} icon={'account'} />
  //       <Block name={'Email'} data={props?.email} icon={'email'} />
  //       <Block name={'Profession'} data={props?.profession} icon={'briefcase-account'} />
  //       <Block name={'Designation'} data={props?.designation} icon={'card-account-details-star'} />
  //       <Block name={'Edu. Qualifications'} data={props?.eduQualification} icon={'book-open'} />
  //       <Block name={'Experience'} data={props?.experience} icon={'stethoscope'} />
  //       <Block name={'Fee'} data={props?.fee} icon={'credit-card'} />

  //       <AppButton
  //         title="Edit Profile"
  //         style={{ marginTop: 7 }}
  //         onPress={() => navigation.navigate('UpdateProfilePorf')}
  //       />
  //     </View>
  //   </ScrollView>
  // );
};

const styles = StyleSheet.create({
  block: {
    elevation: 3,
    borderRadius: 5,
    marginTop: 20,
    marginHorizontal: 15,
    paddingHorizontal: 18,
    paddingVertical: 10,
    paddingTop: 25,
    backgroundColor: 'white',
  },
});

const mapStateToProps = (state) => ({
  prof: state.prof?.prof,
  name: state.prof?.name,
  email: state.prof?.email,
  profession: state.prof?.profession,
  designation: state.prof?.designation,
  eduQualification: state.prof?.eduQualification,
  experience: state.prof?.experience,
  fee: state.prof?.fee,
});

export default ProfileProf;
