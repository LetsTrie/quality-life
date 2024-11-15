import React from 'react';
import Picker from './Picker';
import TextInput from './TextInput';

export const BasedOnProfession = ({
  profession,
  createChangeHandler,
  batch,
  setBatch,
  batchLists,
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
      width="92%"
      icon="account-check"
      placeholder="Batch"
      selectedItem={batch}
      onSelectItem={(b) => setBatch(b)}
      items={batchLists}
      name="batch"
      onChange={(text) => createChangeHandler(text, 'batch')}
    />
  );
};
