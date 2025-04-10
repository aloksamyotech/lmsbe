const jwt = require("jsonwebtoken"); 

const verifyJWT = async (req, res, next) => {
    try {
        const token = req?.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                status: false,
                error: "Unauthorized request"
            })
        }
        const decodedToken = jwt.verify(token,"Token");
        
        if(decodedToken){
            return res.status(401).json({
                status: false,
                error: "Invalid request"
            })
        }
        req.user = decodedToken
        next();
    } catch (error) {
        return res.status(401).json({
            status: false,
            error: "Invalid token"
        })
    }
}
module.exports = verifyJWT;