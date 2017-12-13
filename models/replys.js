/**
 * Created by ��ǿ on 2017/12/11.
 */
let marked = require('marked');
let Reply = require('../lib/mongo').Reply;

// �� reply �� content �� markdown ת���� html
Reply.plugin('contentToHtml', {
    afterFind: function (replys) {
        return replys.map(function (reply) {
            reply.content = marked(reply.content);
            return reply;
        });
    }
});

module.exports = {
    // ����һ���ظ�
    create: function create(reply) {
        return Reply.create(reply).exec();
    },

    // ͨ���û� id �ͻظ� id ɾ��һ���ظ�
    delReplyById: function delReplyById(replyId, author) {
        return Reply.remove({ fromAuthor: author, _id: replyId }).exec();
    },

    // ͨ������ id ɾ�������������лظ�
    delReplysByCommentId: function delReplysByCommentId(commentId) {
        return Reply.remove({ commentId: commentId }).exec();
    },

    // ͨ������ id ��ȡ�����������лظ������ظ�����ʱ������
    getReplys: function getReplys(commentId) {
        return Promise.all([
            Reply
                .find({ commentId: commentId })
                .populate({ path: 'fromAuthor', model: 'User' })    // ���
                .populate({ path: 'toAuthor', model: 'User' })
                .sort({ _id: 1 })
                .addCreatedAt()
                .contentToHtml()
                .exec(),
            Reply
                .count({ commentId: commentId })
                .exec()
        ]);
    },

    // ͨ������ id ��ȡ�������»ظ���
    getReplysCount: function getReplysCount(commentId) {
        return Reply.count({ commentId: commentId }).exec();
    }
};
