/**
 * Created by ��ǿ on 2017/12/11.
 */
let User = require('../lib/mongo').User;

module.exports = {
    // ע��һ���û�
    create: function create(user) {
        return User.create(user).exec();
    },

    // ͨ���û�����ȡ�û���Ϣ
    getUserByName: function getUserByName(name) {
        return User
            .findOne({ name: name })
            .addCreatedAt()
            .exec();
    },

    // ͨ���û�id��ȡ�û���Ϣ
    getUserById: function getUserById(id) {
        return User
            .findOne({ _id: id })
            .addCreatedAt()
            .exec();
    },

    // ͨ���û� id �޸��û�����
    updateUserById: function updateUserById(userId, data) {
        return User.update({ _id: userId }, { $set: data }).exec();
    }
};
