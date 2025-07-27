# eslint-plugin-package-json-import-checker

ESLint plugin to ensure imported packages are declared in `package.json`.

## Installation

```sh
npm i eslint --save-dev
npm install eslint-plugin-package-json-import-checker --save-dev
```

## Usage

Add the plugin to your eslint config file:

```json
{
  "plugins": ["package-json-import-checker"],
  "rules": {
    "package-json-import-checker/no-unlisted-import": ["error", {
      "packages": [{ "root": "src", "packageJson": "package.json" }],
      "server": false,
      "blacklist": []
    }]
  }
}
```

Set `server` to `true` to automatically block Node.js built in modules. Use the
`blacklist` option to block specific package names. Wildcards using `*` are
supported.
