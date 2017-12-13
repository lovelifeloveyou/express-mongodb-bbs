/**
 * Created by ��ǿ on 2017/12/12.
 */
let sha1 = require('sha1');
let express = require('express');
let router = express.Router();

let UserModel = require('../models/users');
let checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin ��¼ҳ
router.get('/', checkNotLogin, function(req, res, next) {
    res.render('signin');
});

// POST /signin �û���¼
router.post('/', checkNotLogin, function(req, res, next) {
    let name = req.fields.name;
    let password = req.fields.password;

    UserModel.getUserByName(name)
        .then(function (user) {
            if (!user) {
                req.flash('error', '�û�������');
                return res.redirect('back');
            }
            // ��������Ƿ�ƥ��
            if (sha1(password) !== user.password) {
                req.flash('error', '�û������������');
                return res.redirect('back');
            }
            req.flash('success', '��¼�ɹ�');
            // �û���Ϣд�� session
            delete user.password;
            req.session.user = user;
            // ��ת����ҳ
            res.redirect('/posts');
        })
        .catch(next);
});

module.exports = router;
