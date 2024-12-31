import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useBackPress, useHelper } from '../../hooks';
import constants from '../../navigation/constants';
import { ApiDefinitions } from '../../services/api';
import { AppText, BasedOnProfession, ErrorButton, Loader, SubmitButton } from '../../components';
import TextInput from '../../components/TextInput';
import Container from '../../components/Auth/Container';
import { genderLists, professionLists, batchLists, specAreaLists } from '../../utils/values';
import Picker from '../../components/Picker';

import Region from '../../data/RegionInformation.json';
import colors from '../../config/colors';

const zillaList = Region.districts.map((d) => ({
    label: d.districtName,
    value: d.districtName,
}));

const SCREEN_NAME = constants.PROF_UPDATE_PROFILE;
const UpdateProfileProf = () => {
    useBackPress(SCREEN_NAME, constants.GO_TO_BACK);

    const { ApiExecutor } = useHelper();

    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [formFields, setFormFields] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [gender, setGender] = useState(null);
    const [specArea, setSpecArea] = useState(null);

    const [zilla, setZilla] = useState(null);
    const [upozila, setUpozila] = useState(null);
    const [union, setUnion] = useState(null);

    const [upozilaList, setUpozilaList] = useState([]);
    const [unionList, setUnionList] = useState([]);

    const [profession, setProfession] = useState(null);
    const [batch, setBatch] = useState(null);

    const zillaHandleChange = (item) => {
        if (!item) return;

        setZilla(item);
        const upozilaList = Region.districts
            .find((d) => d.districtName === item.label)
            .subDistricts.map((sb) => ({
                label: sb.subDistrictName,
                value: sb.subDistrictName,
            }));
        setUpozilaList(upozilaList);
        setUpozila(null);
        setUnion(null);
    };

    const upozilaHandleChange = (item) => {
        if (!item) return;

        setUpozila(item);
        const unionList = Region.districts
            .find((d) => d.districtName === zilla.label)
            .subDistricts.find((sb) => sb.subDistrictName === item.label)
            .unions.map((u) => ({
                label: u.unionName,
                value: u.unionName,
            }));

        setUnionList(unionList);
        setUnion(null);
    };

    useEffect(() => {
        (async () => {
            setIsLoading(true);
            const response = await ApiExecutor(ApiDefinitions.getProfessionalsProfile());

            if (!response.success) {
                setError(response.error.message);
                return;
            }

            setError(null);

            const professional = response.data.prof;

            setData(professional);
            setFormFields(professional);

            setProfession(professionLists.find((p) => p.value === professional.profession));
            setBatch(batchLists.find((b) => b.value === professional.batch));

            setGender(genderLists.find((g) => g.value === professional.gender));
            setSpecArea(specAreaLists.find((s) => s.value === professional.specializationArea));

            const _zila = zillaList.find((z) => z.value === professional.zila);
            if (_zila) {
                setZilla(_zila);
                const upozilaList = Region.districts
                    .find((d) => d.districtName === _zila.label)
                    .subDistricts.map((sb) => ({
                        label: sb.subDistrictName,
                        value: sb.subDistrictName,
                    }));

                setUpozilaList(upozilaList);

                const _upazila = upozilaList.find((z) => z.value === professional.upazila);
                if (_upazila) {
                    setUpozila(_upazila);
                    const unionList = Region.districts
                        .find((d) => d.districtName === _zila.label)
                        .subDistricts.find((sb) => sb.subDistrictName === _upazila.label)
                        .unions.map((u) => ({
                            label: u.unionName,
                            value: u.unionName,
                        }));

                    setUnionList(unionList);
                    const _union = unionList.find((u) => u.value === professional.union);
                    if (_union) setUnion(_union);
                }
            }

            setIsLoading(false);
        })();
    }, []);

    useEffect(() => {
        if (!isLoading && error) {
            setIsSubmitting(false);
            setIsLoading(false);
        }
    }, [error]);

    const handleChange = (value, key) => {
        setFormFields((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        console.log(formFields);
    };

    if (error) {
        return <ErrorButton title={error} />;
    }

    if (isLoading) {
        return <Loader />;
    }

    if (!data) return null;

    return (
        <Container>
            <View style={styles.formContainer}>
                <View>
                    <AppText style={styles.sectionHeader}>Personal Information</AppText>
                    <TextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="account"
                        name="name"
                        placeholder="নাম"
                        value={formFields.name}
                        onChangeText={(text) => handleChange(text, 'name')}
                        width="97%"
                    />

                    <Picker
                        width="97%"
                        icon="gender-male-female-variant"
                        placeholder="লিঙ্গ"
                        selectedItem={gender}
                        onSelectItem={(g) => setGender(g)}
                        items={genderLists}
                        name="gender"
                        value={formFields.gender}
                        onChange={(text) => handleChange(text, 'gender')}
                    />

                    <Picker
                        width="97%"
                        icon="home-map-marker"
                        placeholder="বর্তমান ঠিকানা (জেলা)"
                        selectedItem={zilla}
                        onSelectItem={zillaHandleChange}
                        items={zillaList}
                        name="zila"
                        onChange={(text) => handleChange(text, 'zila')}
                    />

                    <Picker
                        width="97%"
                        icon="map-marker-radius"
                        placeholder="বর্তমান ঠিকানা (উপজেলা)"
                        selectedItem={upozila}
                        onSelectItem={upozilaHandleChange}
                        items={upozilaList}
                        name="upazila"
                        onChange={(text) => handleChange(text, 'upazila')}
                    />

                    <Picker
                        width="97%"
                        icon="map-marker-check"
                        placeholder="বর্তমান ঠিকানা (ইউনিয়ন)"
                        selectedItem={union}
                        onSelectItem={(item) => setUnion(item)}
                        items={unionList}
                        name="union"
                        onChange={(text) => handleChange(text, 'union')}
                    />
                </View>

                <View>
                    <AppText style={[styles.sectionHeader, { marginTop: 20 }]}>
                        Professional Information
                    </AppText>

                    <Picker
                        width="97%"
                        icon="card-account-details-star"
                        placeholder="পেশা"
                        selectedItem={profession}
                        onSelectItem={(d) => setProfession(d)}
                        items={professionLists}
                        onChange={(text) => handleChange(text, 'profession')}
                    />

                    <BasedOnProfession
                        profession={profession}
                        createChangeHandler={handleChange}
                        batch={batch}
                        setBatch={setBatch}
                        pickerWidth={'97%'}
                    />

                    <TextInput
                        width="97%"
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="briefcase-account"
                        name="designation"
                        placeholder="পদবি"
                        value={formFields.designation}
                        onChangeText={(text) => handleChange(text, 'designation')}
                    />

                    <TextInput
                        width="97%"
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="map-marker-radius"
                        name="workplace"
                        placeholder="কর্মস্থল"
                        value={formFields.workplace}
                        onChangeText={(text) => handleChange(text, 'workplace')}
                    />

                    <TextInput
                        width="97%"
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="account-tie"
                        name="experience"
                        placeholder="অভিজ্ঞতা"
                        value={formFields.experience}
                        onChangeText={(text) => handleChange(text, 'experience')}
                    />

                    <TextInput
                        width="97%"
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="account-star"
                        name="eduQualification"
                        placeholder="শিক্ষাগত যোগ্যতা"
                        value={formFields.eduQualification}
                        onChangeText={(text) => handleChange(text, 'eduQualification')}
                    />

                    <Picker
                        width="97%"
                        icon="card-account-details"
                        placeholder="স্পেশ্যালাইজেশন এরিয়া"
                        selectedItem={specArea}
                        onSelectItem={(g) => setSpecArea(g)}
                        items={specAreaLists}
                        name="specializationArea"
                        onChange={(text) => handleChange(text, 'specializationArea')}
                    />

                    {formFields.specializationArea === 'অন্যান্য' && (
                        <TextInput
                            width="97%"
                            autoCapitalize="none"
                            autoCorrect={false}
                            icon="card-account-details-outline"
                            name="otherSpecializationArea"
                            placeholder="এরিয়া উল্লেখ করুন"
                            value={formFields.otherSpecializationArea}
                            onChangeText={(text) => handleChange(text, 'otherSpecializationArea')}
                        />
                    )}
                    <TextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        width="97%"
                        icon="cash"
                        name="fee"
                        placeholder="ফি"
                        keyboardType="number-pad"
                        value={formFields.fee}
                        onChangeText={(text) => handleChange(text, 'fee')}
                    />

                    <TextInput
                        autoCapitalize="none"
                        autoCorrect={false}
                        icon="phone-in-talk"
                        width="97%"
                        name="telephone"
                        placeholder="টেলিফোন নম্বর"
                        keyboardType="number-pad"
                        value={formFields.telephone}
                        onChangeText={(text) => handleChange(text, 'telephone')}
                    />
                </View>
                <View>
                    <AppText style={[styles.sectionHeader, { marginTop: 20 }]}>
                        Available Time
                    </AppText>
                </View>
                <View>
                    <AppText style={[styles.sectionHeader, { marginTop: 20 }]}>
                        Number of Clients
                    </AppText>
                </View>

                <Loader visible={isSubmitting} style={{ paddingTop: 10 }} />
                <ErrorButton visible={!!error && !isSubmitting} title={error} />
                <SubmitButton
                    title={'Update Profile'}
                    onPress={handleSubmit}
                    style={{ marginTop: 10, backgroundColor: colors.secondary }}
                    textStyle={{ fontSize: 16 }}
                    visible={!isSubmitting}
                />
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        backgroundColor: 'white',
        flex: 1,
        paddingTop: 15,
        paddingLeft: 10,
    },
    sectionHeader: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.secondary,
        marginBottom: 10,
        letterSpacing: 0.5,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});

export default UpdateProfileProf;
