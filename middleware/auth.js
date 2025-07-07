const jwt = require('jsonwebtoken');
const secret = "Paawan";

function setUser(user) {
    let payload = {};

    if (user && user.role === "client") {
        payload = {
            _id: user.client_id,
            email: user.email_id,
            role: "client"
        };
    } else if (user && user.role === "freelancer") {
        payload = {
            _id: user.freelancer_id,
            email: user.email_id,
            role: "freelancer"
        };
    }

    return jwt.sign(payload, secret);
}

function getUser(token) {
    if(!token) return null;
    return jwt.verify(token, secret);
}

module.exports = {setUser, getUser};