import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Button from '../../components/Button';
import Picker from '../../components/Picker';
import Text from '../../components/Text';
import colors from '../../config/colors';
import constants from '../../navigation/constants';
import { ApiDefinitions } from '../../services/api';
import { useBackPress, useHelper } from '../../hooks';
import { ErrorButton, Loader } from '../../components';
import { SubmitButton } from '../../components/SubmitButton';

const days = [
  {
    label: 'Sunday',
    value: 'রবিবার',
  },
  {
    label: 'Monday',
    value: 'সোমবার',
  },
  {
    label: 'Tuesday',
    value: 'মঙ্গলবার',
  },
  {
    label: 'Wednesday',
    value: 'বুধবার',
  },
  {
    label: 'Thursday',
    value: 'বৃহস্পতিবার',
  },
  {
    label: 'Friday',
    value: 'শুক্রবার',
  },
  {
    label: 'Saturday',
    value: 'শনিবার',
  },
];

function calculateTime(from, fromAmPm) {
  if (from > 24) {
    (from = from - 24), (fromAmPm = 'AM');
  } else if (from === 24) {
    from = 12;
    fromAmPm = 'AM';
  } else if (from > 12) {
    (from = from - 12), (fromAmPm = 'PM');
  } else if (from === 12) {
    fromAmPm = 'PM';
  }
  return [from, fromAmPm];
}

const times = [];
for (let i = 0; i < 24; i++) {
  let [from, fromAmPm] = calculateTime(6 + i, 'AM');
  times.push({
    label: `${from}:00${fromAmPm}`,
    value: `${from}:00${fromAmPm}`,
  });
}

const SCREEN_NAME = constants.PROF_REGISTER_STEP_3;

