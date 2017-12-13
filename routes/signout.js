/**
 * Created by ��ǿ on 2017/12/12.
 */
let express = require('express');
let router = express.Router();

let checkLogin = require('../middlewares/check').checkLogin;

// GET /signout �ǳ�
router.get('/', checkLogin, function(req, res, next) {
    // ��� session ���û���Ϣ
    req.session.user = null;
    req.flash('success', '�ǳ��ɹ�');
    // �ǳ��ɹ�����ת����ҳ
    res.redirect('/posts');
});

module.exports = router;
