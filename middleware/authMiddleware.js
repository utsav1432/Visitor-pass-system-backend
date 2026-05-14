const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    const { authorization } = req.headers;

    if(!authorization){
        return res.status(401).json({error: "authorization token required"})
    }

    const token = authorization.split(' ')[1];

    try {
        const {_id} = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findOne({_id}).select('-password');
    
        if (!req.user) {
            return res.status(401).json({ 
                message: "User not found" 
            });
        }
    
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token not valid" });
    }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role ${req.user.role} is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };