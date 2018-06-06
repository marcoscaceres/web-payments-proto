module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
      jsx: false,
    },
  },
  extends: ["eslint:recommended", "prettier"], // extending recommended config and config derived from eslint-config-prettier
  plugins: ["prettier"], // activating esling-plugin-prettier (--fix stuff)
  rules: {
    "prettier/prettier": [
      // customizing prettier rules (unfortunately not many of them are customizable)
      "error",
      {
        singleQuote: false,
        trailingComma: "es5",
      },
    ],
    eqeqeq: ["error", "always"], // adding some custom ESLint rules
    "no-console": 0,
  },
  env: {
    browser: true,
    es6: true,
  },
};
