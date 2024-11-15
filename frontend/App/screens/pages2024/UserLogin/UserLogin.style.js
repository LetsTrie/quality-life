import { StyleSheet } from 'react-native';
import colors from '../../../config/colors';

const BORDER_RADIUS = 35;

export default StyleSheet.create({
  loginContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
  },
  loginButtons: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 20,
  },
  lowerTexts: {
    fontWeight: 'bold',
    fontSize: 14.5,
    color: '#5e5e5e',
    marginTop: 6,
    paddingTop: 10,
    textAlign: 'right',
  },
  ForgetPass: {
    width: '88%',
  },
  errorButton: {
    marginVertical: 10,
    marginBottom: 0,
    padding: 15,
    backgroundColor: 'white',
    borderColor: colors.primary,
    borderWidth: 3,
  },
  errorButtonText: {
    fontSize: 14.5,
    color: colors.primary,
  },
  submitButton: {
    marginVertical: 10,
    marginBottom: 0,
  },
});
