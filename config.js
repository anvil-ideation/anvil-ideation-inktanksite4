const Creds = require('./hidden');

module.exports = {
    'secretKey': '12345-67890-09876-54321',
    'mongoUrl': 'mongodb://localhost:27017/inktank',
    'facebook': {
        clientId: Creds.fbClientId,
        clientSecret: Creds.fbClientSecret,
    },
    'google': {
        clientId: Creds.gClientId,
        clientSecret: Creds.gClientSecret,
    }
};