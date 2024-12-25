import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Picker from '../../components/Picker';
import Text from '../../components/Text';
import AppTextInput from '../../components/TextInput';
import constants from '../../navigation/constants';
import { ApiDefinitions } from '../../services/api';
import { useBackPress, useHelper } from '../../hooks';
import { ErrorButton, Loader } from '../../components';
import { SubmitButton } from '../../components/SubmitButton';

const locationMap = {
  Dhaka: 'ঢাকা',
  Barisal: 'বরিশাল',
  Khulna: 'খুলনা',
  Chittagong: 'চট্টগ্রাম',
  Mymensingh: 'ময়মনসিংহ',
  Rajshahi: 'রাজশাহী',
  Sylhet: 'সিলেট',
  Rangpur: 'রংপুর',
  Others: 'অন্যান্য (উল্লেখ করুন)',
};

const initialClientData = Object.keys(locationMap).map((d) => {
  return {
    location: d,
    count: '',
  };
});

const optionList = ['০-৫ জন', '৬-১০ জন', '১১-১৫ জন', '১৬-২০ জন', '২১ বা তার উর্ধে'].map((m) => ({
  label: m,
  value: m,
}));

const SCREEN_NAME = constants.PROF_REGISTER_STEP_4;

const RegisterStep4 = () => {
  useBackPress(SCREEN_NAME);

  const { ApiExecutor } = useHelper();
  const navigation = useNavigation();

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [option1, setOption1] = useState(null);
  const [option2, setOption2] = useState(null);
  const [numOfClient, setNumOfClient] = useState(initialClientData);
  const [ref, setRef] = useState('');

  const numOfClientHandler = (index, value) => {
    setNumOfClient((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, count: value } : item))
    );
  };

  const handleSubmit = async () => {
    const payload = {
      maximumWeeklyClient: option1?.label,
      averageWeeklyClient: option2?.label,
      numberOfClients: numOfClient,
      reference: ref,
    };

    console.log(numOfClient);

    if (!payload.maximumWeeklyClient || !payload.averageWeeklyClient) {
      setError('ফর্মটি সঠিকভাবে পূরণ করুন');
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await ApiExecutor(ApiDefinitions.registerProfessionalStep4({ payload }));

    setIsLoading(false);

    if (response.success) {
      navigation.navigate(constants.PROF_HOMEPAGE);
    } else {
      setError(response.error.message);
    }
  };

  return (
    <ScrollView style={styles.ScrollViewStyle}>
      <View style={styles.mainContainerStyle}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionTextStyle}>
            আপনার মতে আপনি সপ্তাহে সর্বোচ্চ কতজন ক্লায়েন্টকে সেবা দিতে পারবেন?
          </Text>
          <Picker
            width="98%"
            selectedItem={option1}
            onSelectItem={(g) => setOption1(g)}
            items={optionList}
            placeholder="সিলেক্ট করুন"
            style={{
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#ccc',
              marginRight: 5,
              padding: 10,
              backgroundColor: '#fff',
            }}
            placeholderColor="gray"
          />
        </View>
        <View style={styles.questionContainer}>
          <Text style={styles.questionTextStyle}>
            বর্তমানে আপনি সপ্তাহে গড়ে কতজন ক্লায়েন্টকে সেবা দিচ্ছেন?
          </Text>
          <Picker
            width="98%"
            selectedItem={option2}
            onSelectItem={(g) => setOption2(g)}
            items={optionList}
            placeholder="সিলেক্ট করুন"
            style={{
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#ccc',
              marginRight: 5,
              padding: 10,
              backgroundColor: '#fff',
            }}
            placeholderColor="gray"
          />
        </View>
        <View style={styles.questionContainer}>
          <Text style={styles.questionTextStyle}>
            আপনার সেবা গ্রহণকারী ক্লায়েন্টের কতজন নিচে বর্ণিত স্থানগুলোতে অবস্থান করছেঃ
          </Text>
          <View>
            {numOfClient.map((item, index) => (
              <View style={styles.NumberInRegionContainer} key={item.location}>
                <Text style={styles.RegionNameStyle}>{locationMap[item.location]}:</Text>
                <TextInput
                  style={{
                    borderWidth: 0,
                    borderBottomColor: '#ccc',
                    borderBottomWidth: 1,
                    flex: 1,
                    fontSize: 15,
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={(text) => numOfClientHandler(index, text)}
                  placeholderTextColor={'#6e6969'}
                  keyboardType={
                    item.location === 'অন্যান্য (উল্লেখ করুন)' ? 'default' : 'number-pad'
                  }
                />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.questionContainer}>
          <Text style={styles.questionTextStyle}>
            আপনার নিকট বর্তমানে সেবা গ্রহণকারী অধিকাংশ ক্লায়েন্টের রেফারালের উৎস উল্লেখ করুনঃ
          </Text>
          <AppTextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="রেফারালের উৎস"
            onChangeText={(text) => setRef(text)}
            style={{
              borderRadius: 5,
              borderWidth: 1,
              borderColor: '#ccc',
              marginRight: 5,
              padding: 10,
              backgroundColor: '#fff',
              width: '98%',
            }}
          />
        </View>

        <View>
          <Loader visible={isLoading} style={{ marginBottom: 8, marginTop: -5 }} />
          <ErrorButton
            visible={!!error && !isLoading}
            title={error}
            style={{ borderRadius: 8, alignSelf: 'flex-start', width: '98%' }}
          />
          <SubmitButton
            title="সাবমিট করুন"
            onPress={handleSubmit}
            style={{ borderRadius: 8, marginTop: 8, alignSelf: 'flex-start', width: '98%' }}
            visible={!isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  ScrollViewStyle: {
    backgroundColor: 'white',
    flex: 1,
  },
  questionContainer: {
    marginBottom: 13,
  },
  questionTextStyle: {
    lineHeight: 26,
    fontSize: 18,
    textAlign: 'justify',
    width: '98%',
  },
  NumberInRegionContainer: {
    flexDirection: 'row',
    width: '96%',
    paddingVertical: 10,
  },
  RegionNameStyle: {
    fontSize: 18,
    alignSelf: 'center',
    paddingRight: 10,
  },
  mainContainerStyle: {
    margin: 13,
    marginBottom: 10,
  },
});

export default RegisterStep4;
