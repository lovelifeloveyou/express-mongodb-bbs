/**
 * Created by ��ǿ on 2017/12/11.
 */
let express = require('express');
let router = express.Router();

let PostModel = require('../models/posts');
let CommentModel = require('../models/comments');
let ReplyModel = require('../models/replys');
let TagModel = require('../models/tags');
let checkLogin = require('../middlewares/check').checkLogin;

// GET /posts �����û������ض��û�������ҳ
//   eg: GET /posts?author=xxx&page=1
router.get('/', function(req, res, next) {
    let author = req.query.author;
    let page = req.query.page;

    if (!page) {
        page = 1;
    }
    let pageSize = 3;

    PostModel.getPosts(author, page)
        .then(function (result) {
            let posts = result[0];
            posts.currentPage = page;
            posts.author = author;
            posts.total = parseInt((result[1] - 1) / pageSize + 1);
            return posts;
        })
        .then(function (posts) {
            let author = posts.author, currentPage = posts.currentPage, total = posts.total;
            return Promise.all(posts.map(function (post) {
                return TagModel.getTagsByPostId(post._id).then(function (tags) {
                    post.tags = tags;
                    return post;
                });
            })).then(function (posts) {
                posts.currentPage = currentPage;
                posts.author = author;
                posts.total = total;
                return posts;
            });
        })
        .then(function (posts) {
            res.render('posts', {
                posts: posts,
                tag: false
            });
        })
        .catch(next);
});

// GET /posts/create ��������ҳ
router.get('/create', checkLogin, function(req, res, next) {
    res.render('create');
});

// POST /posts ����һƪ����
router.post('/', checkLogin, function(req, res, next) {
    let author = req.session.user._id;
    let title = req.fields.title;
    let content = req.fields.content;

    // У�����
    try {
        if (!title.length) {
            throw new Error('����д����');
        }
        if (!content.length) {
            throw new Error('����д����');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
    }

    let post = {
        author: author,
        title: title,
        content: content,
        pv: 0
    };

    PostModel.create(post)
        .then(function (result) {
            // �� post �ǲ��� mongodb ���ֵ������ _id
            post = result.ops[0];
            req.flash('success', '����ɹ�');
            // ����ɹ�����ת��������ҳ
            res.redirect(`/posts/${post._id}/page/1`);
        })
        .catch(next);
});

// GET /posts/:postId/page/:page ����һƪ������ҳ��pageΪ����ҳ��
router.get('/:postId/page/:page', function(req, res, next) {
    let postId = req.params.postId;
    let page = req.params.page;
    let pageSize = 5;

    Promise.all([
        PostModel.getPostById(postId),// ��ȡ������Ϣ
        CommentModel.getComments(postId, page),// ��ȡ��������������
        TagModel.getTagsByPostId(postId),// ��ȡ���������б�ǩ
        PostModel.incPv(postId),// pv �� 1
    ])
        .then(function (result) {
            let post = result[0];
            let comments = result[1][0];
            comments.total = parseInt((result[1][1] - 1) / pageSize + 1);
            comments.currentPage = page;
            post.tags = result[2];
            if (!post) {
                throw new Error('�����²�����');
            }
            return {
                post: post,
                comments: comments
            };
        })
        .then(function (result) {
            let comments = result.comments;
            return Promise.all(comments.map(function (comment) {
                return ReplyModel.getReplys(comment._id).then(function (res) {
                    comment.replys = res[0];
                    comment.replysCount = res[1];
                    return comment;
                });
            }))
                .then(function () {
                    return result;
                });
        })
        .then(function (result) {
            res.render('post', result);
        })
        .catch(next);
});

// GET /posts/:postId/edit ��������ҳ
router.get('/:postId/edit', checkLogin, function(req, res, next) {
    let postId = req.params.postId;
    let author = req.session.user._id;

    PostModel.getRawPostById(postId)
        .then(function (post) {
            if (!post) {
                throw new Error('�����²�����');
            }
            if (author.toString() !== post.author._id.toString()) {
                throw new Error('Ȩ�޲���');
            }
            res.render('edit', {
                post: post
            });
        })
        .catch(next);
});

// POST /posts/:postId/edit ����һƪ����
router.post('/:postId/edit', checkLogin, function(req, res, next) {
    let postId = req.params.postId;
    let author = req.session.user._id;
    let title = req.fields.title;
    let content = req.fields.content;

    PostModel.updatePostById(postId, author, { title: title, content: content })
        .then(function () {
            req.flash('success', '�༭���³ɹ�');
            // �༭�ɹ�����ת����һҳ
            res.redirect(`/posts/${postId}`);
        })
        .catch(next);
});

// GET /posts/:postId/remove ɾ��һƪ����
router.get('/:postId/remove', checkLogin, function(req, res, next) {
    let postId = req.params.postId;
    let author = req.session.user._id;

    PostModel.delPostById(postId, author)
        .then(function () {
            req.flash('success', 'ɾ�����³ɹ�');
            // ɾ���ɹ�����ת����ҳ
            res.redirect('/posts');
        })
        .catch(next);
});

module.exports = router;
