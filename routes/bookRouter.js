const express = require('express');
const Book = require('../models/book');
const authenticate = require('../authenticate');

const bookRouter = express.Router();

/* All books */
bookRouter.route('/')
.get((req, res, next) => {
    Book.find()
    .populate('comments.author')
    .then(books => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(books);
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Book.create(req.body)
    .then(book => {
        console.log('Book Created: ', book);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(book);
    })
    .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /books`);
})
.delete(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`DELETE operation not supported on /books`);
});

/* A specific book */
bookRouter.route('/:bookId')
.get((req, res, next) => {
    Book.findById(req.params.bookId)
    .populate('comments.author')
    .then(book => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(book);
    })
    .catch(err => next(err))
})
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /books/${req.params.bookId}`);
})
.put(authenticate.verifyUser, (req, res, next) => {
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
.delete(authenticate.verifyUser, (req, res, next) => {
    Book.findByIdAndDelete(req.params.bookId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err))
});

/* All comments for a specific book */
bookRouter.route('/:bookId/comments')
.get((req, res, next) => {
    Book.findById(req.params.bookId)
    .populate('comments.author')
    .then(book => {
        if(book) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(book.comments);
        } else {
            err = new Error(`Book ${req.params.bookId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        if(book) {
            req.body.author = req.user._id;
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
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /books/${req.params.bookId}/comments`);
})
.delete(authenticate.verifyUser, (req, res, next) => {
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
            err = new Error(`Book ${req.params.bookId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

/* A specific comment for a specific book */
bookRouter.route('/:bookId/comments/:commentId')
.get((req, res, next) => {
    Book.findById(req.params.bookId)
    .populate('comments.author')
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
.post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /books/${req.params.bookId}/comments/${req.params.commentId}`);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        if(book && book.comments.id(req.params.commentId)) {
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
.delete(authenticate.verifyUser, (req, res, next) => {
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
});

/* All ratings for a specific book */
bookRouter.route('/:bookId/ratings')
.get((req, res, next) => {
    Book.findById(req.params.bookId)
    .populate('ratings.author')
    .then(book => {
        if(book) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(book.ratings);
        } else {
            err = new Error(`Book ${req.params.bookId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        if(book) {
            req.body.author = req.user._id;
            book.ratings.push(req.body);
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
.put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /books/${req.params.bookId}/ratings`);
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        if(book) {
            for (let i = (book.ratings.length-1); i >=0; i--) {
                book.ratings.id(book.ratings[i]._id).remove();
            }
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
});

/* A specific rating for a specific book */
bookRouter.route('/:bookId/ratings/:ratingId')
.get((req, res, next) => {
    Book.findById(req.params.bookId)
    .populate('ratings.author')
    .then(book => {
        if(book && book.ratings.id(req.params.ratingId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(book.ratings.id(req.params.ratingId));
        } else if (!book) {
            err = new Error(`Book ${req.params.bookId} not found`);
            res.statusCode = 404;
            return next(err);
        } else {
            err = new Error(`Rating ${req.params.ratingId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /books/${req.params.bookId}/ratings/${req.params.ratingId}`);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        if(book && book.ratings.id(req.params.ratingId)) {
            if(req.body.rating) {
                book.ratings.id(req.params.ratingId).rating = req.body.rating;
            }
            book.save()
            .then(book => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(book);
            })
            .catch(err => next(err));
        } else if (!book) {
            err = new Error(`Book ${req.params.bookId} not found`);
            res.statusCode = 404;
            return next(err);
        } else {
            err = new Error(`Rating ${req.params.ratingId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Book.findById(req.params.bookId)
    .then(book => {
        if(book && book.ratings.id(req.params.ratingId)) {
            book.ratings.id(req.params.ratingId).remove();
            book.save()
            .then(book => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(book);
            })
            .catch(err => next(err));
        } else if (!book) {
            err = new Error(`Book ${req.params.bookId} not found`);
            res.statusCode = 404;
            return next(err);
        } else {
            err = new Error(`Rating ${req.params.ratingId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = bookRouter;