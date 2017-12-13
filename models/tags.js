/**
 * Created by ��ǿ on 2017/12/11.
 */
let Tag = require('../lib/mongo').Tag;

let moment = require('moment');
let objectIdToTimestamp = require('objectid-to-timestamp');

module.exports = {
    // ����һ����ǩ
    create: function create(tag) {
        return Tag.create(tag).exec();
    },

    // ͨ����ǩ id ɾ��һ����ǩ
    delTagById: function delTagById(tagId) {
        return Tag.remove({ _id: tagId }).exec();
    },

    // ͨ������ id �ͱ�ǩ����ȡ��ǩ��Ϣ
    getTagByName: function getTagByName(postId, name) {
        return Tag
            .findOne({ post: postId, name: name })
            .exec();
    },

    // ͨ������ id ��ȡ�����µı�ǩ��
    getTagsCount: function getTagsCount(postId) {
        return Tag.count({ post: postId }).exec();
    },

    // ͨ����ǩ����ȡӵ�д����ǩ����������
    getPostsByTagName: function getPostsByTagName(name, page) {
        if (!page) {
            page = 1;
        }
        let pageSize = 3;

        return Promise.all([
            Tag
                .find({ name: name }, { skip: (page - 1) * pageSize, limit: pageSize })
                .populate({ path: 'post', model: 'Post' })    // ���
                .populate({ path: 'post.author', model: 'User' })
                .exec()
                .then(function (posts) {
                    return posts.map(function (item) {
                        item = item.post;
                        item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
                        return item;
                    });
                }),
            Tag
                .count({ name: name })
                .exec()
        ]);
    },

    // �������� id ɾ�������µ����б�ǩ
    delTagsByPostId: function delTagsByPostId(postId) {
        return Tag
            .remove({ post: postId })
            .exec();
    },

    // �������� id ��ȡ�����µ����б�ǩ
    getTagsByPostId: function getTagsByPostId(postId) {
        return Tag
            .find({ post: postId })
            .exec();
    }
};
