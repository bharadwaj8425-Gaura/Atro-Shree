// Run: npm test — checks the Jyotish engine against reference values (Swiss Ephemeris, Lahiri).
const assert = require('assert');
const J = require('../public/assets/jyotish.js'), AS = require('../public/assets/content.js');
const k = J.kundli({ date: '1990-08-15', time: '10:30', lat: 28.6139, lon: 77.2090, tz: 'Asia/Kolkata' });
const near = (a, b, tol) => Math.abs(((a - b + 540) % 360) - 180) < tol;
// Reference (pyswisseph 2.10, Lahiri, mean node): Sun 118.39, Moon 48.93, Asc 178.71
assert(near(k.planets[0].lon, 118.39, 0.02), 'Sun'); assert(near(k.planets[1].lon, 48.93, 0.02), 'Moon'); assert(near(k.lagna.lon, 178.71, 0.02), 'Ascendant');
assert.strictEqual(J.RASHI[k.moonSign].en, 'Taurus'); assert.strictEqual(J.NAK[k.nakshatra].en, 'Rohini');
for (let i = 0; i < 14; i++) for (let j = 0; j < 14; j++) assert.strictEqual(J.YONI_TBL[i][j], J.YONI_TBL[j][i], 'yoni symmetric');
const m = J.gunMilan(k.planets[1].lon, k.planets[1].lon); assert(m.nadiDosha, 'same nakshatra => nadi dosha');
const p = J.panchang('2026-11-24', 27.4924, 77.6737, 'Asia/Kolkata'); assert.strictEqual(p.tithi.en, 'Purnima');
const n = AS.numerology('1998-07-23', 'Manasvi'); assert.strictEqual(n.mulank, 5); assert.strictEqual(n.bhagyank, 3);
assert.strictEqual(AS.DECK.length, 78);
console.log('All engine tests passed ✓');
