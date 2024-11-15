import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Table from '../components/Table';
import Chart from '../components/Chart';
import testData from '../data/scales/content';
import axios from 'axios';
import BaseUrl from '../config/BaseUrl';
import { connect } from 'react-redux';
import { logoutAction } from '../redux/actions/auth';
import colors from '../config/colors';
import Text from '../components/Text';

const ResultHistory = ({ navigation, route, ...props }) => {
  let { link, type } = route.params;
  let testInfo = testData.find((t) => t.id === link);
  const { jwtToken, isAuthenticated, logoutAction } = props;

  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [label, setLabel] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      logoutAction();
      navigation.navigate('Login');
    }
    const getData = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        };
        const response = await axios.get(
          `${BaseUrl}/user/result-history-data/${type}`,
          { headers }
        );
        const tests = response.data.tests;
        let testArray = [];
        const dataArray = [];
        const dateArray = [];
        for (let test of tests) {
          let singleTestArray = [];
          singleTestArray.push(test.date);
          singleTestArray.push(`${test.score}`);
          singleTestArray.push(test.severity);
          testArray.push(singleTestArray);
          dataArray.unshift(parseInt(test.score));
          const fDate = test.date.split('/');
          dateArray.unshift(`${fDate[0]}/${fDate[1]}/${fDate[2].slice(2)}`);
        }
        setTableData(testArray);
        setData(dataArray);
        setLabel(dateArray);
      } catch (e) {
        if (e?.response?.status === 401) {
          console.error(e);
          logoutAction();
          navigation.navigate('Login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, []);

  return (
    <>
      {isLoading ? (
        <>
          <View
            style={{
              textAlign: 'center',
              width: '100%',
              paddingTop: 10,
            }}
          >
            <ActivityIndicator size='large' color={colors.primary} />
          </View>
        </>
      ) : (
        <>
          {data.length === 0 ? (
            <Text
              style={{
                textAlign: 'center',
                fontSize: 25,
                fontWeight: 'bold',
                paddingTop: 15,
              }}
            >
              No history available
            </Text>
          ) : (
            <View style={styles.resultContainer}>
              <Chart data={data} labels={label} />
              <Table widthArr={[100, 100, 120]} tableData={tableData} />
            </View>
          )}
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  resultContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 15,
  },
});

const mapStateToProps = (state) => ({
  jwtToken: state.auth.jwtToken,
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { logoutAction })(ResultHistory);
