import React from 'react';
import {
  ScrollView,
  Text,
} from 'react-native';
import ClinicalActL30 from './ClinicalActL30';
import Conference from './Conference';
import OtherPAL30 from './OtherPAL30';
import PDAL30_1_1 from './PDAL30_1_1';
import PsychodramaDoc from './PsychodramaDoc';
import Research from './Research';
import SeminarWorkshop from './SeminarWorkshop';
import Supervision from './Supervision';
import SystemicCL from './SystemicCL';


const ProActivityLog = ({ navigation, route, ...props }) => {

  return (
  <ScrollView >
    <Text style={{width: '100%', textAlign: 'center',fontSize: 22, color: '#fc5c65',paddingTop: 12 ,paddingBottom: 10}}>Clinical Activities</Text>
    <ClinicalActL30/>
    <PDAL30_1_1/>
    <Supervision/>
    <SeminarWorkshop/>
    <Conference/>
    <Text style={{width: '100%', textAlign: 'center',fontSize: 22, color: '#fc5c65',paddingTop: 12 ,paddingBottom: 10}}>Research</Text>
    <Research/>
    <Text style={{width: '100%', textAlign: 'center',fontSize: 22, color: '#fc5c65',paddingTop: 12 ,paddingBottom: 10}}>Other Professional Activities</Text>
    <OtherPAL30/>
    <Text style={{width: '100%', textAlign: 'center',fontSize: 22, color: '#fc5c65',paddingTop: 12 ,paddingBottom: 10}}>SYSTEMIC CASE LOG</Text>
    <SystemicCL/>
    <Text style={{width: '100%', textAlign: 'center',fontSize: 22, color: '#fc5c65',paddingTop: 12 ,paddingBottom: 10}}>Psychodrama Documentation</Text>
    <PsychodramaDoc/>
  </ScrollView>
  );
};


export default ProActivityLog;
