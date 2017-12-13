/**
 * Created by ��ǿ on 2017/12/11.
 */
let express = require('express');
let router = express.Router();
let path = require('path');
let fs = require('fs');

let UserModel = require('../models/users');
let checkLogin = require('../middlewares/check').checkLogin;

// GET /modify �޸�����ҳ
//   eg: GET /modify?author=xxx
router.get('/', function(req, res, next) {
    let author = req.query.author;

    UserModel.getUserById(author)
        .then(function (user) {
            res.render('modify', {
                user: user
            });
        })
        .catch(next);
});

// POST /modify �޸�����
router.post('/', checkLogin, function(req, res, next) {
    let name = req.fields.name;
    let gender = req.fields.gender;
    let bio = req.fields.bio;
    let avatar = null;
    if (req.files.avatar.name) {
        avatar = req.files.avatar.path.split(path.sep).pop();
    }

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
    } catch (e) {
        // �޸�����ʧ�ܣ��첽ɾ���ϴ���ͷ��
        fs.unlink(req.files.avatar.path);
        req.flash('error', e.message);
        return res.redirect(`/modify?author=${req.session.user._id}`);
    }

    // ��д�����ݿ���û���Ϣ
    let updateUser = {};
    if (name) {
        updateUser.name = name;
    }
    if (gender) {
        updateUser.gender = gender;
    }
    if (bio) {
        updateUser.bio = bio;
    }
    if (avatar) {
        updateUser.avatar = avatar;
    }

    // �û���Ϣд�����ݿ�
    UserModel.updateUserById(req.session.user._id, updateUser)
        .then(function (result) {
            // д�� flash
            req.flash('success', '�޸����ϳɹ�');
            // express-formidable��Ĭ���ϴ�һ���ļ�
            if (!avatar) {
                // û�лص������ᱨDeprecationWarning
                fs.unlink(req.files.avatar.path, function(err) {
                    if (err) {
                        return next(err);
                    }
                });
            }
            // ��ת����ҳ
            res.redirect('/posts');
        })
        .catch(function (e) {
            // �޸�����ʧ�ܣ��첽ɾ���ϴ���ͷ��
            fs.unlink(req.files.avatar.path);
            // �û�����ռ��������ע��ҳ�������Ǵ���ҳ
            if (e.message.match('E11000 duplicate key')) {
                req.flash('error', '�û����ѱ�ռ��');
                return res.redirect(`/modify?author=${req.session.user._id}`);
            }
            next(e);
        });
});

module.exports = router;
