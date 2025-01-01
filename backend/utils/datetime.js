exports.getCurrentDate = (format = 'mm/dd/yyyy') => {
    let today = new Date();

    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    if (format === 'mm/dd/yyyy') {
        return mm + '/' + dd + '/' + yyyy;
    }
    if (format === 'dd/mm/yyyy') {
        return dd + '/' + mm + '/' + yyyy;
    }
};

exports.formatDate = date => {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
};
