import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,Alert, Modal, Pressable, ActivityIndicator
} from 'react-native';
import BaseUrl from '../../config/BaseUrl';
import { DataTable, Provider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppButton from '../../components/Button';
import useFormFields from '../../components/HandleForm';
import TextInput from '../../components/TextInput';
import colors from '../../config/colors';
import { connect } from 'react-redux';


const Research = ({ navigation, route, ...props }) => {

let initialState = {
    title: '',
    ongoingPublished: '',
    proposal: '',
    researchCond: '',
    publication: '',
};
let { formFields, createChangeHandler, setFormFields } = useFormFields(initialState);

const [isLoading,setIsLoading]= useState(false);
const [editingData, setEditingData] = useState(null);
const [modalVisible, setModalVisible] = useState(false);
const [modalVisibleA, setModalVisibleA] = useState(false);
const [modalVisibleD, setModalVisibleD] = useState(false);
const [dataSource, setDataSource] = useState([]);
const [deleteData, setDeleteData] = useState([]);

const numberOfItemsPerPageList = [1, 3, 5];
const [page, setPage] = useState(0);
const [numberOfItemsPerPage, onItemsPerPageChange] = useState(
  numberOfItemsPerPageList[1]
);
const from = page * numberOfItemsPerPage;
const to = Math.min((page + 1) * numberOfItemsPerPage, dataSource.length);

const onAddData = async() => {
const userId = props._id;
const newData = await { ...formFields , userId};
await axios.post(`${BaseUrl}/prof/table/createResearch`, newData).then((res) => {
    if(res.data === 'success'){
    setModalVisibleA(!modalVisibleA);
    setDataSource((pre) => {
        return [...pre, newData];
    });
    }else{
    setModalVisibleA(!modalVisibleA);
    }
 });
};

const handleDeleteModal = (data) => {
setModalVisibleD(!modalVisibleD);
setDeleteData(data);
};

const onDeleteData = async() => {
await  axios.post(`${BaseUrl}/prof/table/delResearch`,deleteData).then((res) => {
    if (res.data === 'success') {
        setDataSource((pre) => {
            return pre.filter((data) => data._id !== deleteData._id);
        });
    }
    setDeleteData([]);
    setModalVisibleD(!modalVisibleD);
    });
};

const onEditData = (record) => {
    setModalVisible(true);
    setEditingData({ ...record });
};

const getData = async () => {
    const userId = {userId: props._id};
    await  axios.post(`${BaseUrl}/prof/table/getResearch`, userId).then((res) => {
        if (res.data.success === true) {
            setDataSource(res?.data?.research);
        }
        setIsLoading(false);
        });
} ;

const handleUpdate = async() => {
await  axios.post(`${BaseUrl}/prof/table/updateResearch`,editingData).then((res) => {
    if (res.data === 'success') {
        setDataSource((pre) => {
            return pre.map((data) => {
            if (data._id === editingData._id) {
                return editingData;
            } else {
                return data;
            }
            });
        });
    }
    setModalVisible(false); 
    });
};

useEffect(() => {
setPage(0);
}, [numberOfItemsPerPage]);


useEffect(() => {
    setIsLoading(true);
    getData();
},[]);

return (
<>
    <Text style={{fontSize: 15, color: '#fc5c65', marginLeft: 15}}>1 Please note down your research activities for last six month.</Text>
    <ScrollView horizontal={true} style={{marginBottom: 50,}}>
    <View style={[styles.block, { paddingBottom: 23 }]}>
    <Provider>
    <DataTable >
    <DataTable.Header>
        <DataTable.Title style={{width: 130, marginRight: 10}}>Title of the Research</DataTable.Title>
        <DataTable.Title style={{width: 110, marginRight: 10}}>Ongoing/Published</DataTable.Title>
        <DataTable.Title style={{width: 110, marginRight: 10}}>Proposal (time in hour)</DataTable.Title>
        <DataTable.Title style={{width: 145, marginRight: 10}}>Research conduction (time in hour)</DataTable.Title>
        <DataTable.Title style={{width: 140, marginRight: 10}}>Publication (time in hour)</DataTable.Title>
        <DataTable.Title style={{width: 100, marginRight: 10}}>Action</DataTable.Title>
    </DataTable.Header>
    {isLoading &&  <ActivityIndicator size='large' color={colors.primary} />}
        {
        dataSource.length > 0 ? dataSource.slice(
        page * numberOfItemsPerPage,
        page * numberOfItemsPerPage + numberOfItemsPerPage
        ).map((data)=>{
    return <>
        <DataTable.Row key ={data._id}>
            <DataTable.Cell style={{width: 130, marginRight: 10}}>{data.title}</DataTable.Cell>
            <DataTable.Cell style={{width: 110, marginRight: 10}}>{data.ongoingPublished}</DataTable.Cell>
            <DataTable.Cell style={{width: 110, marginRight: 10}}>{data.proposal}</DataTable.Cell>
            <DataTable.Cell style={{width: 145, marginRight: 10}}>{data.researchCond}</DataTable.Cell>
            <DataTable.Cell style={{width: 140, marginRight: 10}}>{data.publication}</DataTable.Cell>
            <DataTable.Cell  style={{width: 100, marginRight: 10}}>
            <TouchableOpacity onPress={()=> onEditData(data)}>
                <MaterialCommunityIcons name='comment-edit' size={22}  />  
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>handleDeleteModal(data)}>
                <MaterialCommunityIcons name='delete' size={22}  />  
            </TouchableOpacity>
            </DataTable.Cell>
        </DataTable.Row>
        </>
        })
        :
        <Text key ={324} style={{fontSize: 22, textAlign: 'center', width: '100%' ,padding: 5}}>No Data Avaiable</Text>
        }

    <DataTable.Pagination
        page={page}
        numberOfPages={Math.ceil(dataSource.length / numberOfItemsPerPage)}
        onPageChange={(page) => setPage(page)}
        label={`${from + 1}-${to} of ${dataSource.length}`}
        showFastPaginationControls
        numberOfItemsPerPageList={numberOfItemsPerPageList}
        numberOfItemsPerPage={numberOfItemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        selectPageDropdownLabel={'Rows per page'}
    />

    </DataTable>
    </Provider>  
        <AppButton
        title={'add'}
        style={{ marginBottom: 5, padding: 12.5, marginTop: 0, maxWidth: '30%' }}
        textStyle={{ fontSize: 15 }}
        onPress={()=>setModalVisibleA(!modalVisibleA)}
    />
</View>

{/* updating data */}
<View style={styles.centeredView}>
    <Modal
    animationType="slide"
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisible(!modalVisible);
    }}>
        <View style={styles.modalView}>
        <ScrollView>
        <TextInput
            autoCapitalize='none'
            autoCorrect={false}
            name='title'
            placeholder='Title of the Research'
            style={{ marginBottom: 5 ,borderRadius: 5}}
            defaultValue={`${editingData?.title}`}
            onChangeText={(e) => {
            setEditingData((pre) => {
                return { ...pre, title: e };
            });
            }}
        />
        <TextInput
            autoCapitalize='none'
            autoCorrect={false}
            name='ongoingPublished'
            placeholder='Ongoing/Published'
            style={{ marginBottom: 5 ,borderRadius: 5}}
            defaultValue={`${editingData?.ongoingPublished}`}
            onChangeText={(e) => {
            setEditingData((pre) => {
                return { ...pre, ongoingPublished: e };
            });
            }}
        />
        <TextInput
            autoCapitalize='none'
            autoCorrect={false}
            name='proposal'
            placeholder='Proposal'
            style={{ marginBottom: 5 ,borderRadius: 5}}
            defaultValue={`${editingData?.proposal}`}
            onChangeText={(e) => {
            setEditingData((pre) => {
                return { ...pre, proposal: e };
            });
            }}
        />
        <TextInput
            autoCapitalize='none'
            autoCorrect={false}
            name='researchCond'
            placeholder='Research conduction'
            style={{ marginBottom: 5 ,borderRadius: 5}}
            defaultValue={`${editingData?.researchCond}`}
            onChangeText={(e) => {
            setEditingData((pre) => {
                return { ...pre, researchCond: e };
            });
            }}
        />
        <TextInput
            autoCapitalize='none'
            autoCorrect={false}
            name='publication'
            placeholder='Publication'
            style={{ marginBottom: 5 ,borderRadius: 5}}
            defaultValue={`${editingData?.publication}`}
            onChangeText={(e) => {
            setEditingData((pre) => {
                return { ...pre, publication: e };
            });
            }}
        />
        <View style={styles.buttonDiv}>
        <Pressable
            style={[styles.button, styles.buttonYes]}
            onPress={handleUpdate}
            >
            <Text style={styles.textStyle}>Update</Text>
        </Pressable>
        <Pressable
            style={[styles.button, styles.buttonNo]}
            onPress={() => setModalVisible(!modalVisible)}>
            <Text style={styles.textStyle}>Cancel</Text>
        </Pressable>
        </View>
        </ScrollView>
        </View>
    </Modal> 
</View>

{/* adding data */}
<View style={styles.centeredView}>
    <Modal
    animationType="slide"
    transparent={true}
    visible={modalVisibleA}
    onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisibleA(!modalVisibleA);
    }}>
        <View style={styles.modalView}>
        <Text style={{fontSize: 15, textAlign: 'center', width: '100%' , padding: 5}}>Please fill up all the fields</Text>
        <ScrollView>
        <TextInput
            autoCapitalize='none'
            autoCorrect={false}
            name='title'
            placeholder='Title of the Research'
            style={{ marginBottom: 5 ,borderRadius: 5}}
            onChangeText={(text) => createChangeHandler(text, 'title')}
        />
        <TextInput
            autoCapitalize='none'
            autoCorrect={false}
            name='ongoingPublished'
            placeholder='Ongoing/Published'
            style={{ marginBottom: 5 ,borderRadius: 5}}
            onChangeText={(text) => createChangeHandler(text, 'ongoingPublished')}
        />
        <TextInput
            autoCapitalize='none'
            autoCorrect={false}
            name='proposal'
            placeholder='Proposal'
            style={{ marginBottom: 5 ,borderRadius: 5}}
            onChangeText={(text) => createChangeHandler(text, 'proposal')}
        />
        <TextInput
            autoCapitalize='none'
            autoCorrect={false}
            name='researchCond'
            placeholder='Research conduction'
            style={{ marginBottom: 5 ,borderRadius: 5}}
            onChangeText={(text) => createChangeHandler(text, 'researchCond')}
        />
        <TextInput
            autoCapitalize='none'
            autoCorrect={false}
            name='publication'
            placeholder='Publication'
            style={{ marginBottom: 5 ,borderRadius: 5}}
            onChangeText={(text) => createChangeHandler(text, 'publication')}
        />
        <View style={styles.buttonDiv}>
        <Pressable
            style={[styles.button, styles.buttonYes]}
            onPress={onAddData}
        >
            <Text style={styles.textStyle}>Add</Text>
        </Pressable>
        <Pressable
            style={[styles.button, styles.buttonNo]}
            onPress={() => setModalVisibleA(!modalVisibleA)}>
            <Text style={styles.textStyle}>Cancel</Text>
        </Pressable>
        </View>
        </ScrollView>
        </View>
    </Modal> 

    {/* delete modal */}
    <Modal
    animationType="slide"
    transparent={true}
    visible={modalVisibleD}
    onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisibleD(!modalVisibleD);
    }}>
    <View style={styles.centeredView}>
        <View style={styles.modalView}>
        <Text>Are you sure? This row will be permanently deleted.</Text>
        <View style={styles.buttonDiv}>
        <Pressable
            style={[styles.button, styles.buttonYes]}
            onPress={onDeleteData}
            >
            <Text style={styles.textStyle} >Yes</Text>
        </Pressable>
        <Pressable
            style={[styles.button, styles.buttonNo]}
            onPress={() => setModalVisibleD(!modalVisibleD)}>
            <Text style={styles.textStyle}>No</Text>
        </Pressable>
        </View>
        </View>
    </View>
    </Modal> 
</View>

</ScrollView>
  </>
  );
};


const styles = StyleSheet.create({
  block: {
    elevation: 3,
    borderRadius: 5,
    marginTop: 20,
    marginHorizontal: 15,
    paddingHorizontal: 18,
    paddingVertical: 10,
    paddingTop: 25,
    backgroundColor: 'white',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 2,
  },
  buttonDiv:{
    marginTop: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  buttonYes: {
    backgroundColor: 'green',
    marginRight: 10,
  },
  buttonNo: {
    backgroundColor: 'red',
  },
  textStyle: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const mapStateToProps = (state) => ({
    _id: state.prof?.prof?._id,
});
  
export default connect(mapStateToProps)(Research);