import { type ZodType, z } from "zod/v3";

const baseComponent = {
  componentName: z.string().describe("Nombre identificativo de la actividad"),
  name: z.string().describe("Título de la actividad"),
  entry: z.object({
    content: z.string().describe("Enunciado de la actividad")
  })
};

function timeValueToSeconds(time: { value: number; unit: "seg" | "min" }): number {
  return time.unit === "min" ? time.value * 60 : time.value;
}

export function validateTimedReadingMinMaxTime(
  time:
    | {
        enableTimeLimit?: boolean;
        minTime?: { value?: number; unit?: "seg" | "min" } | null;
        maxTime?: { value?: number; unit?: "seg" | "min" } | null;
      }
    | undefined
    | null,
  ctx: z.RefinementCtx,
  minTimeIssuePath: (string | number)[]
) {
  if (!time) return;
  if (!time.minTime || !time.maxTime) return;
  if (
    typeof time.minTime.value !== "number" ||
    typeof time.maxTime.value !== "number" ||
    (time.minTime.unit !== "seg" && time.minTime.unit !== "min") ||
    (time.maxTime.unit !== "seg" && time.maxTime.unit !== "min")
  ) {
    return;
  }
  const minSeconds = timeValueToSeconds({ value: time.minTime.value, unit: time.minTime.unit });
  const maxSeconds = timeValueToSeconds({ value: time.maxTime.value, unit: time.maxTime.unit });
  if (minSeconds > maxSeconds) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "minTime cannot be greater than maxTime",
      path: minTimeIssuePath
    });
  }
}

function buildActivitySchemaParts<T extends z.ZodRawShape>(type: string, props: T) {
  const activityProps = z.object({
    ...(type.includes("activity") && { entry: baseComponent.entry }),
    ...props
  });
  const componentData = z.object({
    name: baseComponent.name,
    type: z.enum([type]),
    props: activityProps
  });
  return { activityProps, componentData };
}

export function createComponentSchema<T extends z.ZodRawShape>(type: string, props: T) {
  const { activityProps, componentData } = buildActivitySchemaParts(type, props);
  const full = z.object({
    componentGroup: z.string().describe("Grupo de componentes al que pertenece"),
    componentName: baseComponent.componentName,
    componentData
  });
  return { full, componentData, activityProps };
}

/** Pair returned by every activity definition (may wrap `full`/`componentData`/`activityProps` with refinements). */
export type ActivityComponentSchemaPair = {
  full: ZodType;
  componentData: ZodType;
  /** Shape of `activitiesItem[].props` in group/sequence (same as `componentData.props` in a root component). */
  activityProps: ZodType;
};

export const fileObject = () =>
  z
    .string()
    .or(z.object({ id: z.string(), filename: z.string(), url: z.string() }))
    .optional()
    .nullable()
    .describe(
      "Referencia del archivo, si lo hay, respeta todos símbolos, incluidos <>, [] y {}. Si estás creando una actividad a partir de texto, utiliza el tipo 'string'"
    );
