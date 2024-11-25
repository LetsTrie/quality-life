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

// Updated At: 22/03/2024
// Updated By: MD. Sakib Khan

const modifyDate = (date) => {
  if (!date) return null;

  const parts = moment(date, 'MMM DD, YYYY').format('L').toString().split('/');

  const month = parts[0];
  parts[0] = parts[1];
  parts[1] = month;
  parts[2] = parts[2][2] + parts[2][3];

  return parts.join('/');
};

const tableHeaders = ['তারিখ', 'Test', 'মাত্রা'];
const tableColWidth = [75, 150, 65];

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
    <ScrollView style={{ paddingBottom: 10 }}>
      <View style={styles.block}>
        <Block name={'নাম'} data={name} icon={'account'} />
        <Block name={'বয়স'} data={age} icon={'account-clock'} />
        <Block name={'লিঙ্গ'} data={gender} icon={'gender-male-female-variant'} />
        <Block name={'বৈবাহিক অবস্থা'} data={isMarried} icon={'card-account-details-star'} />
        <Block name={'বর্তমান ঠিকানা'} data={address} icon={'map-marker-radius'} />

        <Button
          title="Edit Profile"
          style={{ marginTop: 7 }}
          onPress={() => navigation.navigate('UpdateProfile')}
        />
      </View>

      <View style={[styles.block, { paddingBottom: 23 }]}>
        <Text style={styles.blockHeader}>পূর্ববর্তী স্কোরসমূহ</Text>
        <Table tableData={tableData} tableHead={tableHeaders} widthArr={tableColWidth} />
      </View>

      <View style={styles.block}>
        <Text style={[styles.blockHeader, { fontSize: 26 }]}>মানসিক স্বাস্থ্য প্রোফাইল</Text>

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
  blockHeader: {
    textAlign: 'center',
    fontSize: 26,
    color: '#555',
    fontWeight: '300',
    paddingBottom: 18,
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
    elevation: 1,
  },
  BtnTextStyle: {
    color: '#444',
  },
  listOfTestsContainer: {},
  testContainer: {
    elevation: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',

    borderColor: '#eee',
    borderWidth: 1,
    backgroundColor: 'white',

    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    paddingVertical: 13,
    backgroundColor: '#fefefe',
  },
  textStyle: {
    color: '#333',
    fontSize: 15,
  },
  iconStyle: {
    alignSelf: 'center',
    paddingLeft: 10,
    paddingRight: 5,
    height: 18,
    width: 18,
  },
});

export default Profile;
