import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect } from 'react';
import { BackHandler, Image, View } from 'react-native';
import Swiper from 'react-native-swiper';
import { useSelector } from 'react-redux';
import { AppButton, AppText } from '../../../components';
import styles from './Welcome.style';
import constants from '../../../navigation/constants';
import { RoleEnum } from '../../../utils/roles';

const ImageSlider = () => {
  return (
    <View style={styles.imageContainer}>
      <Swiper loop autoplay showsPagination={false}>
        <Image style={styles.image} source={require('../../../assests/images/Slide1.jpg')} />
        <Image style={styles.image} source={require('../../../assests/images/Slide2.jpg')} />
        <Image style={styles.image} source={require('../../../assests/images/Slide3.jpg')} />
      </Swiper>
    </View>
  );
};

export const Welcome = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation.isFocused() && route.name === constants.WELCOME) {
        BackHandler.exitApp();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const tokenBasedRedirection = useCallback(() => {
    if (!isAuthenticated) return false;

    switch (role) {
      case RoleEnum.USER:
        navigation.navigate(constants.HOMEPAGE);
        break;
      case RoleEnum.PROFESSIONAL:
        navigation.navigate(constants.PROF_HOMEPAGE);
        break;
      default:
        return false;
    }

    return true;
  }, [isAuthenticated, role, navigation]);

  const authNavigate = (defaultRoute) => {
    return () => {
      if (!tokenBasedRedirection()) {
        navigation.navigate(defaultRoute);
      }
    };
  };

  return (
    <View style={styles.container}>
      <ImageSlider />
      <>
        <AppText style={styles.headerText}>Qlife</AppText>
        <AppText style={styles.subHeaderText}>
          মানসিক স্বাস্থ্য সম্পর্কিত যেকোনো ধরনের তথ্য এবং বিভিন্ন টেস্ট আপনি এই অ্যাপ থেকে পাবেন।
          বিভিন্ন চিকিৎসক এবং স্বাস্থ্যকেন্দ্রে আপনি এই অ্যাপটি থেকে যোগাযোগ করতে পারবেন।
        </AppText>
        <View>
          <AppButton title="সাইন ইন করুন" onPress={authNavigate(constants.LOGIN)} />
          <AppButton
            title="অ্যাকাউন্ট তৈরি করুন"
            onPress={authNavigate(constants.USER_REGISTER_CONSENT)}
          />
        </View>
      </>
    </View>
  );
};
