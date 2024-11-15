exports.getCurrentDate = (format = "mm/dd/yyyy") => {
  let today = new Date();

  let dd = String(today.getDate()).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = today.getFullYear();

  if (format === "mm/dd/yyyy") {
    return mm + "/" + dd + "/" + yyyy;
  }
  if (format === "dd/mm/yyyy") {
    return dd + "/" + mm + "/" + yyyy;
  }
};
