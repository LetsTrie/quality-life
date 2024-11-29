import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect } from 'react';
import { BackHandler, Image, StyleSheet, View } from 'react-native';
import Swiper from 'react-native-swiper';
import { useDispatch, useSelector } from 'react-redux';
import { AppButton, AppText } from '../../../components';
import constants from '../../../navigation/constants';
import { RoleEnum } from '../../../utils/roles';
import { ApiDefinitions } from '../../../services/api';
import { useHelper } from '../../../hooks';
import { storeUserProfile } from '../../../redux/actions/user';
import colors from '../../../config/colors';
import { storeProfessionalsProfile } from '../../../redux/actions/prof';

const ImageSlider = () => {
  return (
    <View style={styles.imageContainer}>
      <Swiper loop autoplay showsPagination={false}>
        <Image style={styles.image} source={require('../../../assests/images/Slide1.jpg')} />
        <Image style={styles.image} source={require('../../../assests/images/Slide3.jpg')} />
      </Swiper>
    </View>
  );
};

export const Welcome = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  const { ApiExecutor } = useHelper();

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

  const tokenBasedRedirection = useCallback(async () => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      switch (role) {
        case RoleEnum.USER:
          const userResponse = await ApiExecutor(ApiDefinitions.userProfile());
          if (!userResponse.success) return;

          dispatch(storeUserProfile(userResponse.data.user));
          navigation.navigate(constants.HOMEPAGE);
          break;

        case RoleEnum.PROFESSIONAL:
          const profResponse = await ApiExecutor(ApiDefinitions.getProfessionalsProfile());

          if (!profResponse.success) return;

          dispatch(storeProfessionalsProfile(profResponse.data.prof));
          navigation.navigate(constants.PROF_HOMEPAGE);
          break;

        default:
          return false;
      }
    } catch (error) {
      console.error('Error during token-based redirection:', error.message);
      return false;
    }

    return true;
  }, [isAuthenticated, role, dispatch, navigation, ApiExecutor]);

  const authNavigate = useCallback(
    (defaultRoute) => async () => {
      const redirectionHandled = await tokenBasedRedirection();
      if (typeof redirectionHandled === 'boolean' && !redirectionHandled) {
        navigation.navigate(defaultRoute);
      }
    },
    [navigation, tokenBasedRedirection]
  );

  return (
    <View style={styles.container}>
      <ImageSlider />
      <View style={styles.content}>
        <AppText style={styles.headerText}>কোয়ালিটি লাইফ</AppText>
        <AppText style={styles.subHeaderText}>
          মানসিক স্বাস্থ্য সম্পর্কিত যেকোনো তথ্য এবং বিভিন্ন টেস্ট আপনি এই অ্যাপ থেকে পাবেন। বিভিন্ন
          চিকিৎসক এবং স্বাস্থ্যকেন্দ্রে আপনি এই অ্যাপটি থেকে যোগাযোগ করতে পারবেন।
        </AppText>
        <AppButton
          title="অ্যাপে প্রবেশ করুন"
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={authNavigate(constants.LOGIN)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  imageContainer: {
    height: '45%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    maxWidth: '100%',
    height: '100%',
  },
  dot: {
    backgroundColor: '#d9d9d9',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#2d4059',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 3,
  },
  content: {
    marginTop: 20,
    paddingHorizontal: 30,
  },
  headerText: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginVertical: 15,
    marginTop: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'justify',
    lineHeight: 24,
    marginBottom: 15,
  },
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 3,
    width: '100%',
  },
  buttonText: {
    fontSize: 16.5,
    color: '#ffffff',
    fontWeight: 'bold',
    marginVertical: 3,
    textTransform: 'uppercase',
  },
});
