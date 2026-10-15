import { forbidWorkspace, packageConfig, restrictImports } from "../../eslint.shared.mjs";

export default packageConfig(
  restrictImports([
    forbidWorkspace("@devmentor/db", ["@devmentor/core"]),
    {
      group: ["next", "next/*", "react", "react/*", "react-dom", "react-dom/*"],
      message: "@devmentor/db is UI-agnostic — rendering belongs to @devmentor/app.",
    },
  ]),
);
