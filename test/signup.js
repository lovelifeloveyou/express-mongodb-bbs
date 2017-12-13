/**
 * Created by ��ǿ on 2017/12/12.
 */
var path = require('path');
var assert = require('assert');
var request = require('request');
var app = require('../index');
var User = require('../lib/mongo').User;

var testName1 = 'testName1';
var testName2 = 'testName2';
describe('signup', function() {
    var agent = request.agent(app);
    beforeEach(function(done) {
        // ����һ���û�
        User.create({
            name: testName1,
            password: '123456',
            avatar: '',
            gender: 'x',
            bio: ''
        })
            .exec()
            .then(function() {
                done();
            })
            .catch(done);
    });

    afterEach(function(done) {
        //ɾ�������û�
        User.remove({ name: { $in: [testName1, testName2] } })
            .exec()
            .then(function() {
                done();
            })
            .catch(done);
    });

    // �û�����������
    it('wrong name', function(done) {
        agent
            .post('/signup')
            .type('form')
            .attach('avatar', path.join(__dirname, 'avatar.png'))
            .field({ name: '' })
            .redirects()
            .end(function(err, res) {
                if(err) return done(err);
                assert(res.text.match(/������������1-10���ַ�/));
                done();
            });
    });

    // �Ա��������
    it('wrong gender', function(done) {
        agent
            .post('/signup')
            .type('form')
            .attach('avatar', path.join(__dirname, 'avatar.png'))
            .field({ name: testName2, gender: 'a' })
            .redirects()
            .end(function(err, res) {
                if(err) return done(err);
                assert(res.text.match(/�Ա�ֻ����m��f��x/));
                done();
            });
    });
    //����Ĳ����������в���
    //�û�����ռ�õ����
    it('duplicate name', function(done) {
        agent
            .post('/signup')
            .type('form')
            .attach('avatar', path.join(__dirname, 'avatar.png'))
            .field({ name: testName1, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
            .redirects()
            .end(function(err, res) {
                if(err) return done(err);
                assert(res.text.match(/�û����ѱ�ռ��/));
                done();
            });
    });

    // ע��ɹ������
    it('success', function(done) {
        agent
            .post('/signup')
            .type('form')
            .attach('avatar', path.join(__dirname, 'avatar.png'))
            .field({ name: testName2, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
            .redirects()
            .end(function(err, res) {
                if(err) return done(err);
                assert(res.text.match(/ע��ɹ�/));
                done();
            });
    });
});