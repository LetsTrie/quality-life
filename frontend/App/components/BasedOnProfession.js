import React from 'react';
import Picker from './Picker';
import TextInput from './TextInput';
import { batchLists } from '../utils/values';

export const BasedOnProfession = ({
    profession,
    createChangeHandler,
    batch,
    setBatch,
    pickerWidth = '92%',
}) => {
    if (!profession) return null;

    return profession.label === 'Psychiatrist' ? (
        <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            icon="account-check"
            name="bmdc"
            placeholder="BMDC"
            onChangeText={(text) => createChangeHandler(text, 'bmdc')}
        />
    ) : (
        <Picker
            width={pickerWidth}
            icon="account-check"
            placeholder="ব্যাচ"
            selectedItem={batch}
            onSelectItem={(b) => setBatch(b)}
            items={batchLists}
            name="batch"
            onChange={(text) => createChangeHandler(text, 'batch')}
        />
    );
};
