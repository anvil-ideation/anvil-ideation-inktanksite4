const express = require('express');
const Book = require('../models/book');

const bookRouter = express.Router();

bookRouter.route('/')
.get((req, res, next) => {
    Book.find()
    .then(books => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(books);
    })
    .catch(err => next(err));
})
.post((req, res, next) => {
    Book.create(req.body)
    .then(book => {
        console.log('Bampsite Created: ', book);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(book);
    })
    .catch(err => next(err));
})
.put((req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /books`);
})
.delete((req, res, next) => {
    Book.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

bookRouter.route('/:bookId')
.get((req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(book);
    })
    .catch(err => next(err))
})
.post((req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /books/${req.params.bookId}`);
})
.put((req, res, next) => {
    Book.findByIdAndUpdate(req.params.bookId, {
        $set: req.body,
    }, { new: true })
    .then(book => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(book);
    })
    .catch(err => next(err))
})
.delete((req, res, next) => {
    Book.findByIdAndDelete(req.params.bookId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err))
});

bookRouter.route('/:bookId/comments')
.get((req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        if(book) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(book.comments);
        } else {
            err = new Error(`book ${req.params.bookId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post((req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        if(book) {
            book.comments.push(req.body);
            book.save()
            .then(book => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(book);   
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Book ${req.params.bookId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put((req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /books/${req.params.bookId}/comments`);
})
.delete((req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        if(book) {
            for (let i = (book.comments.length-1); i >=0; i--) {
                book.comments.id(book.comments[i]._id).remove();
            }
            book.save()
            .then(book => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(book);   
            })
            .catch(err => next(err));
        } else {
            err = new Error(`book ${req.params.bookId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

bookRouter.route('/:bookId/comments/:commentId')
.get((req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        if(book && book.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(book.comments.id(req.params.commentId));
        } else if (!book) {
            err = new Error(`Book ${req.params.bookId} not found`);
            res.statusCode = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /books/${req.params.bookId}/comments/${req.params.commentId}`);
})
.put((req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        if(book && book.comments.id(req.params.commentId)) {
            if(req.body.rating) {
                book.comments.id(req.params.commentId).rating = req.body.rating;
            }
            if(req.body.text) {
                book.comments.id(req.params.commentId).text = req.body.text;
            }
            book.save()
            .then(book => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(book);
            })
            .catch(err => next(err));
        } else if (!book) {
            err = new Error(`book ${req.params.bookId} not found`);
            res.statusCode = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete((req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        if(book && book.comments.id(req.params.commentId)) {
            book.comments.id(req.params.commentId).remove();
            book.save()
            .then(book => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(book);
            })
            .catch(err => next(err));
        } else if (!book) {
            err = new Error(`book ${req.params.bookId} not found`);
            res.statusCode = 404;
            return next(err);
        } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = bookRouter;