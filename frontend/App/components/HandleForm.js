import React from 'react';

function useFormFields(initialValues) {
  const [formFields, setFormFields] = React.useState(initialValues);
  const createChangeHandler = (text, key, isFile = false) => {
    // Need File Data..
    setFormFields((prev) => ({ ...prev, [key]: text }));
  };

  const resetForm = () => {
    let keys = Object.keys(formFields);
    let clearFields = {};
    for (let key of keys) clearFields[key] = '';
    setFormFields(() => clearFields);
    return;
  };
  return { formFields, setFormFields, createChangeHandler, resetForm };
}

export default useFormFields;
