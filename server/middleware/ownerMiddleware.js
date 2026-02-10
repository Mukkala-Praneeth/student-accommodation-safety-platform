const ownerMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'owner') {
    return res.status(403).json({
      success: false,
      message: 'Accommodation owner access required'
    });
  }

  next();
};

module.exports = ownerMiddleware;
