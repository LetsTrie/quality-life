exports.capitalizeFirstLetter = inputString => {
    if (!inputString) return '';
    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
};

exports.toString = input => {
    if (typeof input === 'string') return input;
    if (typeof input === 'number') return input.toString();
    return '';
};

exports.StringOfMaxLength = len => {
    return {
        type: String,
        maxlength: len,
    };
};

exports.formatSlugToTitle = slug => {
    try {
        return slug
            .split('_')
            .map((word, index, arr) => {
                if (index === arr.length - 1 && /\(([^)]+)\)/.test(word)) {
                    return word.toUpperCase(); // Keep the acronym in uppercase
                }
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    } catch (e) {
        return slug;
    }
};
