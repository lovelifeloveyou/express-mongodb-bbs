/**
 * Created by ��ǿ on 2017/12/12.
 */
let express = require('express');
let router = express.Router();

let ReplyModel = require('../models/replys');
let checkLogin = require('../middlewares/check').checkLogin;

// POST /replys/:targetId/reply ����һ���ظ�
router.post('/:targetId/reply', checkLogin, function(req, res, next) {
    let fromAuthor = req.session.user._id;
    let replyType = req.fields.replyType;
    let targetId = req.params.targetId;
    let commentId = req.fields.commentId;
    let content = req.fields.content;
    let toAuthor = req.fields.toAuthor;

    let reply = {
        fromAuthor: fromAuthor,
        targetId: targetId,
        content: content,
        replyType: parseInt(replyType),
        commentId: commentId,
        toAuthor: toAuthor
    };

    ReplyModel.create(reply)
        .then(function () {
            req.flash('success', '���Գɹ�');
            // ���Գɹ�����ת����һҳ
            res.redirect('back');
        })
        .catch(next);
});

// GET /replys/:replyId/remove ɾ��һ���ظ�
router.get('/:replyId/remove', checkLogin, function(req, res, next) {
    let replyId = req.params.replyId;
    let author = req.session.user._id;

    ReplyModel.delReplyById(replyId, author)
        .then(function () {
            req.flash('success', 'ɾ�����Գɹ�');
            // ɾ���ɹ�����ת����һҳ
            res.redirect('back');
        })
        .catch(next);
});

module.exports = router;
