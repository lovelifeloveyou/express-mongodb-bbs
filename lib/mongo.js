/**
 * Created by ��ǿ on 2017/12/11.
 */
let config = require('config-lite')(__dirname);
let Mongolass = require('mongolass');
let mongolass = new Mongolass();
mongolass.connect(config.mongodb);

let moment = require('moment');
let objectIdToTimestamp = require('objectid-to-timestamp');

// ���� id ���ɴ���ʱ�� created_at
mongolass.plugin('addCreatedAt', {
    afterFind: function (results) {
        results.forEach(function (item) {
            item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
        });
        return results;
    },
    afterFindOne: function (result) {
        if (result) {
            result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
        }
        return result;
    }
});

exports.User = mongolass.model('User', {
    name: { type: 'string' },
    password: { type: 'string' },
    avatar: { type: 'string' },
    gender: { type: 'string', enum: ['m', 'f', 'x'] },
    bio: { type: 'string' }
});
exports.User.index({ name: 1 }, { unique: true }).exec();// �����û����ҵ��û����û���ȫ��Ψһ

exports.Post = mongolass.model('Post', {
    author: { type: Mongolass.Types.ObjectId },
    title: { type: 'string' },
    content: { type: 'string' },
    pv: { type: 'number' }
});
exports.Post.index({ author: 1, _id: -1 }).exec();// ������ʱ�併��鿴�û��������б�

exports.Comment = mongolass.model('Comment', {
    author: { type: Mongolass.Types.ObjectId },
    content: { type: 'string' },
    post: { type: Mongolass.Types.ObjectId }
});
exports.Comment.index({ post: 1, _id: 1 }).exec();// ͨ������ id ��ȡ���������������ԣ������Դ���ʱ������
exports.Comment.index({ author: 1, _id: 1 }).exec();// ͨ���û� id ������ id ɾ��һ������

exports.Reply = mongolass.model('Reply', {
    fromAuthor: { type: Mongolass.Types.ObjectId },// ������
    toAuthor: { type: Mongolass.Types.ObjectId },// ��������
    content: { type: 'string' },
    commentId: { type: Mongolass.Types.ObjectId },// ������
    targetId: { type: Mongolass.Types.ObjectId },// �����۵� Comment �� Reply �� id
    replyType: { type: 'number', enum: [0, 1] },// 0 ���� Comment 1 ���� Reply
});
exports.Reply.index({ commentId: 1, _id: 1 }).exec();// ͨ������ id ��ȡ�����������лظ������ظ�����ʱ������
exports.Reply.index({ fromAuthor: 1, _id: 1 }).exec();// ͨ���û� id �ͻظ� id ɾ��һ���ظ�

exports.Tag = mongolass.model('Tag', {
    post: { type: Mongolass.Types.ObjectId },
    name: { type: 'string', maxlength: 10 }
});
exports.Tag.index({ post: -1, _id: 1 }).exec();// ͨ������ id ��ȡ�����µ����б�ǩ������ǩ����ʱ������
exports.Tag.index({ name: 1, post: -1 }).exec();// ͨ����ǩ����ȡ���б�ǩ�������´���ʱ�併��