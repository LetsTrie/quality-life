import React from 'react';
import Consent from '../../components/Consent';
import constants from '../../navigation/constants';

const RegisterConsentPro = () => {
  return (
    <Consent
      description={
        'মোবাইল এপ্লিকেশনের মাধ্যমে প্রাপ্ত মানসিক স্বাস্থ্য উন্নয়নের অনুসন্ধানকারীগণকে যথাযথ পেশাদারিত্বের মাধ্যমে গ্রহণ করে প্রয়োজন অনুযায়ী সেবা প্রদান করা হবে এবং তাদের তথ্যগুলোকে অপব্যবহার করা হবে না। এপ্লিকেশনটিতে আপনার জন্য প্রদত্ত প্রশ্নগুলোর উত্তর মনোযোগ সহকারে প্রদান করুন। আপনার তথ্যগুলো আমাদের কাছে খুবই গুরুত্বপূর্ণ এবং প্রাপ্ত তথ্যগুলো পরিপূর্ণ গোপনীয়তা বজায় রেখে একটি গবেষণার কাজে ব্যবহার করা হবে। শুধু মাত্র তিনজন গবেষক ব্যাতিত এই তথ্য আর কেউ দেখতে পারবে না।'
      }
      buttonTitle={'রেজিস্ট্রেশন করুন'}
      redirectTo={constants.PROF_REGISTER_STEP_1}
    />
  );
};

export default RegisterConsentPro;
