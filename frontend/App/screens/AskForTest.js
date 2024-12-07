import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import Button from '../components/Button';
import AppModal from '../components/Modal';
import Text from '../components/Text';
import scaleContent from '../data/scales/content';
import { useBackPress } from '../hooks';
import constants from '../navigation/constants';

const SCREEN_NAME = constants.ASK_FOR_TEST;
const AskForTest = ({ navigation, route }) => {
  let { scaleId, goToBack } = route.params;

  console.log(route.params);

  useBackPress(SCREEN_NAME, goToBack);

  const [modalVisible, setModalVisible] = useState(false);
  const scale = useMemo(() => scaleContent.find((_scale) => _scale.id === scaleId), [scaleId]);

  const getDetails = () => {
    if (!scale || !scale.title) {
      console.error('Scale not found');
      return;
    }

    switch (scale?.title) {
      case 'মানসিক অবস্থা যাচাইকরণ':
        return [
          'মানসিক অবস্থা যাচাই করার জন্য জেনারেল হেলথ কোশ্চেনেয়ার ১২ (GHQ-12) বাংলা ভাষায় অনুবাদ করা হয়। সাধারণ মানসিক স্বাস্থ্য পরিমাপের জন্য এটি বহুল ব্যবহৃত একটি পরিমাপক। এটি মুলত সামান্য মানসিক সমস্যা সনাক্ত করার জন্য একটি স্ক্রিনিং টেস্ট হিসেবে তৈরি করা হয়েছে। এর মাধ্যমে সাস্থের আবেগিক ও শারীরিক লক্ষণ পরিবর্তন সনাক্ত করা যায়। যেমন- চাপ কিংবা বিষন্নতা অনুভুতি, পরিস্থিতি সামলানোর অক্ষমতা, দুশ্চিন্তা কারণজনিত অনিদ্রা, আত্মবিশ্বাসের অভাব ইত্যাদি।',
        ];
      case 'মানসিক চাপ নির্ণয়':
        return [
          'চাপ (মানসিক এবং শারীরিক) হচ্ছে এমন একটি অবস্থা যা ব্যাক্তিগত বা পরিবেশ থেকে তৈরী হওয়া প্রত্যাশা বা চাহিদা এবং আমাদের ক্ষমতার মধ্যে এক ধরনের ভারসম্যহীনতা তৈরি করে। কখনও কখনও চাপ দারুন ফলাফল আনে , যার মধ্যে আছে উচ্চ কর্মসম্পাদন , উদ্ভাবনমূলক ফলাফল এবং দ্রুততার সাথে দলবদ্ধভাবে কাজ করা ইত্যাদি। যখন চাপ অত্যন্ত বেশি হয়ে যায় এবং এটা অনুপযুক্তভাবে মোকাবিলা করা হয়, তখন এটা আমাদের চিন্তা-ভাবনা এবং অনুভূতিকে নেতিবাচকভাবে প্রভাবিত করে। দীর্ঘমেয়াদী চাপ আমাদের মানসিক শক্তি নিঃশেষিত করে। আমাদের স্বাস্থ্য, যোগ্যতা এবং সম্পর্কগুলি প্রভাবিত করতে শুরু করে।',
          ':::Stress / মানসিক চাপ উপসর্গ',
          `চাপের প্রকৃতির উপর, এবং তাছাড়া কোন পর্যায়ে ব্যক্তিটি আছেন, তার উপর নির্ভর করে চাপের উপসর্গগুলি বিভিন্ন ধরণের হতে পারে। যেমন-
● রাগ, বিষণ্ণতা এবং/অথবা উদ্বেগ হওয়া।
● পিঠে ব্যথা, মাথাধরা এবং চোয়াল ব্যথার মত পেশীর সমস্যা। এটা পেশীতে টান ধরার থেকে পেশী এবং লিগামেন্ট (দুটো হাড় বা জোড়ের বন্ধনী) সমস্যাগুলির দিকেও নিয়ে যেতে পারে। 
● কোষ্ঠকাঠিন্য, বিরক্তিকর পেটের সমস্যা, বুকজ্বালা এবং পেট-ফাঁপাসহ পাকস্থলীর অসুখ।
● মাথাঘোরা, বুক ধড়ফড়, হাত-পা ঠাণ্ডা, শ্বাসকষ্ট, বর্ধিত রক্তচাপ, মাথাধরা এবং ঘামে-ভেজা হাতের তালু সহ উত্তেজনার উপসর্গ। 
● আগ্রাসন (আক্রমণাত্মক মনোভাব), ধৈর্য্যহীনতা।
● সবকিছু সম্বন্ধে অন্তহীন দুশ্চিন্তা, নিরাশার অনুভূতি এবং অবিশ্বাস।
● বুক ব্যথা, বুকে চাপ লাগা,  আধকপালে (মাইগ্রেন) এবং হার্টের সমস্যা।
● সারাক্ষণ নিখুঁত থাকার চাহিদা।
● এত লম্বা সময় ধরে চাপ সামাল দেওয়ার কারণে গুরুতর মানসিকভাবে বিপর্যস্ততা।`,
        ];
      default:
        return [
          'Anxiety বা উদ্বেগ এক ধরনের আবেগ। সাধারণত আমারা এই আবেগ বুঝতে পারি আমাদের শারীরিক পরিবর্তনের মাধ্যমে, যেমন- গরম না লাগলেও ঘাম হওয়া, দ্রুত শ্বাস নেওয়া, রক্তচাপ বেড়ে যাওয়া ইত্যাদি।  কোনও কোনও ভয়, মানসিক চাপ বা নেতিবাচক চিন্তা-ভাবনা থেকে উদ্বেগ তৈরী হতে পারে।  কিছু ক্ষেত্রে এই অনুভূতি বহুক্ষণ ধরে থাকে। প্রায় সব ক্ষেত্রেই কোনও ঘটনা, কোনও বস্তু, বা কোনও ব্যক্তি এই অনুভূতির উৎস হয়ে থাকে। উদ্বেগ যদি এমন হয় যে, এটি আমাদের দৈনন্দিন কাজকর্মে ব্যাঘাত ঘটায়, কারনে-অকারনে অতিরিক্ত দুশ্চিন্তা হয়, তখন সেটি এক ধরনের মানসিক অসুস্থতাকে ( অ্যাংজাইটি ডিসঅর্ডার বা উদ্বেগজনিত বৈকল্য ) নির্দেশ করে।',
          'আমেরিকান সাইকোলজিক্যাল অ্যাসোশিয়েশনের মতে অ্যাংজাইটি ডিসঅর্ডার হল, এমন এক অনুভূতি যার কেন্দ্রে আছে চাপা উত্তেজনা, চিন্তা, এবং শারীরিক পরিবর্তন যেমন উচ্চ রক্তচাপ "। ',
          'চিন্তা যখন এমন চূড়ান্ত পর্যায়ে পৌছে যায় যেখানে শরীরকে প্রভাবিত করে ও শারীরিক কাজকর্মে ব্যাঘাত ঘটায় তখন সেই মানসিক অবস্থাকে দুশ্চিন্তা বলে। তবে, যদি কখনও এই অনুভূতি এমনভাবে বেড়ে যায় যে আপনার দৈনন্দিন জীবনে তাঁর প্রভাব পরতে থাকে তাহলে তাঁকে অ্যাংজাইটি ডিসঅর্ডার বলে।',
          ':::Anxiety এর উপসর্গ ',
          'অ্যাংজাইটি ডিসঅর্ডার হলে একগুচ্ছ উপসর্গ দেখা দিতে পারে। বিভিন্ন ধরনের উপসর্গের মধ্যে আছে ঘুমের সমস্যা, বুক ধড়ফড়, শ্বাসকষ্ট, অস্থিরতা, হাত-পা ঝিনঝিন করা, ঘাম দেওয়া, মাথাঘোরা এবং বমিভাব এবং পেশি টানটান হয়ে যাওয়া।',
        ];
    }
  };

  return (
    <>
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={require('../assests/images/ReadyForTest.png')}
          style={styles.imageBackground}
        >
          <LinearGradient
            colors={['#525252', '#757575']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.linearGradientStyle}
          ></LinearGradient>

          <View style={styles.container}>
            <View>
              <Text style={styles.headingText}>{scale.title}</Text>
            </View>
            <View style={styles.description}>
              <Text style={styles.descriptionText}>{scale.description}</Text>
            </View>
            <View style={styles.description}>
              <Text style={styles.copyrightText}>{scale.copyright}</Text>
            </View>
            <View>
              <Button
                title="স্কেলটি পূরণ করুন"
                onPress={() =>
                  navigation.navigate(constants.TEST, {
                    ...route.params,
                    scaleId,
                  })
                }
                textStyle={{ fontSize: 16 }}
              />
              <Button
                title="আগের রেজাল্ট গুলো দেখুন"
                onPress={() =>
                  navigation.navigate('ResultHistory', {
                    ...route.params,
                  })
                }
                textStyle={{ fontSize: 16 }}
              />
            </View>
            <TouchableOpacity
              style={styles.aboutDesc}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.aboutDescText}>বিস্তারিত পড়ুন </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
      <AppModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        title={scale?.title || 'Untitled'}
        description={getDetails()}
        scrollViewStyle={{ minHeight: 300 }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  imageBackground: {
    height: '100%',
    width: '100%',
  },
  linearGradientStyle: {
    opacity: 0.5,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    padding: 10,
  },
  headingText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 32,
    lineHeight: 45,
    letterSpacing: 0.2,
    fontWeight: '700',
  },
  descriptionText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 22.5,
    letterSpacing: 0.2,
    fontWeight: '700',
    lineHeight: 32,
    paddingHorizontal: 3,
  },
  copyrightText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: '700',
    paddingHorizontal: 3,
  },
  aboutDesc: {
    alignItems: 'center',
    paddingTop: 10,
    fontWeight: '700',
    fontSize: 18,
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    color: '#f8f1f1',
  },
  aboutDescText: {
    fontWeight: '700',
    fontSize: 18,
    textTransform: 'uppercase',
    color: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    letterSpacing: 1,
  },
});

export default AskForTest;
