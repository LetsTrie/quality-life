import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  headerText: {
    fontSize: 45,
    justifyContent: 'center',
    alignSelf: 'center',
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#2d4059',
    paddingBottom: 10,
    marginTop: 8,
  },
  subHeaderText: {
    width: '85%',
    alignSelf: 'center',
    fontSize: 15,
    color: '#7d9bbd',
    textAlign: 'center',
    lineHeight: 20,
    letterSpacing: 0.1,
    fontWeight: '300',
    paddingBottom: 20,
  },
});
