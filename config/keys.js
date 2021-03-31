if(process.env.NODE_ENV === "production") {
    // if on production site
    module.exports = require('./prod')
} else {
    module.exports = require('./dev')
}