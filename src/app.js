//env vars
import config from './config/config.js';
//dependencias
import express from 'express';
import handlebars from 'express-handlebars';
import __dirname from './util.js';
import session from 'express-session';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
//server
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
//routers
import productsRouterMongo from './routes/products.route.js'
import cartsRouterMongo from './routes/carts.route.js'
import cartViewsRouter from './routes/viewsRouters/cart.views.routes.js'
import productsViewsRouter from './routes/viewsRouters/products.views.routes.js'
import UserViewsRouter from './routes/viewsRouters/user.views.routes.js'
import sessionsRouter from './routes/session.routes.js'
import mockRouter from '../src/mock/mock.router.js'
import loggerRouter from '../src/routes/loggerTest.routes.js'
//import productsRouter from '../src/service/fylesystem/routes/productsRoutes.js'
//import cartsRouter from '../src/service/fylesystem/routes/cartRoutes.js';
//import githubLoginRouter from './routes/githublogin.routes.js'

const app = express();
//Express
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Public
app.use(express.static(__dirname+'/public'));

//Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', __dirname+'/views');
app.set('view engine','handlebars');

//Session
const MONGO_URL = config.mongoUrl
//config.mongoUrl
app.use(session({
    store: MongoStore.create({
        mongoUrl: MONGO_URL,
        mongoOptions: {useNewUrlParser: true, useUnifiedTopology: true},
        ttl: 60
    }),
    secret: "coderS3cr3t",
    resave: false,
    saveUninitialized: true
}))

//middlewares passport
initializePassport()
app.use(passport.initialize());
app.use(passport.session());

//Routes
//app.use('/filesys', productsRouter);
//app.use('/filesys', cartsRouter);
//app.use("/github", githubLoginRouter);
app.use('/mongodb/api/', productsRouterMongo);
app.use('/mongodb/api/', cartsRouterMongo);
app.use('/', cartViewsRouter);
app.use('/', productsViewsRouter);
app.use("/users", UserViewsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/mockingproducts", mockRouter);
app.use('/loggerTest', loggerRouter);

//Server / MongoDB
const SERVER_PORT = config.port
//config.port
const httpServer = app.listen(SERVER_PORT, () => {console.log(`Escuchando desde el puerto ${SERVER_PORT}`);});

const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Conectado con exito a MongoDB usando Moongose.");
    } catch (error) {
        console.error("No se pudo conectar a la BD usando Moongose: " + error);
        process.exit();
    }
};
connectMongoDB();