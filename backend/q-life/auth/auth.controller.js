const { asyncHandler } = require("../../utils");
const User = require("../../models/user");
const bcrypt = require("bcrypt");

// POST /auth/u/sign-up
exports.userSignUp = asyncHandler(async (req, res, next) => {
  // TODO: Write Request Body Validation...

  const user = await User.findOne({
    email: req.body.email,
  }).lean();

  if (user) {
    console.error(`User already exists: ${req.body.email}`);
    return res.status(401).json({
      success: false,
      message: "User already exists",
    });
  }

  req.body.password = await bcrypt.hash(req.body.password, 10);

  const newUser = new User(req.body);
  await newUser.save();

  const [accessToken, refreshToken] = await newUser.generateTokens(newUser._id);

  console.log("After Register: ", {
    success: true,
    data: {
      user: newUser,
      accessToken,
      refreshToken,
    },
  });

  return res.status(201).json({
    success: true,
    data: {
      user: newUser, // TODO: Reduce Informations.
      accessToken,
      refreshToken,
    },
  });
});

// POST /auth/u/sign-in
exports.userSignIn = asyncHandler(async (req, res, next) => {
  // TODO: Write Request Body Validation...
  console.log(req.body);

  const user = await User.findOne({
    email: req.body.email,
  });

  console.log(user);

  if (!user) {
    console.error(`No user found: ${req.body.email}`);
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    console.error("Password - not matching!!");
    return res.status(401).json({
      success: true,
      message: "Invalid credentials",
    });
  }

  const [accessToken, refreshToken] = await user.generateTokens(user._id);

  const todaysDate = new Date();
  const lastTestTakenDate = new Date(user.lastIntroTestDate);
  const differences = (todaysDate - lastTestTakenDate) / (1000 * 3600 * 24);

  const didIntroTest = differences > 7;
  const isNewUser = !user.age;

  console.log("After Login: ", {
    success: true,
    data: {
      user,
      accessToken,
      refreshToken,
      didIntroTest,
      isNewUser,
    },
  });

  return res.status(200).json({
    success: true,
    data: {
      user, // TODO: Reduce Informations.
      accessToken,
      refreshToken,
      didIntroTest,
      isNewUser,
    },
  });
});

// TODO: Forget Password
// TODO: Reset Password
