const rateLimitWindow = 15 * 60 * 1000; // 15 minutes
const requestCounts = new Map();

const createRateLimiter = (maxRequests, message) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    // Prune expired records on-demand when the cache grows larger (prevents memory leak without background intervals)
    if (requestCounts.size > 1000) {
      for (const [key, record] of requestCounts.entries()) {
        if (now > record.resetTime) {
          requestCounts.delete(key);
        }
      }
    }
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, { count: 1, resetTime: now + rateLimitWindow });
      return next();
    }
    
    const record = requestCounts.get(ip);
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + rateLimitWindow;
      return next();
    }
    
    record.count++;
    if (record.count > maxRequests) {
      return res.status(429).json({ message: message || 'Too many requests, please try again later' });
    }
    next();
  };
};

module.exports = {
  loginLimiter: createRateLimiter(5, 'Too many login attempts from this IP, please try again after 15 minutes'),
  inquiryLimiter: createRateLimiter(10, 'Too many inquiry submissions from this IP, please try again after 15 minutes'),
  reviewLimiter: createRateLimiter(10, 'Too many review submissions from this IP, please try again after 15 minutes')
};
