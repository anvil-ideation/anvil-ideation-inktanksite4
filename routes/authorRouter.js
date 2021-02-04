const express = require('express');
const authorRouter = express.Router();

authorRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('ContentType', 'text/plain');
    next();
})
.get((req, res) => {
    res.end(`Will send all the authors to you`);
})
.post((req, res) => {
    res.end(`Will add the author: ${req.body.name} with description: ${req.body.description}`);
})
.put((req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /authors`);
})
.delete((req, res) => {
    res.statusCode = 403;
    res.end(`DELETE operation not supported on /authors`);
});

authorRouter.route('/:authorId')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('ContentType', 'text/plain');
    next();
})
.get((req, res) => {
    res.end(`Will send details of the author: ${req.params.authorId} to you`);
})
.post((req, res) => {
    res.write(`Adding comment or rating regardingthe author: ${req.params.authorId}\n`);
    res.end(`Will add comment or rating regarding the author: ${req.body.name}
        with description: ${req.body.description}`);
})
.put((req, res) => {
    res.statusCode = 403;
    res.end(`DELETE operation not supported on /authors`);
})
.delete((req, res) => {
    res.end(`Deleting comment or rating regarding the author: ${req.params.authorId}`);
});

module.exports = authorRouter;