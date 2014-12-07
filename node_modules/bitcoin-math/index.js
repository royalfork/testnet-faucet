'use strict';

Number.prototype.toSatoshi = function() {
    if (isNaN(this)) return NaN;
    if (this === 0) return 0;
    var str = this.toString();
    var sign = (str.indexOf('-') === 0) ? "-" : "";
    str = str.replace(/^-/, '');
    if (str.indexOf('e') >=0) {
        return parseInt(sign + str.replace(".", "").replace(/e-8/, "").replace(/e-7/, "0"), 10);
    } else {
        if (!(/\./).test(str)) str += ".0";
        var parts = str.split(".");
        str = parts[0] + "." + parts[1].slice(0,8);
        while (!(/\.[0-9]{8}/).test(str)) {
            str += "0";
        }
        return parseInt(sign + str.replace(".", "").replace(/^0+/, ""), 10);
    }
};

Number.prototype.toBitcoinString = function() {
    if (isNaN(this)) return NaN;
    if (this === 0) return 0;
    var str = parseInt(this, 10).toString();
    var sign = (str.indexOf('-') === 0) ? "-" : "";
    str = str.replace(/^-/, '');
    var lengthTester = (/[0-9]{8}/);
    while (!lengthTester.test(str)) {
        str = "0" + str;
    }
    str = str.slice(0, str.length - 8) + "." + str.slice(str.length - 8);
    if (str[0] === '.') str = '0' + str;
    return sign + str;
};

Number.prototype.toBitcoin = function() {
    return parseFloat(this.toBitcoinString());
};

Number.prototype.zeroFill = function(places) {
    if (isNaN(this)) return NaN;
    if (!places) {
        places = 8;
    }
    var str = this.toString();
    var parts = str.split(".");
    if (parts.length === 1) {
        parts.push("0");
    }
    var needed = places - parts[1].length;
    for (var i = 0; i < needed; i++) {
        parts[1] += '0';
    }
    return parts[0] + "." + parts[1];
};

var getRandom = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.getRandomBitcoin = function(min, max, digits) {
    return getRandomSatoshi(min.toSatoshi(), max.toSatoshi(), digits).toBitcoin();
};

var getRandomSatoshi = module.exports.getRandomSatoshi = function(min, max, digits) {
    if (digits === undefined) {
        digits = 2;
    } else {
        digits = parseInt(digits, 10);
        if (isNaN(digits)) {
            throw new Error("digits must be a number");
        }
    }
    var val = getRandom(min, max);
    var valDigits = val.toString().length;
    // how many non zero numbers do you want?
    var evenness = getRandom(1, digits);
    var factor = Math.pow(10, valDigits - evenness);
    return Math.floor(val / factor) * factor;
};
