/**
 * Created by ��ǿ on 2017/12/11.
 */
module.exports = {
    port: 3000,
    session: {
        secret: 'mybbs',
        key: 'mybbs',
        maxAge: 2592000000
    },
    mongodb: 'mongodb://localhost:27017/mybbs'
};