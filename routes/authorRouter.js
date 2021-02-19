const express = require('express');
const Author = require('../models/author');
const authenticate = require('../authenticate');
const cors = require('./cors');

const authorRouter = express.Router();

/* All authors */
authorRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Author.find()
    .populate('comments.author')
    .then(authors => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(authors);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Author.create(req.body)
    .then(author => {
        console.log('Author Created: ', author);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(author);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /authors`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`DELETE operation not supported on /authors`);
});

/* A specific author */
authorRouter.route('/:authorId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Author.findById(req.params.authorId)
    .populate('comments.author')
    .then(author => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(author);
    })
    .catch(err => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /authors/${req.params.authorId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Author.findByIdAndUpdate(req.params.authorId, {
        $set: req.body,
    }, { new: true })
    .then(author => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(author);
    })
    .catch(err => next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Author.findByIdAndDelete(req.params.authorId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err))
});

/* All comments for a specific author */
authorRouter.route('/:authorId/comments')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Author.findById(req.params.authorId)
    .populate('comments.author')
    .then(author => {
        if(author) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(author.comments);
        } else {
            err = new Error(`Author ${req.params.authorId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author) {
            req.body.author = req.user._id;
            author.comments.push(req.body);
            author.save()
            .then(author => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(author);   
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Author ${req.params.authorId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /authors/${req.params.authorId}/comments`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author) {
            for (let i = (author.comments.length-1); i >=0; i--) {
                author.comments.id(author.comments[i]._id).remove();
            }
            author.save()
            .then(author => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(author);   
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Author ${req.params.authorId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

/* A specific comment for a specific author */
authorRouter.route('/:authorId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Author.findById(req.params.authorId)
    .populate('comments.author')
    .then(author => {
        if(author && author.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(author.comments.id(req.params.commentId));
        } else if (!author) {
            err = new Error(`Author ${req.params.authorId} not found`);
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
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /authors/${req.params.authorId}/comments/${req.params.commentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author && author.comments.id(req.params.commentId)) {
            if(req.body.text) {
                author.comments.id(req.params.commentId).text = req.body.text;
            }
            author.save()
            .then(author => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(author);
            })
            .catch(err => next(err));
        } else if (!author) {
            err = new Error(`Author ${req.params.authorId} not found`);
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
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author && author.comments.id(req.params.commentId)) {
            author.comments.id(req.params.commentId).remove();
            author.save()
            .then(author => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(author);
            })
            .catch(err => next(err));
        } else if (!author) {
            err = new Error(`Author ${req.params.authorId} not found`);
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

/* All ratings for a specific author */
authorRouter.route('/:authorId/ratings')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Author.findById(req.params.authorId)
    .populate('ratings.author')
    .then(author => {
        if(author) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(author.ratings);
        } else {
            err = new Error(`Author ${req.params.authorId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author) {
            req.body.author = req.user._id;
            author.ratings.push(req.body);
            author.save()
            .then(author => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(author);   
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Author ${req.params.authorId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /authors/${req.params.authorId}/ratings`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author) {
            for (let i = (author.ratings.length-1); i >=0; i--) {
                author.ratings.id(author.ratings[i]._id).remove();
            }
            author.save()
            .then(author => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(author);   
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Author ${req.params.authorId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

/*  A specific rating for a specific author
    Should only ever be one bio at index 0  */
authorRouter.route('/:authorId/ratings/:ratingId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Author.findById(req.params.authorId)
    .populate('ratings.author')
    .then(author => {
        if(author && author.ratings.id(req.params.ratingId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(author.ratings.id(req.params.ratingId));
        } else if (!author) {
            err = new Error(`Author ${req.params.authorId} not found`);
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
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /authors/${req.params.authorId}/ratings/${req.params.ratingId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author && author.ratings.id(req.params.ratingId)) {
            if(req.body.rating) {
                author.ratings.id(req.params.ratingId).rating = req.body.rating;
            }
            author.save()
            .then(author => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(author);
            })
            .catch(err => next(err));
        } else if (!author) {
            err = new Error(`Author ${req.params.authorId} not found`);
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
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author && author.ratings.id(req.params.ratingId)) {
            author.ratings.id(req.params.ratingId).remove();
            author.save()
            .then(author => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(author);
            })
            .catch(err => next(err));
        } else if (!author) {
            err = new Error(`Author ${req.params.authorId} not found`);
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

/* All bios for a specific author */
authorRouter.route('/:authorId/bio')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(author.bio[0]);
        } else {
            err = new Error(`Author ${req.params.authorId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author) {
            author.bio.splice(0,1,req.body);
            author.save()
            .then(author => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(author);   
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Author ${req.params.authorId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /authors/${req.params.authorId}/bio`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author) {
            for (let i = (author.bio.length-1); i >=0; i--) {
                author.bio.id(author.ratings[i]._id).remove();
            }
            author.save()
            .then(author => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(author);   
            })
            .catch(err => next(err));
        } else {
            err = new Error(`Author ${req.params.authorId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

/* A specific bio for a specific author */
authorRouter.route('/:authorId/bio/:bioId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author && author.bio.id(req.params.bioId)) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(author.bio.id(req.params.bioId));
        } else if (!author) {
            err = new Error(`Author ${req.params.authorId} not found`);
            res.statusCode = 404;
            return next(err);
        } else {
            err = new Error(`Bio ${req.params.bioId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /authors/${req.params.authorId}/bio/${req.params.bioId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author && author.bio.id(req.params.bioId)) {
            if(req.body.bio) {
                author.bio.id(req.params.bioId).bio = req.body.bio;
            }
            author.save()
            .then(author => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(author);
            })
            .catch(err => next(err));
        } else if (!author) {
            err = new Error(`Author ${req.params.authorId} not found`);
            res.statusCode = 404;
            return next(err);
        } else {
            err = new Error(`Bio ${req.params.bioId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Author.findById(req.params.authorId)
    .then(author => {
        if(author && author.bio.id(req.params.bioId)) {
            author.ratings.id(req.params.ratingId).remove();
            author.save()
            .then(author => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(author);
            })
            .catch(err => next(err));
        } else if (!author) {
            err = new Error(`Author ${req.params.authorId} not found`);
            res.statusCode = 404;
            return next(err);
        } else {
            err = new Error(`Bio ${req.params.bioId} not found`);
            res.statusCode = 404;
            return next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = authorRouter;