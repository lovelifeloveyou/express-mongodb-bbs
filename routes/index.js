/**
 * Created by ��ǿ on 2017/12/11.
 */
module.exports = function (app) {
    app.get('/', function (req, res) {
        res.redirect('/posts');
    });
    app.use('/modify', require('./modify'));
    app.use('/signup', require('./signup'));
    app.use('/signin', require('./signin'));
    app.use('/signout', require('./signout'));
    app.use('/posts', require('./posts'));
    app.use('/comments', require('./comments'));
    app.use('/replys', require('./replys'));
    app.use('/tags', require('./tags'));

    // 404 page
    app.use(function (req, res) {
        // HTTPͷ��Ϣδ����
        if (!res.headersSent) {
            // ������״̬���Ϊ404������Ⱦ404ҳ��
            res.status(404).render('404');
        }
    });
};
