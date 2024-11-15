function getMatra(msm_score, moj_score, mcn_score, dn_score) {
  let lastMsmScore;
  if (msm_score <= 50) lastMsmScore = `${msm_score} (কম ওয়েল-বিং)`;
  else lastMsmScore = `${msm_score} (বেশি ওয়েল-বিং)`;

  let lastMojScore;
  if (moj_score <= 4) {
    lastMojScore = `${moj_score} (স্বাভাবিক মাত্রা)`;
  } else if (moj_score <= 9) {
    lastMojScore = `${moj_score} (মাঝামাঝি মাত্রা)`;
  } else {
    lastMojScore = `${moj_score} (তীব্র মাত্রা)`;
  }
  let lastMcnScore;
  if (mcn_score <= 13) {
    lastMcnScore = `${mcn_score} (স্বাভাবিক মাত্রা)`;
  } else if (mcn_score <= 26) {
    lastMcnScore = `${mcn_score} (মাঝামাঝি মাত্রা)`;
  } else {
    lastMcnScore = `${mcn_score} (তীব্র মাত্রা)`;
  }
  let lastDnScore;
  if (dn_score <= 54) {
    lastDnScore = `${dn_score} (স্বাভাবিক মাত্রা)`;
  } else if (dn_score <= 66) {
    lastDnScore = `${dn_score} (মাঝামাঝি মাত্রা)`;
  } else {
    lastDnScore = `${dn_score} (তীব্র মাত্রা)`;
  }

  return [lastMsmScore, lastMojScore, lastMcnScore, lastDnScore];
}

export default getMatra;
