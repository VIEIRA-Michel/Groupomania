const rateLimit = require("express-rate-limit");

exports.authtLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 10, // start blocking after 5 requests
    message:
        "Trop de requêtes d'authentification ont été effectués par cette adresse IP. Veuillez essayé de nouveau dans 1 heure. Merci pour votre compréhension."
});

exports.navigateLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 minutes
    max: 3000,
    message:
        "Trop de requêtes ont été effectués par cette adresse IP. Veuillez essayé de nouveau dans 5 minutes. Merci pour votre compréhension."
});