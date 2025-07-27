module.exports.rules = {
    'no-unlisted-import': require('./rules/no-unlisted-import'),
};

module.exports.configs = {
    recommended: {
        rules: {
            'package-json-import-checker/no-unlisted-import': 'error',
        },
    },
};
