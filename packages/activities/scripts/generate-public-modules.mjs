import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(packageRoot, "..", "src");
const schemasPath = join(srcRoot, "schemas.ts");
const publicRoot = join(srcRoot, "public");

const schemasSource = await import("node:fs/promises").then(({ readFile }) => readFile(schemasPath, "utf8"));

function extractTupleNames(blockName) {
  const match = schemasSource.match(
    new RegExp(`(?:export\\s+)?const\\s+${blockName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s+as\\s+const`)
  );
  if (!match) {
    throw new Error(`Could not find ${blockName} in src/schemas.ts`);
  }

  return [...match[1].matchAll(/^\s*\["([^"]+)"/gm)].map((entry) => entry[1]);
}

const leafTypes = extractTupleNames("activitySchemaPairs");
const componentTypes = [...new Set([...leafTypes, ...extractTupleNames("schemas")])];
const leafTypeSet = new Set(leafTypes);

function leafModule(componentType) {
  return `import { leafSchemas } from "../subpath.js";
import type {
  ComponentSchema,
  LeafActivityComponentData,
  LeafActivityPayload,
  LeafActivityProps,
  LeafActivitySchemaPair
} from "../schemas.js";

export const componentType = "${componentType}";

const schemas = leafSchemas(componentType);

export const schema: ComponentSchema<typeof componentType> = schemas.schema;
export const fullSchema: LeafActivitySchemaPair<typeof componentType>["full"] = schemas.fullSchema;
export const componentDataSchema: LeafActivitySchemaPair<typeof componentType>["componentData"] = schemas.componentDataSchema;
export const propsSchema: LeafActivitySchemaPair<typeof componentType>["activityProps"] = schemas.propsSchema;

export type Payload = LeafActivityPayload<typeof componentType>;
export type ComponentData = LeafActivityComponentData<typeof componentType>;
export type Props = LeafActivityProps<typeof componentType>;

export default schema;
`;
}

function componentModule(componentType) {
  return `import { componentSubpath } from "../subpath.js";
import type { ActivityPayload, ComponentSchema } from "../schemas.js";

export const componentType = "${componentType}";

const schemas = componentSubpath(componentType);

export const schema: ComponentSchema<typeof componentType> = schemas.schema;

export type Payload = ActivityPayload<typeof componentType>;

export default schema;
`;
}

await rm(publicRoot, { force: true, recursive: true });
await mkdir(publicRoot, { recursive: true });

await Promise.all(
  componentTypes.map((componentType) =>
    writeFile(
      join(publicRoot, `${componentType}.ts`),
      leafTypeSet.has(componentType) ? leafModule(componentType) : componentModule(componentType)
    )
  )
);
