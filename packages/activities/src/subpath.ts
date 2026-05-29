import { activityComponentSchemas, componentSchemas } from "./schemas.js";
import type { ComponentSchema, ComponentType, LeafActivitySchemaPair, LeafActivityType } from "./schemas.js";

export type LeafSubpathSchemas<T extends LeafActivityType> = {
  schema: ComponentSchema<T>;
  fullSchema: LeafActivitySchemaPair<T>["full"];
  componentDataSchema: LeafActivitySchemaPair<T>["componentData"];
  propsSchema: LeafActivitySchemaPair<T>["activityProps"];
};

export type ComponentSubpathSchemas<T extends ComponentType> = {
  schema: ComponentSchema<T>;
};

export function leafSchemas<T extends LeafActivityType>(componentType: T): LeafSubpathSchemas<T> {
  const pair = activityComponentSchemas[componentType];

  return {
    schema: componentSchemas[componentType],
    fullSchema: pair.full,
    componentDataSchema: pair.componentData,
    propsSchema: pair.activityProps
  } as LeafSubpathSchemas<T>;
}

export function componentSubpath<T extends ComponentType>(componentType: T): ComponentSubpathSchemas<T> {
  return {
    schema: componentSchemas[componentType]
  } as ComponentSubpathSchemas<T>;
}
