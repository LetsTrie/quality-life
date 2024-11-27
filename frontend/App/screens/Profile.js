import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import Button from '../components/Button';
import Block from '../components/Profile/Block';
import Table from '../components/Table';
import Text from '../components/Text';
import Tests from '../data/profileScales';
import getMatra from '../helpers/getMatra';
import { useBackPress } from '../hooks';
import constants from '../navigation/constants';
import { numberWithCommas } from '../utils/number';
import colors from '../config/colors';
import { lightenColor } from '../utils/ui';

const modifyDate = (date) => {
  if (!date) return null;

  const parts = moment(date, 'MMM DD, YYYY').format('L').toString().split('/');

  const month = parts[0];
  parts[0] = parts[1];
  parts[1] = month;
  parts[2] = parts[2][2] + parts[2][3];

  return parts.join('/');
};

const genderMap = (gender) => {
  if (gender === 'Male') return 'পুরুষ';
  if (gender === 'Female') return 'মহিলা';
  return 'অন্যান্য';
};

const tableHeaders = ['তারিখ', 'Test', 'মাত্রা'];
const tableColWidth = [75, 165, 70];

const SCREEN_NAME = constants.PROFILE;

const Profile = () => {
  useBackPress(SCREEN_NAME);

  const [tableData, setTableData] = useState([]);
  const navigation = useNavigation();
  const {
    name,
    age,
    gender,
    address,
    msm_score,
    moj_score,
    moj_date,
    mcn_score,
    mcn_date,
    dn_score,
    dn_date,
    mentalHealthProfile,
  } = useSelector((state) => state.user);

  let { isMarried } = useSelector((state) => state.user);
  isMarried = isMarried === 'Unmarried' ? 'অবিবাহিত' : 'বিবাহিত';

  useEffect(() => {
    let matra = getMatra(msm_score, moj_score, mcn_score, dn_score);
    matra = matra.map((m) => m.split('(')[1].split('মাত্রা)')[0]);
    let [_, lastMojScore, lastMcnScore, lastDnScore] = matra;

    const tableRows = [];

    tableRows.push([
      modifyDate(moj_date) ?? '-',
      'মানসিক অবস্থা যাচাইকরণ',
      modifyDate(moj_date) ? lastMojScore : '-',
    ]);

    tableRows.push([
      modifyDate(mcn_date) ?? '-',
      'মানসিক চাপ নির্ণয়',
      modifyDate(mcn_date) ? lastMcnScore : '-',
    ]);

    tableRows.push([
      modifyDate(dn_date) ?? '-',
      'দুশ্চিন্তা নির্ণয়',
      modifyDate(dn_date) ? lastDnScore : '-',
    ]);

    for (let row of tableRows) {
      if (row[2] != '-') {
        row[2] = `${row[2]}`;
      }
    }

    setTableData(() => tableRows);
  }, []);

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.block}>
        <Block name={'নাম'} data={name} icon={'account'} />
        <Block
          name={'ব্যক্তিগত বিবরণ'}
          data={`${numberWithCommas(age)} বছর, ${genderMap(gender)}, ${isMarried}`}
          icon={'account-details'}
        />
        <Block name={'বর্তমান ঠিকানা'} data={address} icon={'map-marker-radius'} />

        <Button
          title="আপডেট করুন"
          style={{ marginTop: 12, marginBottom: 20 }}
          onPress={() => navigation.navigate('UpdateProfile')}
        />
      </View>

      <View style={[styles.block, { paddingBottom: 23 }]}>
        <Text style={styles.blockHeader}>পূর্ববর্তী স্কোরসমূহ</Text>
        <Table tableData={tableData} tableHead={tableHeaders} widthArr={tableColWidth} />
      </View>

      <View style={[styles.block, { marginBottom: 20 }]}>
        <Text style={[styles.blockHeader]}>মানসিক স্বাস্থ্য প্রোফাইল</Text>

        <View styles={styles.listOfTestsContainer}>
          {Tests.map((test) => (
            <TouchableOpacity
              key={test.label}
              style={styles.testContainer}
              onPress={() =>
                navigation.navigate(constants.TEST, {
                  ...test,
                  goToBack: SCREEN_NAME,
                  fromProfile: true,
                })
              }
            >
              <Text style={styles.textStyle}>{test.label}</Text>

              <Image
                source={
                  mentalHealthProfile.includes(test.link)
                    ? require('../assests/images/done.png')
                    : require('../assests/images/pending.png')
                }
                style={styles.iconStyle}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  block: {
    elevation: 3,
    borderRadius: 10,
    marginTop: 20,
    marginHorizontal: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 25,
    backgroundColor: 'white',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,

    borderColor: lightenColor(colors.primary, 20),
    borderWidth: 0.5,
  },
  blockHeader: {
    textAlign: 'center',
    fontSize: 23,
    color: colors.primary,
    fontWeight: 'bold',
    paddingBottom: 22,
    paddingTop: 5,
  },
  BtnContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  BtnStyle: {
    borderRadius: 3.5,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginTop: 5,
    marginHorizontal: 5,
    backgroundColor: '#eee',
  },
  BtnTextStyle: {
    color: '#444',
  },
  listOfTestsContainer: {
    marginVertical: 20,
    paddingHorizontal: 15,
  },
  testContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.neutral,
    shadowColor: '#333',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  textStyle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  iconStyle: {
    height: 21,
    width: 21,
    alignSelf: 'center',
  },
});

export default Profile;
