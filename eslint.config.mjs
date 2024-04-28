import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        Morebits: "readonly",
        mw: "readonly",
        ...globals.browser,
        Window: "writable"
      }
    }
  },
  pluginJs.configs.recommended,

  {
    rules: {}
  }

];