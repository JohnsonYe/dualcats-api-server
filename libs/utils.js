function isArray(array) {
    return (!!array) && (array.constructor == Array);
}

function isObject(object) {
    return (!!object) && (object.constructor === Object);
};


module.exports = {
    isArray: isArray,
    isObject: isObject
}