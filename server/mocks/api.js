module.exports = function(app) {
  var express = require('express');
  var apiRouter = express.Router();

  apiRouter.get('/posts', function(req, res) {
    res.send({
      'posts': [
        { id: 1, title: 'First post title', body: 'First post body' },
        { id: 2, title: 'Second post title', body: 'Second post body' }
      ]
    });
  });

  apiRouter.get('/posts/1', function(req, res) {
    res.send({
      'post': { id: 1, title: 'First post title', body: 'First post body' }
    });
  });

  apiRouter.get('/posts/2', function(req, res) {
    res.send({
      'post': { id: 2, title: 'Second post title', body: 'Second post body' }
    });
  });

  apiRouter.post('/', function(req, res) {
    res.status(201).end();
  });

  apiRouter.put('/posts/:id', function(req, res) {
    var response = req.body;
    response['id'] = req.params.id

    res.send({
      'post': response
    });
  });

  apiRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });

  app.use('/api/', apiRouter);
};
