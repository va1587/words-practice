import { forbidWorkspace, packageConfig, restrictImports } from "../../eslint.boundaries.mjs";

export default packageConfig(
  restrictImports([
    forbidWorkspace("@devmentor/core"),
    {
      group: ["next", "next/*", "react", "react/*", "react-dom", "react-dom/*", "@mikro-orm/*"],
      message: "@devmentor/core is framework- and ORM-agnostic — move this code to app or db.",
    },
  ]),
);
