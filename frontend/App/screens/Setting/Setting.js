import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import Text from '../../components/Text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { connect } from 'react-redux';
import { logoutAction } from '../../redux/actions/auth';
import { useHelper } from '../../contexts/helper';

const Setting = ({ navigation, ...props }) => {
  const { logout } = useHelper();
  return (
    <>
      <View style={styles.BtnContainer}>
        <TouchableOpacity style={styles.BtnStyle} onPress={() => navigation.navigate('AboutUs')}>
          <MaterialCommunityIcons
            name={'information-outline'}
            style={styles.iconStyle}
            size={20}
            color={'#444'}
          />
          <Text style={styles.textStyle}> About us </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.BtnStyle}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <MaterialCommunityIcons
            name={'shield-account-outline'}
            style={styles.iconStyle}
            size={20}
            color={'#444'}
          />
          <Text style={styles.textStyle}> Privacy policy </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.BtnStyle} onPress={logout}>
          <MaterialCommunityIcons
            name={'exit-to-app'}
            style={styles.iconStyle}
            size={20}
            color={'#444'}
          />
          <Text style={styles.textStyle}> Sign out </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  BtnContainer: {
    padding: 8,
    paddingTop: 20,
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  BtnStyle: {
    margin: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
    elevation: 1,
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 5,
    padding: 13,
    paddingLeft: 15,
    backgroundColor: '#fff',
    marginBottom: 7,
  },
  iconStyle: {
    fontSize: 22.5,
    alignSelf: 'center',
    paddingRight: 13,
  },
  textStyle: {
    fontSize: 17.5,
    fontWeight: '300',
    color: '#333',
    alignSelf: 'center',
  },
});

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  jwtToken: state.auth.jwtToken,
  name: state.user.name,
  age: state.user.age,
  gender: state.user.gender,
  isMarried: state.user.isMarried,
  address: state.user.address,
  msm_score: state.user.msm_score,
  msm_date: state.user.msm_date,
  moj_score: state.user.moj_score,
  moj_date: state.user.moj_date,
  mcn_score: state.user.mcn_score,
  mcn_date: state.user.mcn_date,
  dn_score: state.user.dn_score,
  dn_date: state.user.dn_date,
  mentalHealthProfile: state.user.mentalHealthProfile,
});

export default connect(mapStateToProps, { logoutAction })(Setting);
