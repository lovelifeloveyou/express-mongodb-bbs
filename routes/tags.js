/**
 * Created by ��ǿ on 2017/12/12.
 */
let express = require('express');
let router = express.Router();

let TagModel = require('../models/tags');
let CommentModel = require('../models/comments');
let checkLogin = require('../middlewares/check').checkLogin;

// POST /tags/:postId/tag ����һ����ǩ
router.post('/:postId/tag', checkLogin, function(req, res, next) {
    let name = req.fields.name;
    let postId = req.params.postId;

    // У�����
    try {
        if (!name) {
            throw new Error('����д��ǩ��');
        }
        if (name.length > 10) {
            throw new Error('��ǩ�����Ȳ��ܳ���10');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
    }

    Promise.all([
        TagModel.getTagsCount(postId),
        TagModel.getTagByName(postId, name)
    ])
        .then(function (result) {
            let count = result[0];
            let oldTag = result[1];

            if (count >= 3) {
                throw new Error('һƪ�������ֻ����3����ǩ');
            }
            if (oldTag) {
                throw new Error('�������Ѵ��ڸñ�ǩ');
            }
        })
        .then(function () {
            let tag = {
                name: name,
                post: postId
            };

            TagModel.create(tag)
                .then(function () {
                    req.flash('success', '��ӱ�ǩ�ɹ�');
                    // ��ӱ�ǩ�ɹ�����ת����һҳ
                    res.redirect('back');
                })
                // catch �Ժ����ת�� error �м��������ִ������Ĵ���
                .catch(next);
        })
        .catch(function (e) {
            req.flash('error', e.message);
            return res.redirect('back');
        });

});

// GET /tags/:tagId/remove ɾ��һ����ǩ
router.get('/:tagId/remove', checkLogin, function(req, res, next) {
    let tagId = req.params.tagId;

    TagModel.delTagById(tagId)
        .then(function () {
            req.flash('success', 'ɾ����ǩ�ɹ�');
            // ɾ���ɹ�����ת����һҳ
            res.redirect('back');
        })
        .catch(next);
});

// GET /tags/:name/page/:page �����ǩ�鿴���£������´���ʱ�併�򣬶����Ǳ�ǩ����ʱ��
router.get('/:name/page/:page', function(req, res, next) {
    let name = req.params.name;
    let page = req.params.page;

    if (!page) {
        page = 1;
    }
    let pageSize = 3;

    TagModel.getPostsByTagName(name, page)
        .then(function (result) {
            let posts = result[0];
            posts.currentPage = page;
            posts.total = parseInt((result[1] - 1) / pageSize + 1);
            return posts;
        })
        .then(function (posts) {
            let currentPage = posts.currentPage, total = posts.total;
            return Promise.all(
                posts.map(function (post) {
                    return TagModel.getTagsByPostId(post._id).then(function (tags) {
                        post.tags = tags;
                        return post;
                    });
                })
            )
                .then(function (posts) {
                    return Promise.all(posts.map(function (post) {
                        return CommentModel.getCommentsCount(post._id).then(function (commentsCount) {
                            post.commentsCount = commentsCount;
                            return post;
                        });
                    }));
                })
                .then(function (posts) {
                    posts.currentPage = currentPage;
                    posts.total = total;
                    return posts;
                });
        })
        .then(function (posts) {
            res.render('posts', {
                posts: posts,
                tag: name
            });
        })
        .catch(next);
});

module.exports = router;