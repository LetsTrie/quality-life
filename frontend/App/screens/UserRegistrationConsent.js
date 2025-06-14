import React from 'react';
import RegConsent from '../components/Consent';
import constants from '../navigation/constants';
import { useBackPress } from '../hooks';

const Consent = () => {
  useBackPress(constants.USER_REGISTER_CONSENT);

  return (
    <>
      <RegConsent
        header={'সম্মতিপত্র'}
        description={
          'এই মোবাইল এপ্লিকেশনটি এমনি একটা ব্যাতিক্রমধর্মী উদ্যোগ যার মাধ্যমে আপনার মানসিক স্বাস্থ্যের অবস্থা যাচাই করতে পারবেন ও তার সাথে মানসিক অবস্থা উন্নয়নের কিছু সহজ পদ্ধতি প্রদান করা হবে। এছাড়া প্রয়োজনে মানসিক স্বাস্থ্য সেবা প্রদানকারীর সাথে আপনার যোগাযোগ করার ব্যবস্থাও রয়েছে। এই এপ্লিকেশনটি ব্যবহার করতে গিয়ে আপনি যেই তথ্যগুলো প্রদান করবেন তা আমাদের কাছে খুবই গুরুত্বপূর্ণ এবং অত্যন্ত সতর্কতার সাথে তথ্যগুলোর গোপনীয়তা বজায় রাখা হবে। পরিচয় সম্পূর্ণ গোপন রেখে এই এপ্লিকেশনটির ব্যবহারকারীদের তথ্যগুলো একটি গবেষনা কাজে ব্যবহৃত হবে। এই তথ্য গুলো বিশ্লেষণ করার জন্য কেবলমাত্র তিন জন গবেষক ব্যতিত অন্যকেউ দেখতে পাবে না।'
        }
        buttonTitle={'রেজিস্ট্রেশন করুন'}
        redirectTo={constants.REGISTER}
      />
    </>
  );
};

export default Consent;
