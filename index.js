/**
 * Created by ��ǿ on 2017/12/11.
 */
let path = require('path');
let express = require('express');
let session = require('express-session');
let MongoStore = require('connect-mongo')(session);
let flash = require('connect-flash');
let config = require('config-lite')(__dirname);
let routes = require('./routes');
let pkg = require('./package');
let winston = require('winston');
let expressWinston = require('express-winston');

let app = express();

// ����ģ��Ŀ¼
app.set('views', path.join(__dirname, 'views'));

// ����ģ������Ϊ ejs
app.set('view engine', 'ejs');

// ���þ�̬�ļ�Ŀ¼
app.use(express.static(path.join(__dirname, 'public')));

// session �м��
app.use(session({
    name: config.session.key,// ���� cookie �б��� session id ���ֶ�����
    secret: config.session.secret,// ͨ������ secret ������ hash ֵ������ cookie �У�ʹ������ signedCookie ���۸�
    resave: true,// ǿ�Ƹ��� session
    saveUninitialized: false,// ����Ϊ false��ǿ�ƴ���һ�� session����ʹ�û�δ��¼
    cookie: {
        maxAge: config.session.maxAge// ����ʱ�䣬���ں� cookie �е� session id �Զ�ɾ��
    },
    store: new MongoStore({// �� session �洢�� mongodb
        url: config.mongodb// mongodb ��ַ
    })
}));

// flash �м����������ʾ֪ͨ
app.use(flash());

// ��������ļ��ϴ����м��
app.use(require('express-formidable')({
    uploadDir: path.join(__dirname, 'public/img'),// �ϴ��ļ�Ŀ¼
    keepExtensions: true// ������׺
}));

// ����ģ��ȫ�ֳ���
app.locals.bbs = {
    title: pkg.name,
    description: pkg.description
};

// ���ģ��������������
app.use(function (req, res, next) {
    res.locals.user = req.session.user;
    res.locals.success = req.flash('success').toString();
    res.locals.error = req.flash('error').toString();
    next();
});

// �����������־
app.use(expressWinston.logger({
    transports: [
        // new (winston.transports.Console)({
        //   json: true,
        //   colorize: true
        // }),
        new winston.transports.File({
            filename: 'logs/success.log'
        })
    ]
}));

// ·��
routes(app);

// �����������־
app.use(expressWinston.errorLogger({
    transports: [
        // new winston.transports.Console({
        //   json: true,
        //   colorize: true
        // }),
        new winston.transports.File({
            filename: 'logs/error.log'
        })
    ]
}));

// error page
app.use(function (err, req, res, next) {
    res.render('error', {
        error: err
    });
});

// The module that first required this one
if (module.parent) {
    module.exports = app;
} else {
    // �����˿ڣ���������
    app.listen(config.port, function () {
        console.log(`${pkg.name} listening on port ${config.port}`);
    });
}
