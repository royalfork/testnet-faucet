'use strict';

/* global describe */
/* global it */

var assert = require('assert');
var btcMath = require('../index');

describe("Number.toBitcoin()", function() {
    it('should add the toBitcoin function to the Number object', function() {
        var num = 1;
        assert(num.toBitcoin);
    });
    it('should return a bitcoin value derived from the number', function() {
        var satoshi = 100000000000;
        while (satoshi > 0) {
            var satoshiString = satoshi.toString();
            var compare;
            if (satoshi === 1) {
                satoshi = 0;
                satoshiString = '0';
                compare = 0;
            } else {
                satoshiString = satoshiString.slice(0, satoshiString.length - 1);
                compare = Math.pow(10, satoshiString.length - 9);
            }
            satoshi = parseInt(satoshiString);
            assert(satoshi.toBitcoin() === compare);
        }
    });
    it('should return NaN if the original is NaN', function() {
        var bad = NaN;
        assert(isNaN(bad.toBitcoin()));
    });
});

describe("Number.toSatoshi()", function() {
    it('should add the toSatoshi function to the Number object', function() {
        var num = 1;
        assert(num.toSatoshi);
    });
    it('should return a satoshi value derived from the number', function() {
        var bitcoin = 100;
        while (bitcoin >= 0.000000001) {
            var bitcoinString = bitcoin.toString();
            var power;
            if (bitcoin >= 1) {
                power = (bitcoinString.length + 7);
            } else if (bitcoin > 0.0000001) {
                power = (10 - bitcoinString.length);
            } else {
                power = parseInt(bitcoinString.slice(bitcoinString.indexOf('e') + 1), 10) + 8;
            }
            var compare = Math.pow(10, power);
            assert(bitcoin.toSatoshi() === compare);
            var satoshiString = bitcoin.toSatoshi().toString();
            var satoshi = parseInt(satoshiString.slice(0, satoshiString.length - 1), 10);
            bitcoin = satoshi.toBitcoin();
        }
    });
    it('should return NaN if the original is NaN', function() {
        var bad = NaN;
        assert(isNaN(bad.toSatoshi()));
    });
});

describe("Number.zeroFill()", function() {
    it('should add the zeroFill function to the Number object', function() {
        var num = 1;
        assert(num.zeroFill);
    });
    it('should return a decimal with zeros added (1 => 1.00000000)', function() {
        var bitcoin = 1;
        assert(bitcoin.zeroFill() === "1.00000000");
    });
    it('should return a decimal with zeros added (1.123 => 1.12300000)', function() {
        var bitcoin = 1.123;
        assert(bitcoin.zeroFill() === "1.12300000");
    });
    it('should return NaN if the original is NaN', function() {
        var bad = NaN;
        assert(isNaN(bad.zeroFill()));
    });
});

describe("#getRandomSatoshi()", function() {
    it('should reurn an integer value between the specified values with specified non zero digits', function() {
        var rand = btcMath.getRandomSatoshi(100, 10000);
        assert(rand > 100);
        assert(rand < 10000);
        var nonZeros = rand.toString().replace(/0/g, "").length;
        assert(nonZeros <= 2);
    });
});

describe("#getRandomBitcoin()", function() {
    it('should reurn a float value between the specified values with specified non zero digits', function() {
        var rand = btcMath.getRandomBitcoin(1, 100, 4);
        assert(rand > 1);
        assert(rand < 100);
        var nonZeros = rand.toSatoshi().toString().replace(/0/g, "").length;
        assert(nonZeros <= 4);
    });
});
