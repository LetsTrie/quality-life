const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('পাসওয়ার্ডে কমপক্ষে ৮ অক্ষর থাকতে হবে');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message('পাসওয়ার্ডে অন্তত ১টি অক্ষর এবং ১টি সংখ্যা থাকতে হবে');
  }
  return value;
};

module.exports = {
  objectId,
  password,
};