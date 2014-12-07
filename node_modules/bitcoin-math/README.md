#bitcoin-math

Providesw number prototypes for converting between BTC and Satoshi values. It
uses string based parsing, which avoids JavaScript's nasty problem of doing
weird things with integer division.

Also adds a zeropad method for making full length BTC strings

If imported and used as `var btcMath = require('bitcoin-math')` you can use
btcMath.getRandomBitcoin() and btcMath.getRandomSatoshi(). If you do not need
these, you can simply import the module without assigning it to a variable and
still use the number prototypes.

# TOC
   - [Number.toBitcoin()](#numbertobitcoin)
   - [Number.toSatoshi()](#numbertosatoshi)
   - [Number.zeroFill()](#numberzerofill)
   - [#getRandomSatoshi()](#getrandomsatoshi)
   - [#getRandomBitcoin()](#getrandombitcoin)
<a name=""></a>
 
<a name="numbertobitcoin"></a>
# Number.toBitcoin()
should add the toBitcoin function to the Number object.

```js
var num = 1;
assert(num.toBitcoin);
```

should return a bitcoin value derived from the number.

```js
var satoshi = 10000000;
assert(satoshi.toBitcoin() === 0.1);
```

should return NaN if the original is NaN.

```js
var bad = NaN;
assert(isNaN(bad.toBitcoin()));
```

<a name="numbertosatoshi"></a>
# Number.toSatoshi()
should add the toSatoshi function to the Number object.

```js
var num = 1;
assert(num.toSatoshi);
```

should return a satoshi value derived from the number.

```js
var bitcoin = 1;
assert(bitcoin.toSatoshi() === 100000000);
```

should return NaN if the original is NaN.

```js
var bad = NaN;
assert(isNaN(bad.toSatoshi()));
```

<a name="numberzerofill"></a>
# Number.zeroFill()
should add the zeroFill function to the Number object.

```js
var num = 1;
assert(num.zeroFill);
```

should return a decimal with zeros added (1 => 1.00000000).

```js
var bitcoin = 1;
assert(bitcoin.zeroFill() === "1.00000000");
```

should return a decimal with zeros added (1.123 => 1.12300000).

```js
var bitcoin = 1.123;
assert(bitcoin.zeroFill() === "1.12300000");
```

should return NaN if the original is NaN.

```js
var bad = NaN;
assert(isNaN(bad.zeroFill()));
```

<a name="getrandomsatoshi"></a>
# #getRandomSatoshi()
should reurn an integer value between the specified values with specified non zero digits.

```js
var rand = btcMath.getRandomSatoshi(100, 10000);
assert(rand > 100);
assert(rand < 10000);
var nonZeros = rand.toString().replace(/0/g, "").length;
assert(nonZeros <= 2);
```

<a name="getrandombitcoin"></a>
# #getRandomBitcoin()
should reurn a float value between the specified values with specified non zero digits.

```js
var rand = btcMath.getRandomBitcoin(1, 100, 4);
assert(rand > 1);
assert(rand < 100);
var nonZeros = rand.toSatoshi().toString().replace(/0/g, "").length;
assert(nonZeros <= 4);
```

