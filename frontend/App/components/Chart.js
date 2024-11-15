import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import colors from '../config/colors';

const screenWidth = Dimensions.get('window').width * 0.99;
const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 1,
  decimalPlaces: 2,
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#ff2e63',
  },
  propsForLabels: {
    fontSize: 12.5,
  },
  fillShadowGradient: colors.primary,
  fillShadowGradientOpacity: 0.5,
};

function ingoreIndex(len) {
  if (len <= 6) return [];
  let idx = [];
  let ignore = len - 1;
  for (let i = len - 1; i >= 0; i--) {
    if (i === ignore) {
      ignore = ignore - Math.ceil(len / 5);
      continue;
    }
    idx.push(i);
  }
  return idx;
}

const AppChart = ({ data, labels }) => {
  //labels, data
  return (
    <LineChart
      data={{
        labels: labels,
        datasets: [{ data }],
      }}
      width={screenWidth} // from react-native
      height={250}
      yAxisInterval={1} // optional, defaults to 1
      chartConfig={chartConfig}
      bezier
      fromZero
      style={{
        marginTop: 10,
        paddingRight: 55,
      }}
      xLabelsOffset={-3}
      hidePointsAtIndex={ingoreIndex(data.length)}
      withDots={false}
    />
  );
};

export default AppChart;
