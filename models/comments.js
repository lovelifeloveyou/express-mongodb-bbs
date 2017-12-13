/**
 * Created by ��ǿ on 2017/12/11.
 */
let marked = require('marked');
let Comment = require('../lib/mongo').Comment;
let ReplyModel = require('./replys');

// �� comment �� content �� markdown ת���� html
Comment.plugin('contentToHtml', {
    afterFind: function (comments) {
        return comments.map(function (comment) {
            comment.content = marked(comment.content);
            return comment;
        });
    }
});

module.exports = {
    // ����һ������
    create: function create(comment) {
        return Comment.create(comment).exec();
    },

    // ͨ���û� id ������ id ɾ��һ������
    delCommentById: function delCommentById(commentId, author) {
        return Comment.remove({ author: author, _id: commentId })
            .exec()
            .then(function (res) {
                // ����ɾ������ɾ���������µ���������
                if (res.result.ok && res.result.n > 0) {      // nΪɾ����������
                    return ReplyModel.delReplysByCommentId(commentId);
                }
            });
    },

    // ͨ������ id ɾ������������������
    delCommentsByPostId: function delCommentsByPostId(postId, author) {
        // ���õ����� id��Ȼ����ɾ����Щ�����µ���������
        return Comment.find({ post: postId }, { _id: 1 })
                .then( (comments) => {
                // �������ط�����ʹ�ü�ͷ�������� hack д�������� this ָ��ȫ�ֶ���
                return Promise.all(comments.map( (comment) => {
                        return this.delCommentById(comment._id, author);
    }));
});
},

// ͨ������ id ��ȡ���������������ԣ������Դ���ʱ������
getComments: function getComments(postId, page) {
    let pageSize = 5;
    return Promise.all([
        Comment
            .find({ post: postId }, { skip: (page - 1) * pageSize, limit: pageSize })
            .populate({ path: 'author', model: 'User' })    // ���
            .sort({ _id: 1 })
            .addCreatedAt()
            .contentToHtml()
            .exec(),
        Comment
            .count({ post: postId })
            .exec()
    ]);
},

// ͨ������ id ��ȡ��������������
getCommentsCount: function getCommentsCount(postId) {
    return Comment.count({ post: postId }).exec();
}
};
