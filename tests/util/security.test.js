const crypto = require('crypto');
const Security = require('../../app/main/util/security.js');

const regExpBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

var assert = require('assert');
describe('Security', function () {
    describe('#hash()', function () {
        it('should has to base64', function () {
            let result = Security.hash('hello world', '123');
            assert.ok(result.match(regExpBase64));
        });
        it('should generate valid hashes', function () {
            let results = [
                Security.hash('hello world', '123'),
                Security.hash('00000000', 'test'),
                Security.hash(new Buffer('test', 'utf8'), 'abc'),
                Security.hash('abc', new Buffer('test', 'utf8')),
                Security.hash(new Buffer('test', 'utf8'), new Buffer('test', 'utf8')),
                Security.hash('test123ABC'),
                Security.hash(new Buffer('test', 'utf8')),
                Security.hash({ ok: 123 }),
            ];
            assert.equal(results[0], 'wtLaAvY4NOht5XMVj4w/OK6dqaUtEk6SgULSX7AQOAgtYyr1mYmYkAGL5a/J1ezXuH/0jIJbbYIKuu/qz/bBTg==');
            assert.equal(results[1], 'afb6X3DPSXxGsztB43xLdxyP7sJUu3lgpnAK9CMMCxqfiGENUSHNpA9b2LY1mEpSeK1gE4u/E1djCeOtC0iXfw==');
            assert.equal(results[2], 'Kl1VsZBHFwI7DvWNI+1g3MTQaMiAYqQjT/vODjAQCiPHhAnXEMpIgIQA8Bio2k4b3Vuja2j6HGb3jeRbtV78zQ==');
            assert.equal(results[3], 'x8srgcy7aG6u+vv7z2EzT7dfjl3LPei4b+xTrRpd0BPAxMnMOvfFmu0q+rWd1GP2qE2VMfRuLv6zaBvXm/V6Nw==');
            assert.equal(results[4], 'El1tA7MshNSSdH95zwv24XnSh/NBOE611tMZdSWta+jm3wEWAyk1aY+ZoJ4mUHPR1sMsJ0WRvx0KIK1ny6khvA==');
            assert.equal(results[5], 'aaobOOTBh9wqbtka350Ny/+JzxnXoK+0S/3LlA/TYzbEtJgr9uc1S4aG1+q2gQYGuNxbB6VRwS7A3klzT8gX+A==');
            assert.equal(results[6], '7iaw3Ur350mqGo7jwQrpkj9hiYB3Lkc/iBml1JQODbJ6wYX4oOHV+E+IvIh/1nsUNzLDBMxfqa2Ob1f1ACio/w==');
            assert.equal(results[7], 'qm159HaA0+kRyq5XotzQ9UYrpI470U4Wcgc3txEKtlCccMWL4oB49+06MoFBc8pFlpC8GnDU6hY6chjQluh+Pw==');
        });
        it('should generate equivalent hashes', function () {
            for (let x = 0; x < 32; x++) {
                let pt = 'hello World!' + Date.now() + Math.random();
                let buf = Buffer.from(pt, 'utf8');
                assert.equal(Security.hash(pt, 'test'), Security.hash(buf, 'test'));
            }
            assert.equal(Security.hash({ ok: 123 }, 'test'), Security.hash(JSON.stringify({ ok: 123 }), 'test'));
        });
    });
    describe('#encrypt()', function () {
        it('should encrypt to a base64 string', function () {
            let result = Security.encrypt('test', 'test');
            assert.notEqual(result, '');
            assert.ok(result.match(regExpBase64));
        });
        it('should encrypt without failing', function () {
            assert.doesNotThrow(function () {
                Security.encrypt('test', 'test');
                Security.encrypt(123, '000000000000000000000000000000000000000000000000000000000000000000000');
                Security.encrypt({}, 'testABC');
                Security.encrypt('', 'ABC123');
                Security.encrypt({ ok: 123, hello: 'world' }, '1234567890');
                Security.encrypt({ ok: 123, hello: 'world' }, crypto.randomBytes(1024).toString('hex'));
            });
        });
    });
    describe('#decrypt()', function () {
        it('should decrypt to an object', function () {
            let v1Test = 'AAFEDiodtzmUu4dIoBPihHcdQJtNJvl86ymxiUGMq8gHw7WZzM+Xc5M67fiGACPUJHvAD0bHkJEcCKJwM7jlXUWb9LJP4ZWpNaeSolY5+bQtqj1US0YiUQq0ddmPMk6NYL2kkSjSY3orIKTX55kGi6Unoh+NMwA7';
            let result = Security.decrypt(v1Test, 'test');
            assert.ok(typeof result === 'object');
            assert.deepEqual(result, { ok: 123, hello: 'world' });
        });
    });
    describe('#encrypt then #decrypt()', function () {
        it('should encrypt then successfully decrypt', function () {
            for (let x = 0; x < 32; x++) {
                let pw = crypto.randomBytes(32).toString('base64');
                let plainText = { ok: Math.random() * 100 + 1, hello: 'world' + Date.now() };
                let data = null;
                assert.doesNotThrow(function () {
                    data = Security.encrypt(plainText, pw);
                }, '#encrypt failed.');
                assert.doesNotThrow(function () {
                    data = Security.decrypt(data, pw);
                }, '#decrypt failed.');
                assert.deepEqual(data, plainText, 'Bad decrypted data, may be #encrypt or #decrypt.');
            }
        });
    });
});