import 'babel-polyfill';
import express from 'express';
import secure from 'express-force-https';
import apicache from 'apicache';
import path from 'path';
import useragent from 'express-useragent';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import serversConfig from '../config';
import errorHandler from './middleware/errorHandler';
import render from './middleware/render';
import auth from './middleware/auth';
import graphql from './middleware/graphql';
import token from './middleware/token';
import { CACHE_MAX_AGE } from './config';
import cors from 'cors';


const server = global.server = express();
server.use(secure);
//apicache.options({ debug: true })
let cache = apicache.middleware;

// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

// Register Node.js middleware
server.use(cache('2 weeks'));
server.get('*.js', function (req, res, next) {
  req.url = req.url + '.gz';
  res.set('Content-Encoding', 'gzip');
  next();
});
server.use(express.static(path.join(__dirname, 'public'), {
    maxAge: CACHE_MAX_AGE
}));
server.use(cookieParser());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(bodyParser.text());
server.use('/token', token);
server.use('/auth', auth);
server.use('/graphql', cors(), graphql);
server.use(useragent.express());
server.get('*', render);
server.use(errorHandler);

// Launch the server
server.listen(serversConfig.static.PORT, () => {
    console.log(`The STATIC server is running at ${serversConfig.static.HOST}:${serversConfig.static.PORT}/`);
});
