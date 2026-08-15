function requireUserId(req, res, next) {
  const userId = req.header('X-User-Id');
  if (!userId) {
    return res.status(400).json({ error: 'Missing X-User-Id header' });
  }
  req.userId = userId;
  next();
}

module.exports = { requireUserId };