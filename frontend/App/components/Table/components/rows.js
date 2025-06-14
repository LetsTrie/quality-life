import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Cell } from './cell';

const sum = (arr) => arr.reduce((acc, n) => acc + n, 0);

export class Row extends Component {
  render() {
    const { data, style, widthArr, height, flexArr, textStyle, ...props } = this.props;
    let width = widthArr ? sum(widthArr) : 0;

    return data ? (
      <View style={[height && { height }, width && { width }, styles.row, style]}>
        {data.map((item, i) => {
          const flex = flexArr && flexArr[i];
          const wth = widthArr && widthArr[i];
          return (
            <Cell
              key={i}
              data={item}
              width={wth}
              height={height}
              flex={flex}
              textStyle={textStyle}
              {...props}
            />
          );
        })}
      </View>
    ) : null;
  }
}

export class Rows extends Component {
  render() {
    const { data, style, widthArr, heightArr, flexArr, textStyle, ...props } = this.props;
    const flex = flexArr ? sum(flexArr) : 0;
    const width = widthArr ? sum(widthArr) : 0;

    return data ? (
      <View style={[flex && { flex }, width && { width }]}>
        <FlatList
          style={{ marginBottom: 77 }}
          keyExtractor={(item, index) => index.toString()}
          data={data}
          renderItem={({ item, index }) => {
            const height = heightArr && heightArr[i];
            return (
              <Row
                key={index}
                data={item}
                widthArr={widthArr}
                height={height}
                flexArr={flexArr}
                style={style}
                textStyle={textStyle}
                {...props}
              />
            );
          }}
        />
      </View>
    ) : null;
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
});