const RegisterProStep3 = () => {
  useBackPress(SCREEN_NAME);
  const { ApiExecutor } = useHelper();

  const navigation = useNavigation();

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [SundayFrom, setSundayFrom] = useState(null);
  const [SundayTo, setSundayTo] = useState(null);
  const [SundayTime, setSundayTime] = useState([]);

  const [MondayFrom, setMondayFrom] = useState(null);
  const [MondayTo, setMondayTo] = useState(null);
  const [MondayTime, setMondayTime] = useState([]);

  const [TuesdayFrom, setTuesdayFrom] = useState(null);
  const [TuesdayTo, setTuesdayTo] = useState(null);
  const [TuesdayTime, setTuesdayTime] = useState([]);

  const [WednesdayFrom, setWednesdayFrom] = useState(null);
  const [WednesdayTo, setWednesdayTo] = useState(null);
  const [WednesdayTime, setWednesdayTime] = useState([]);

  const [ThursdayFrom, setThursdayFrom] = useState(null);
  const [ThursdayTo, setThursdayTo] = useState(null);
  const [ThursdayTime, setThursdayTime] = useState([]);

  const [FridayFrom, setFridayFrom] = useState(null);
  const [FridayTo, setFridayTo] = useState(null);
  const [FridayTime, setFridayTime] = useState([]);

  const [SaturdayFrom, setSaturdayFrom] = useState(null);
  const [SaturdayTo, setSaturdayTo] = useState(null);
  const [SaturdayTime, setSaturdayTime] = useState([]);

  const selectHook = (day) => {
    if (day === 'Sunday') {
      return {
        to: [SundayFrom, setSundayFrom],
        from: [SundayTo, setSundayTo],
        time: [SundayTime, setSundayTime],
      };
    }
    if (day === 'Monday') {
      return {
        to: [MondayFrom, setMondayFrom],
        from: [MondayTo, setMondayTo],
        time: [MondayTime, setMondayTime],
      };
    }
    if (day === 'Tuesday') {
      return {
        to: [TuesdayFrom, setTuesdayFrom],
        from: [TuesdayTo, setTuesdayTo],
        time: [TuesdayTime, setTuesdayTime],
      };
    }
    if (day === 'Wednesday') {
      return {
        to: [WednesdayFrom, setWednesdayFrom],
        from: [WednesdayTo, setWednesdayTo],
        time: [WednesdayTime, setWednesdayTime],
      };
    }
    if (day === 'Thursday') {
      return {
        to: [ThursdayFrom, setThursdayFrom],
        from: [ThursdayTo, setThursdayTo],
        time: [ThursdayTime, setThursdayTime],
      };
    }
    if (day === 'Friday') {
      return {
        to: [FridayFrom, setFridayFrom],
        from: [FridayTo, setFridayTo],
        time: [FridayTime, setFridayTime],
      };
    }
    if (day === 'Saturday') {
      return {
        to: [SaturdayFrom, setSaturdayFrom],
        from: [SaturdayTo, setSaturdayTo],
        time: [SaturdayTime, setSaturdayTime],
      };
    }
  };

  const onPressHandler = (day) => {
    const sHook = selectHook(day);

    if (!(sHook.from[0] && sHook.to[0])) return;

    sHook.time[1]((prev) => [...prev, { from: sHook.from[0], to: sHook.to[0] }]);
    sHook.from[1](null);
    sHook.to[1](null);
  };

  const deleteTime = (day, from, to) => {
    const sHook = selectHook(day);
    sHook.time[1]((prev) =>
      prev.filter((p) => !(p.from.value === from.value && p.to.value === to.value))
    );
  };

  const onSubmitHandler = async () => {
    setIsLoading(true);
    setError(null);

    const availableTime = days
      .map((ed) => ed.label)
      .map((day) => {
        const sh = selectHook(day);
        const timeRange = sh.time[0].map((t) => ({
          from: t.from.value,
          to: t.to.value,
        }));
        return { day, timeRange };
      });

    const payload = { availableTime };

    const response = await ApiExecutor(ApiDefinitions.registerProfessionalStep3({ payload }));

    setIsLoading(false);

    if (!response.success) {
      setError(response.error.message);
      return;
    }

    navigation.navigate(constants.PROF_REGISTER_STEP_4);
  };

  const SelectedTimeTable = ({ day }) => {
    const sh = selectHook(day);
    return sh.time[0].map((s) => (
      <View style={styles.selectedTimesStyle} key={`${s.from.value} - ${s.to.value}`}>
        <Text style={styles.selectedTimeTextStyle}>{`${s.from.value} - ${s.to.value}`}</Text>

        <MaterialCommunityIcons
          name={'close-circle-outline'}
          size={20}
          style={styles.iconStyle}
          onPress={() => deleteTime(day, s.from, s.to)}
        />
      </View>
    ));
  };

  return (
    <>
      <ScrollView style={{ backgroundColor: 'white' }}>
        <View>
          {/* Header */}
          <View style={styles.headerContainerStyle}>
            <Text style={styles.headerStyle}>
              মোবাইল অ্যাপ্লিকেশনের মাধ্যমে মানসিক স্বাস্থ্য সেবা প্রদানে বরাদ্দকৃত সময়ঃ
            </Text>
          </View>

          {/* Schedule */}
          <View style={styles.scheduleContainerStyle}>
            {days.map((d) => (
              <View key={d.value} style={styles.eachScheduleContainer}>
                <View style={styles.dayContainerStyle}>
                  <Text style={styles.dayTextStyle}>{d.value}</Text>
                </View>

                <View style={styles.pickerContainer}>
                  <Picker
                    width="38%"
                    placeholder="From"
                    selectedItem={selectHook(d.label).from[0]}
                    onSelectItem={(g) => selectHook(d.label).from[1](g)}
                    items={times}
                    style={{
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      marginRight: 5,
                      padding: 10,
                      backgroundColor: '#fff',
                    }}
                  />
                  <Picker
                    width="38%"
                    placeholder="To"
                    selectedItem={selectHook(d.label).to[0]}
                    onSelectItem={(g) => selectHook(d.label).to[1](g)}
                    items={times}
                    style={{
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: '#ccc',
                      padding: 10,
                      backgroundColor: '#fff',
                    }}
                  />

                  <TouchableOpacity
                    style={styles.AddBtnStyle}
                    onPress={() => onPressHandler(d.label)}
                  >
                    <Text style={styles.addBtnTextStyle}> Add </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.selectedTimesContainer}>
                  <SelectedTimeTable day={d.label} />
                </View>
              </View>
            ))}
          </View>

          <View>
            <Loader visible={isLoading} style={{ paddingBottom: 10 }} />
            <ErrorButton visible={!!error} title={error} />
            <SubmitButton
              title={'সাবমিট করুন'}
              onPress={onSubmitHandler}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  selectedTimesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  selectedTimesStyle: {
    backgroundColor: colors.primary,
    marginRight: 10,
    padding: 10,
    paddingVertical: 6,
    borderRadius: 5,
    elevation: 1,
    position: 'relative',
    marginBottom: 5,
  },
  selectedTimeTextStyle: {
    fontSize: 15,
    color: 'white',
  },
  iconStyle: {
    position: 'absolute',
    right: -5,
    top: '-50%',
    fontSize: 20,
    backgroundColor: 'white',
    borderRadius: 100,
  },
  headerContainerStyle: {
    paddingTop: 14,
  },
  headerStyle: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 29,
  },
  scheduleContainerStyle: {
    padding: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  eachScheduleContainer: {
    paddingBottom: 6,
  },
  dayContainerStyle: {},
  dayTextStyle: {
    fontSize: 18.5,
  },
  pickerContainer: {
    flexDirection: 'row',
  },
  AddBtnStyle: {
    backgroundColor: colors.primary,
    flexDirection: 'column',
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 4,
    marginTop: 10,
    marginLeft: 4,
  },
  addBtnTextStyle: {
    color: 'white',
    fontSize: 16,
  },
  text: {
    color: colors.primary,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default RegisterProStep3;
