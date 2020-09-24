const compare = require("tsscmp");

module.exports = {
    // Basic function to validate credentials for example
    check : (name, pass) => {
        var valid = true;

        // Simple method to prevent short-circut and use timing-safe compare
        valid = compare(name, process.env.ADMIN_USERNAME) && valid;
        valid = compare(pass, process.env.ADMIN_PASSWORD) && valid;
        return valid;
    },
    // Make sure user is an admin before moving to next callback
    requireAdmin : (req, res, next) => {
        if (req.session.type === "admin") {
            console.log("Admin authorized");
            next();
        }
        else
        {
            console.log(req.session.type)
            res.status(401).json({message: "unauthorized!"})
        }
    }
}