# @baiq/activities

Zod schemas and TypeScript types for BAIQ activity components.

`@baiq/activities` is a public npm package published under the `@baiq` scope.

## Installation

```bash
npm install @baiq/activities
```

## Usage

Import the complete registry from the package root:

```ts
import {
  componentSchemas,
  type ActivityPayload,
  type ComponentType
} from "@baiq/activities";

const activity: ActivityPayload<"activity-test"> = {
  componentGroup: "assessment",
  componentName: "basic-question",
  componentData: {
    name: "Basic question",
    type: "activity-test",
    props: {
      entry: {
        content: "What is 2 + 2?"
      },
      answers: {
        answersItem: [
          {
            content: "4",
            correct: true,
            image: null,
            fit: "cover"
          }
        ],
        answersNumber: 1,
        type: "text"
      }
    }
  }
};

const type: ComponentType = "activity-test";
const parsed = componentSchemas[type].parse(activity);

console.log(parsed);
```

Or import a specific activity schema from its subpath:

```ts
import activityTestSchema, { type Payload } from "@baiq/activities/activity-test";

const activity: Payload = {
  componentGroup: "assessment",
  componentName: "basic-question",
  componentData: {
    name: "Basic question",
    type: "activity-test",
    props: {
      entry: {
        content: "What is 2 + 2?"
      },
      answers: {
        answersItem: [
          {
            content: "4",
            correct: true,
            image: null,
            fit: "cover"
          }
        ],
        answersNumber: 1,
        type: "text"
      }
    }
  }
};

const parsed = activityTestSchema.parse(activity);

console.log(parsed);
```

## Exports

- `schemas`: readonly tuple of `[componentType, zodSchema]` entries.
- `componentSchemas`: object map keyed by component type.
- `zodSchemas`: alias of `componentSchemas`.
- `activitySchemaPairs`: readonly tuple of leaf activity schema pairs.
- `activityComponentSchemas`: object map keyed by leaf activity type, exposing `full`, `componentData`, and `activityProps` schemas.
- `ComponentType`: union of exported component type names.
- `ActivityPayload<T>`: TypeScript type inferred from the Zod schema for a component type.
- `ActivityPayloadByType`: map of component type names to inferred payload types.
- `LeafActivityPayload<T>` and `LeafActivityProps<T>`: inferred types for leaf activity components.

Every component type is also available as a subpath. For example:

```ts
import activityFillTextSchema, {
  propsSchema,
  type Payload,
  type Props
} from "@baiq/activities/activity-fill-text";
```

The subpath modules are generated during `npm run build` from the central schema registry in `src/schemas.ts`; do not edit `src/public/*` by hand.

## Publishing

Publish this package as a public npm package with:

```bash
npm publish -w @baiq/activities --access public
```
