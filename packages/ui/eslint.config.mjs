import { forbidWorkspace, packageConfig, restrictImports } from "../../eslint.boundaries.mjs";

export default packageConfig(
  restrictImports([
    forbidWorkspace("@devmentor/ui"),
    {
      group: ["next", "next/*", "@mikro-orm/*", "awilix"],
      message: "@devmentor/ui holds framework-agnostic presentational components only.",
    },
  ]),
);
