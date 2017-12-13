/**
 * Created by ��ǿ on 2017/12/12.
 */
let fs = require('fs');
let path = require('path');
let sha1 = require('sha1');
let express = require('express');
let router = express.Router();

let UserModel = require('../models/users');
let checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signup ע��ҳ
router.get('/', checkNotLogin, function(req, res, next) {
    res.render('signup');
});

// POST /signup �û�ע��
router.post('/', checkNotLogin, function(req, res, next) {
    let name = req.fields.name;
    let gender = req.fields.gender;
    let bio = req.fields.bio;
    let avatar = req.files.avatar.path.split(path.sep).pop();
    let password = req.fields.password;
    let repassword = req.fields.repassword;

    // У�����
    try {
        if (!(name.length >= 1 && name.length <= 10)) {
            throw new Error('������������ 1-10 ���ַ�');
        }
        if (['m', 'f', 'x'].indexOf(gender) === -1) {
            throw new Error('�Ա�ֻ���� m��f �� x');
        }
        if (!(bio.length >= 1 && bio.length <= 30)) {
            throw new Error('���˼���������� 1-30 ���ַ�');
        }
        if (!req.files.avatar.name) {
            throw new Error('ȱ��ͷ��');
        }
        if (password.length < 6) {
            throw new Error('�������� 6 ���ַ�');
        }
        if (password !== repassword) {
            throw new Error('�����������벻һ��');
        }
    } catch (e) {
        // ע��ʧ�ܣ��첽ɾ���ϴ���ͷ��
        fs.unlink(req.files.avatar.path);
        req.flash('error', e.message);
        return res.redirect('/signup');
    }

    // �����������
    password = sha1(password);

    // ��д�����ݿ���û���Ϣ
    let user = {
        name: name,
        password: password,
        gender: gender,
        bio: bio,
        avatar: avatar
    };
    // �û���Ϣд�����ݿ�
    UserModel.create(user)
        .then(function (result) {
            // �� user �ǲ��� mongodb ���ֵ������ _id
            user = result.ops[0];
            // ���û���Ϣ���� session
            delete user.password;
            req.session.user = user;
            // д�� flash
            req.flash('success', 'ע��ɹ�');
            // ��ת����ҳ
            res.redirect('/posts');
        })
        .catch(function (e) {
            // ע��ʧ�ܣ��첽ɾ���ϴ���ͷ��
            fs.unlink(req.files.avatar.path);
            // �û�����ռ��������ע��ҳ�������Ǵ���ҳ
            if (e.message.match('E11000 duplicate key')) {
                req.flash('error', '�û����ѱ�ռ��');
                return res.redirect('/signup');
            }
            next(e);
        });
});

module.exports = router;