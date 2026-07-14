const sanitize = (val) => {
  if (val instanceof Object) {
    for (const key in val) {
      if (/^\$/.test(key)) {
        delete val[key];
      } else {
        sanitize(val[key]);
      }
    }
  }
  return val;
};

const sanitizeMiddleware = (req, res, next) => {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

module.exports = sanitizeMiddleware;
