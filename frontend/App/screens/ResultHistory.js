import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Table from '../components/Table';
import Chart from '../components/Chart';
import { useHelper } from '../hooks';
import { useRoute } from '@react-navigation/native';
import { ApiDefinitions } from '../services/api';
import { ErrorButton, Loader } from '../components';
import Text from '../components/Text';
import colors from '../config/colors';

const ResultHistory = () => {
  const route = useRoute();
  const { ApiExecutor } = useHelper();

  let { type } = route.params;
  if (!type) {
    throw new Error('ResultHistory: type is required');
  }

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const [tableData, setTableData] = useState([]);
  const [label, setLabel] = useState([]);

  useEffect(() => {
    (async () => {
      const response = await ApiExecutor(
        ApiDefinitions.recent10TestResultsHistory({ type: route.params.type })
      );
      setIsLoading(false);
      if (!response.success) {
        setError(response.error.message);
        return;
      }
      const { tests } = response.data;
      console.log(tests);

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
    })();
  }, []);

  if (isLoading) {
    return <Loader visible={isLoading} style={{ marginVertical: 10 }} />;
  }

  if (error) {
    return <ErrorButton title={error} visible={!!error} style={{ marginVertical: 10 }} />;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <ErrorButton
        title={'কোনো তথ্য পাওয়া যায়নি'}
        visible={true}
        style={{ marginVertical: 10 }}
      />
    );
  }

  return (
    <View style={styles.resultContainer}>
      <Chart data={data} labels={label} />
      <Text style={styles.headerText}>সর্বশেষ ১০টি স্কোর</Text>
      <Table widthArr={[100, 100, 120]} tableData={tableData} />
    </View>
  );
};

const styles = StyleSheet.create({
  resultContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 15,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: colors.textSecondary,
    marginTop: 20,
  },
});

export default ResultHistory;
