const moment = require("moment");
const Test = require("../models/test");

async function getLastResult(types, req, res, next, format, userId) {
  let msm = await Test.find({ userId, $or: types })
    .sort({ _id: -1 })
    .limit(1)
    .select("-questionAnswers");
  msm = msm[0];
  let result = null;
  if (msm) {
    result = {};
    let range;
    const check = (n) => types.find((t) => t.type === n);
    if (check("manoshikChapNirnoy")) range = [13, 26];
    else if (check("duschintaNirnoy")) range = [54, 66];
    else if (check("manoshikObosthaJachaikoron")) range = [4, 9];
    let stage;
    let score = parseInt(msm.score);
    if (range) {
      if (score <= range[0]) stage = "স্বাভাবিক মাত্রা";
      else if (score <= range[1]) stage = "মাঝামাঝি মাত্রা";
      else stage = "তীব্র মাত্রা";
    } else {
      score = undefined;
    }
    result = {
      test_id: msm._id,
      score,
      last_date: modifyTime(msm.date),
      stage,
    };
  }
  return result;
}

async function getProgress(userId, req, res, next, format = null) {
  let manoshikObosthaJachaikoron = await getLastResult(
    [{ type: "manoshikObosthaJachaikoron" }],
    req,
    res,
    next,
    format,
    userId
  );
  let manoshikChapNirnoy = await getLastResult(
    [{ type: "manoshikChapNirnoy" }],
    req,
    res,
    next,
    format,
    userId
  );
  let duschintaNirnoy = await getLastResult(
    [{ type: "duschintaNirnoy" }],
    req,
    res,
    next,
    format,
    userId
  );
  let childCare = await getLastResult(
    [{ type: "childCare" }],
    req,
    res,
    next,
    format,
    userId
  );
  let coronaProfile = await getLastResult(
    [{ type: "coronaProfile" }],
    req,
    res,
    next,
    format,
    userId
  );
  let domesticViolence = await getLastResult(
    [{ type: "domesticViolence" }],
    req,
    res,
    next,
    format,
    userId
  );
  let psychoticProfile = await getLastResult(
    [{ type: "psychoticProfile" }],
    req,
    res,
    next,
    format,
    userId
  );

  let suicideIdeation = await getLastResult(
    [{ type: "suicideIdeation" }],
    req,
    res,
    next,
    format,
    userId
  );
  return [
    manoshikObosthaJachaikoron,
    manoshikChapNirnoy,
    duschintaNirnoy,
    childCare,
    coronaProfile,
    domesticViolence,
    psychoticProfile,
    suicideIdeation,
  ];
}

function modifyTime(msmdate) {
  let sp = [];
  let str = "";
  for (let x of msmdate) {
    if (x === "/") {
      sp.push(str);
      str = "";
    } else str += x;
  }
  sp.push(str);
  msmdate = sp[1] + "/" + sp[0] + "/" + sp[2];
  return moment(new Date(msmdate)).format("ll");
}

function getDate() {
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = today.getFullYear();
  return dd + "/" + mm + "/" + yyyy;
}

module.exports = { getLastResult, getProgress, modifyTime, getDate };
