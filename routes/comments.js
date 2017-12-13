/**
 * Created by ��ǿ on 2017/12/11.
 */
let express = require('express');
let router = express.Router();

let CommentModel = require('../models/comments');
let checkLogin = require('../middlewares/check').checkLogin;

// POST /comments/:postId/comment ����һ������
router.post('/:postId/comment', checkLogin, function(req, res, next) {
    let author = req.session.user._id;
    let postId = req.params.postId;
    let content = req.fields.content;
    let comment = {
        author: author,
        post: postId,
        content: content
    };

    CommentModel.create(comment)
        .then(function () {
            req.flash('success', '���Գɹ�');
            // ���Գɹ�����ת����һҳ
            res.redirect('back');
        })
        .catch(next);
});

// GET /comments/:commentId/remove ɾ��һ������
router.get('/:commentId/remove', checkLogin, function(req, res, next) {
    let commentId = req.params.commentId;
    let author = req.session.user._id;

    CommentModel.delCommentById(commentId, author)
        .then(function () {
            req.flash('success', 'ɾ�����Գɹ�');
            // ɾ���ɹ�����ת����һҳ
            res.redirect('back');
        })
        .catch(next);
});

module.exports = router;
