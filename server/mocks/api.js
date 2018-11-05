module.exports = function(app) {
  let express = require('express');
  let apiRouter = express.Router();

  apiRouter.get('/posts', function(req, res) {
    res.send({ posts: posts });
  });

  apiRouter.get('/posts/:id', function(req, res) {
    res.send({ 'post': find(posts, req.params.id) });
  });

  apiRouter.put('/posts/:id', function(req, res) {
    let post = find(posts, req.params.id);
    let postPayload = req.body.post

    post.title = postPayload.title;
    post.body = postPayload.body;

    res.send({ 'post': post });
  });

  app.use('/api/', apiRouter);
};

let posts = [
  { id: '1', title: 'First post title', body: 'First post body' },
  { id: '2', title: 'Second post title', body: 'Second post body' }
]

function find(collection, id) {
  return collection.filter(function(model) {
    return model.id === id;
  })[0];
}
