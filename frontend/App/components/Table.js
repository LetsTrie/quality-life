import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import colors from '../config/colors';
import { Row, Table } from './Table/index';
import { lightenColor } from '../utils/ui';

const tD = [];
for (let i = 0; i < 10; i += 1) {
  const rowData = [];
  rowData.push('16/01/21');
  rowData.push('11:21 PM');
  rowData.push('25/100');
  tD.push(rowData);
}
const tableHead = ['তারিখ', 'স্কোর', 'মাত্রা'];

const AppTable = ({ tableData, widthArr }) => {
  return (
    <>
      {tableData && (
        <View style={[styles.container]}>
          <ScrollView horizontal={true}>
            <View style={{ backgroundColor: 'white', width: '100%' }}>
              <Table
                borderStyle={{
                  borderWidth: 1,
                  borderColor: lightenColor(colors.medium, 20),
                }}
              >
                <Row
                  data={tableHead}
                  style={styles.header}
                  textStyle={[styles.text, { color: 'white', fontWeight: '700', fontSize: 16 }]}
                  widthArr={widthArr}
                />
              </Table>
              <ScrollView style={styles.dataWrapper}>
                <Table
                  borderStyle={{ borderWidth: 1, borderColor: lightenColor(colors.accent, 20) }}
                >
                  {tableData.map((rowData, index) => (
                    <Row
                      key={index}
                      data={rowData}
                      style={[styles.row, index % 2 && { backgroundColor: colors.light }]}
                      textStyle={styles.text}
                      widthArr={widthArr}
                    />
                  ))}
                </Table>
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  header: { height: 40, backgroundColor: colors.tableHeader },
  text: {
    textAlign: 'center',
    color: '#444',
    fontSize: 13,
    paddingHorizontal: 1.5,
  },
  dataWrapper: { marginTop: -1 },
  row: { height: 40, backgroundColor: '#fff' },
});

export default AppTable;
