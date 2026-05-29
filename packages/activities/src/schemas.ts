import { type ZodType, z } from "zod/v3";
import {
  createComponentSchema,
  fileObject,
  type ActivityComponentSchemaPair,
  validateTimedReadingMinMaxTime
} from "./schema-helpers.js";

const activityTest = createComponentSchema("activity-test", {
  answers: z.object({
    answersItem: z
      .array(
        z.object({
          content: z.string().describe("Texto de la posible respuesta"),
          correct: z.boolean().describe("Booleano que indica si la respuesta es correcta o no"),
          image: fileObject(),
          fit: z.enum(["cover"]).describe("Encaje de la imagen, en caso de haberla")
        })
      )
      .describe("Array de posibles respuestas de la actividad"),
    answersNumber: z.number().describe("Cantidad de posibles respuestas"),
    type: z.enum(["text", "image", "image-text"]),
    answersAlign: z.enum(["vertical", "horizontal"]).optional().nullable(),
    imagesDistribution: z.enum(["couples", "trios"]).optional().nullable()
  })
});

const activityAnswerOpen = createComponentSchema("activity-answer-open", {
  solution: z.object({
    content: z.string().describe("Solución de la actividad"),
    propActive: z.boolean().describe("Booleano que indica si hay o no solución")
  }),
  answer: z.object({
    characterLimit: z.number().describe("Límite de caracteres")
  })
});

const activityAnswerExact = createComponentSchema("activity-answer-exact", {
  solution: z.object({
    content: z.string().describe("Solución exacta de la actividad")
  }),
  answer: z.object({
    characterLimit: z.number().int().min(300).max(300).describe("Límite fijo de caracteres")
  })
});

const activityAnswerWithNumbers = createComponentSchema("activity-answer-with-numbers", {
  result: z.object({
    exactNumber: z.string().describe("Resultado exacto del cálculo")
  })
});

const dragAndDropCards = () =>
  z
    .object({
      cardsItem: z.array(
        z.object({
          content: z.string().describe("Texto de la tarjeta"),
          correct: z.number().describe("Índice del hueco al que debe arrastrarse"),
          image: fileObject(),
          fit: z.enum(["cover"]).optional().nullable().describe("Encaje de la imagen, en caso de haberla")
        })
      ),
      cardsNumber: z.number().describe("Cantidad de tarjetas"),
      type: z.enum(["text", "image", "image-text"])
    })
    .describe("Tarjetas de la actividad, actúan como draggable");

const activityDragAndDrop = createComponentSchema("activity-drag-and-drop", {
  structure: z
    .object({
      gaps: z
        .object({
          gapsItem: z.array(
            z.object({
              text: z.string().optional().nullable()
            })
          ),
          gapsNumber: z.number().describe("Cantidad de huecos")
        })
        .describe("Huecos de la actividad, actúan como droppable"),
      cards: dragAndDropCards()
    })
    .describe("Estructura de la actividad, contiene cards (draggables) y gaps (droppables)"),
  background: z.object({
    fit: z.enum(["cover"]),
    image: fileObject()
  })
});

const activityDragAndDropClassify = createComponentSchema("activity-drag-and-drop-classify", {
  structure: z
    .object({
      columns: z
        .object({
          columnsItem: z.array(
            z.object({
              title: z.string().optional().nullable(),
              subtitle: z.string().optional().nullable()
            })
          ),
          columnsNumber: z.number().describe("Cantidad de columnas"),
          type: z.enum(["text", "image", "image-text"])
        })
        .describe("Columnas de la actividad, actúan como droppable"),
      cards: dragAndDropCards(),
      cardsAlign: z.enum(["vertical"])
    })
    .describe("Estructura de la actividad, entre otros contiene cards (draggables) y columns (droppables)"),
  background: z.object({
    fit: z.enum(["cover"]).optional().nullable(),
    image: fileObject()
  })
});

const activityFillText = createComponentSchema("activity-fill-text", {
  content: z.object({
    text: z.string().describe("Texto con huecos ya definidos como @@<id>@@")
  }),
  solution: z
    .object({
      propActive: z.boolean().optional().nullable(),
      image: z
        .object({
          propActive: z.boolean().optional().nullable(),
          url: z.string().optional().nullable(),
          alt: z.string().optional().nullable()
        })
        .optional()
        .nullable(),
      text: z
        .object({
          propActive: z.boolean().optional().nullable(),
          content: z.string().optional().nullable()
        })
        .optional()
        .nullable()
    })
    .optional()
    .nullable()
    .describe("Solución recomendada con imagen y/o texto")
});
const activityFillTextDeliverable = createComponentSchema("activity-fill-text-deliverable", {
  content: z.object({
    text: z.string().describe("Texto con huecos ya definidos como @@<id>@@")
  }),
  solution: z
    .object({
      propActive: z.boolean().optional().nullable(),
      image: z
        .object({
          propActive: z.boolean().optional().nullable(),
          url: z.string().optional().nullable(),
          alt: z.string().optional().nullable()
        })
        .optional()
        .nullable(),
      text: z
        .object({
          propActive: z.boolean().optional().nullable(),
          content: z.string().optional().nullable()
        })
        .optional()
        .nullable()
    })
    .optional()
    .nullable()
    .describe("Solución recomendada con imagen y/o texto")
});

const activityDragAndDropText = createComponentSchema("activity-drag-and-drop-text", {
  textCards: z.object({
    layout: z.enum(["vertical"]),
    mainText: z.string().describe(
      "Texto con huecos en formato @@contenido@@. \
     Nunca usar índices numéricos (@@1@@, @@2@@). \
     Si el input usa números y hay soluciones especificadas, deben resolverse usando la solución."
    ),
    gapsItem: z.array(z.string().describe("Contenido del hueco, repetible")).describe("Array de huecos a rellenar")
  })
});

const activityDropdown = createComponentSchema("activity-dropdown", {
  content: z.object({
    content: z
      .string()
      .describe(
        "Texto que viene ya marcado con elementos de selección con el siguiente formato a respetar: @@*[opción-1]||[opción-2]@@, donde el asterisco marca la respuesta correcta"
      )
  })
});

const activityDropdownImage = createComponentSchema("activity-dropdown-image", {
  content: z.object({
    options: z.object({
      optionsItem: z
        .array(z.object({ content: z.string() }))
        .describe("Array de posibles opciones de entre las que elegir"),
      optionsNumber: z.number().describe("Cantidad de opciones")
    }),
    cardsItem: z.array(
      z.object({
        title: z.string(),
        text: z.string(),
        correct: z.number().describe("Índice del hueco al que debe arrastrarse"),
        image: fileObject()
      })
    ),
    cardsNumber: z.number().describe("Cantidad de tarjetas"),
    type: z
      .enum(["image", "image-text"])
      .describe('El tipo es "image-text" si hay algun texto en las tarjetas, en caso contrario es "image"'),
    cardsDistribution: z.enum(["couples"])
  })
});

const activityDragAndDropImage = createComponentSchema("activity-drag-and-drop-image", {
  content: z
    .object({
      options: z.object({
        optionsItem: z
          .array(z.object({ content: z.string() }))
          .describe("Array de posibles opciones (huecos) de entre las que elegir"),
        optionsNumber: z.number().describe("Cantidad de opciones")
      }),
      cardsItem: z.array(
        z
          .object({
            title: z.string(),
            text: z.string(),
            correct: z.number().describe("Índice del hueco al que debe arrastrarse"),
            image: fileObject()
          })
          .strict()
      ),
      cardsNumber: z.number().describe("Cantidad de tarjetas"),
      type: z
        .enum(["image", "image-text"])
        .describe('El tipo es "image-text" si hay algun texto en las tarjetas, en caso contrario es "image"'),
      cardsDistribution: z.enum(["couples", "trios", "quartets"])
    })
    .strict()
});

const activityDragAndDropImageAndGapsProps = {
  imageAndGaps: z.object({
    disposition: z
      .enum(["vertical", "horizontal"])
      .describe('"vertical" muestra la columna de tarjetas a la derecha de la imagen, "horizontal" la muestra debajo'),
    image: fileObject().describe("Imagen principal de la actividad"),
    gapsNumber: z.number().min(2).max(10).describe("Número de huecos (mínimo 2, máximo 10)"),
    type: z.enum(["text", "image"]).describe('"text" si las tarjetas contienen texto, "image" si contienen imágenes'),
    gapStyle: z
      .enum(["opaque", "translucent", "invisible"])
      .describe("Estilo visual de los huecos: opaco, translúcido o no visible"),
    gapsItem: z.array(
      z.object({
        x: z.number().describe("Posición X del centro del hueco (porcentaje)"),
        y: z.number().describe("Posición Y del centro del hueco (porcentaje)"),
        text: z.string().nullable().describe("Texto de la tarjeta (si type es text)"),
        image: fileObject().describe("Imagen de la tarjeta (si type es image)")
      })
    )
  })
};

const activityDragAndDropCompleteImage = createComponentSchema(
  "activity-drag-and-drop-complete-image",
  activityDragAndDropImageAndGapsProps
);

const activityDragAndDropFillImage = createComponentSchema(
  "activity-drag-and-drop-fill-image",
  activityDragAndDropImageAndGapsProps
);

const activityFillImage = createComponentSchema("activity-fill-image", {
  imageFields: z.object({
    image: fileObject(),
    fieldsItem: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
        text: z.string().describe("Solución, contenido del hueco")
      })
    ),
    fieldsNumber: z.number().describe("Número de huecos")
  })
});

const mathValue = () =>
  z.object({
    value: z
      .number()
      .describe(
        'Valor numérico, siempre debe incuirse. En caso de ser el resultado, calcular a partir del resto de valores ("valuesItem" para sumas, restas y multiplicaciones, y "dividend" y "divisor" para divisiones'
      ),
    type: z
      .enum(["fixed", "editable"])
      .describe(
        '"fixed" indica que el valor es visible por todos los usuarios, proporcionado como un dato de la actividad. "editable" indica que el valor aparecera como un elemento a rellenar en la actividad'
      )
  });

const activityFillMath = createComponentSchema("activity-fill-math", {
  operation: z.object({
    type: z.enum(["addition", "subtraction", "multiplication", "division"]),
    valuesItem: z
      .array(mathValue())
      .describe(
        'Array de valores numéricos con los que operar, se usa para "addition", "subtraction" y "multiplication". Dejar vacío si es "division"'
      ),
    valuesNumber: z.number().describe('Cantidad de valores a sumar/restar/multiplicar. 0 si es "division"'),
    dividend: mathValue(),
    divisor: mathValue(),
    result: mathValue().describe("resultado de la operación"),
    layout: z.enum(["vertical", "horizontal"]).default("vertical").describe("Distribución de las operaciones")
  })
});

const activityFillMathMulti = createComponentSchema("activity-fill-math-multi", {
  operations: z.object({
    operationsItem: z
      .array(
        z.object({
          type: z.enum(["addition", "subtraction", "multiplication", "division"]),
          valuesItem: z
            .array(mathValue())
            .describe(
              'Array de valores numéricos con los que operar, se usa para "addition", "subtraction" y "multiplication". Dejar vacío si es "division"'
            ),
          valuesNumber: z.number().describe('Cantidad de valores a sumar/restar/multiplicar. 0 si es "division"'),
          dividend: mathValue(),
          divisor: mathValue(),
          result: mathValue().describe("resultado de la operación")
        })
      )
      .describe("Array de operaciones matemáticas"),
    operationsNumber: z.number().describe("Cantidad de operaciones"),
    layout: z.enum(["vertical", "horizontal"]).default("vertical").describe("Distribución de las operaciones")
  })
});

const linkCards = () =>
  z.object({
    cardsItem: z.array(
      z.object({
        content: z.string().describe("Texto de la tarjeta"),
        correct: z.number().describe("Índice del hueco al que debe arrastrarse"),
        image: fileObject(),
        fit: z.enum(["cover"]).optional().nullable().describe("Encaje de la imagen, en caso de haberla"),
        audio: fileObject(),
        type: z.enum(["text", "image", "image-text", "audio", "image-audio"])
      })
    ),
    cardsNumber: z.number().describe("Cantidad de tarjetas")
  });

const linkGaps = () =>
  z
    .object({
      gapsItem: z.array(
        z.object({
          content: z.string(),
          fit: z.enum(["cover"]).optional().nullable().describe("Encaje de la imagen, en caso de haberla"),
          image: fileObject(),
          audio: fileObject(),
          type: z.enum(["text", "image", "image-text", "audio", "image-audio"]).optional().nullable()
        })
      ),
      gapsNumber: z.number().describe("Cantidad de huecos")
    })
    .describe("Huecos de la actividad, actúan como droppable");

const activityLinkH = createComponentSchema("activity-link-h", {
  structure: z
    .object({
      gaps: linkGaps(),
      cards: linkCards().describe("Tarjetas de la primera columna (inicio de la relación). Siempre obligatoria"),
      cardsBottom: linkCards().describe("Tarjetas de la última columna (fin de la relación). Pueden estar vacías."),
      rows: z.number().int().min(2).max(3).describe("2 si no hay cardsBottom, 3 si sí las hay")
    })
    .describe("Estructura de la actividad, contiene cards (draggables) y gaps (droppables)")
});

const activityLinkV = createComponentSchema("activity-link-v", {
  structure: z
    .object({
      gaps: linkGaps(),
      cards: linkCards().describe("Tarjetas de la primera columna (inicio de la relación). Siempre obligatoria"),
      cardsRight: linkCards().describe("Tarjetas de la última columna (fin de la relación). Pueden estar vacías."),
      columns: z.number().int().min(2).max(3).describe("2 si no hay cardRight, 3 si sí las hay")
    })
    .describe("Estructura de la actividad, contiene cards (draggables) y gaps (droppables)")
});

const activityOrder = createComponentSchema("activity-order", {
  elements: z.object({
    elementsItem: z
      .array(
        z.object({
          text: z.string().describe("Contenido del elemento a ordenar"),
          image: fileObject(),
          initialPosition: z.number().describe("Posición en la que se le presenta al usuario originalmente"),
          finalPosition: z.number().describe("Posición correcta, en la que debería estar")
        })
      )
      .describe("Elementos a ordenar"),
    elementsNumber: z.number().describe("Cantidad de elementos a ordenar"),
    type: z.enum(["phrases", "words", "image", "image-text"])
  })
});

const activitySendFile = createComponentSchema("activity-send-file", {
  comments: z.object({
    propActive: z.boolean().describe("True si hay comentarios"),
    characterLimit: z.number().describe("Límite de caracteres")
  }),
  solution: z.object({
    propActive: z.boolean().describe("True si hay solución"),
    file: fileObject(),
    comments: z.string().describe("Comentarios de la solución")
  })
});

const imageGallery = createComponentSchema("step-by-step", {
  steps: z.object({
    stepsItem: z.array(
      z.object({
        content: z.string(),
        propIndex: z.number().describe("Posición del step (index + 1)"),
        buttonLink: z.object({
          propActive: z.boolean().describe("True si hay botón con enlace"),
          link: z.string(),
          text: z.string().describe("Texto a mostrar en el botón")
        }),
        buttonFile: z.object({
          propActive: z.boolean().describe("True si hay botón con archivo de descarga"),
          file: z.string().describe("Identificador del archivo"),
          text: z.string().describe("Texto a mostrar en el botón")
        }),
        id: z.string().describe("Identificador del paso")
      })
    ),
    stepsNumber: z.number().describe("Número de pasos")
  })
});

const activityCrossword = createComponentSchema("activity-crossword", {
  words: z
    .object({
      wordsItem: z
        .array(
          z.object({
            word: z.string(),
            definition: z.string(),
            position: z
              .object({
                row: z.number(),
                column: z.number()
              })
              .describe("Posición de la primera letra de la palabra"),
            direction: z.enum(["horizontal", "vertical"])
          })
        )
        .describe("Array de palabras"),
      wordCount: z.number().describe("Cantidad de palabras")
    })
    .describe("Estructura de las palabras del crucigrama, contiene wordsItem y wordCount")
});

const activityStackedWords = createComponentSchema("activity-stacked-words", {
  words: z
    .object({
      wordsItem: z
        .array(
          z.object({
            word: z.string(),
            definition: z.string(),
            position: z
              .object({
                row: z.number(),
                column: z.number()
              })
              .describe("Posición de la primera letra de la palabra"),
            direction: z.enum(["horizontal", "vertical"])
          })
        )
        .describe("Array de palabras"),
      wordCount: z.number().describe("Cantidad de palabras")
    })
    .describe("Estructura de las palabras apiladas, contiene wordsItem y wordCount")
});

const generateWordSearchGrid = (
  size: number,
  words: {
    word?: string;
    position?: { row?: number; column?: number } | null;
    direction?: "horizontal" | "vertical" | "diagonal-down" | "diagonal-up";
    reverse?: boolean | null;
  }[]
): string[][] => {
  // Initialize with random letters
  const grid: string[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
  );

  words.forEach(wordItem => {
    const { position, word, direction } = wordItem;
    if (!position || typeof position.row !== "number" || typeof position.column !== "number" || !word || !direction) {
      return;
    }

    const { row, column } = position;
    const { reverse } = wordItem;
    const chars = word.split("");

    // Calculate direction vector based on direction and reverse
    let dr = 0;
    let dc = 0;

    switch (direction) {
      case "horizontal":
        // normal: left to right (dc=1), reversed: right to left (dc=-1)
        dr = 0;
        dc = reverse ? -1 : 1;
        break;
      case "vertical":
        // normal: top to bottom (dr=1), reversed: bottom to top (dr=-1)
        dr = reverse ? -1 : 1;
        dc = 0;
        break;
      case "diagonal-down":
        // normal: top-left to bottom-right (dr=1, dc=1)
        // reversed: top-right to bottom-left (dr=1, dc=-1)
        dr = 1;
        dc = reverse ? -1 : 1;
        break;
      case "diagonal-up":
        // normal: bottom-left to top-right (dr=-1, dc=1)
        // reversed: bottom-right to top-left (dr=-1, dc=-1)
        dr = -1;
        dc = reverse ? -1 : 1;
        break;
    }

    let r = row;
    let c = column;

    chars.forEach(char => {
      if (r >= 0 && r < size && c >= 0 && c < size) {
        grid[r][c] = char.toUpperCase();
      }
      r += dr;
      c += dc;
    });
  });

  return grid;
};

const activityWordSearchBase = createComponentSchema("activity-word-search", {
  letters: z
    .array(z.array(z.string()))
    .describe(
      "Matriz de NxN letras (donde N es gridSize). Debe incluir OBLIGATORIAMENTE las palabras de 'wordsItem' en sus posiciones correctas, rodeadas de letras aleatorias."
    ),
  words: z
    .object({
      gridSize: z.number().describe("Tamaño de la cuadrícula (ej. 10 para 10x10)."),
      wordsItem: z
        .array(
          z.object({
            word: z.string().describe("Palabra oculta"),
            position: z
              .object({
                row: z.number(),
                column: z.number()
              })
              .describe("Fila y columna de la primera letra (0-based)")
              .optional()
              .nullable(),
            direction: z
              .enum(["horizontal", "vertical", "diagonal-down", "diagonal-up"])
              .describe("Dirección de la palabra"),
            reverse: z.boolean().optional().nullable().describe("Indica si la palabra está invertida")
          })
        )
        .describe("Lista de palabras con sus coordenadas exactas en la matriz 'letters'."),
      wordCount: z.number().describe("Total de palabras")
    })
    .describe("Configuración completa del juego. Las posiciones deben coincidir con 'letters'.")
    .describe("Configuración completa del juego. Las posiciones deben coincidir con 'letters'.")
    .describe("Configuración completa del juego. Las posiciones deben coincidir con 'letters'.")
});

const activityWordSearchFull = activityWordSearchBase.full.transform(data => {
  const { letters, words } = data.componentData.props;
  // If letters matrix is empty or has empty rows (AI skipped generation due to Aleatorio: sí)
  // or if it's explicitly requested (we can assume empty array implies we need to generate it)
  if (!letters || letters.length === 0 || (letters.length > 0 && letters[0].length === 0)) {
    const generatedLetters = generateWordSearchGrid(words.gridSize, words.wordsItem);
    return {
      ...data,
      componentData: {
        ...data.componentData,
        props: {
          ...data.componentData.props,
          letters: generatedLetters
        }
      }
    };
  }
  return data;
});

/** Nested items use base shapes (no grid auto-fill); top-level uses `full` with transform. */
const activityWordSearch: ActivityComponentSchemaPair = {
  full: activityWordSearchFull,
  componentData: activityWordSearchBase.componentData,
  activityProps: activityWordSearchBase.activityProps
};

const activityAnswerOpenWithAudio = createComponentSchema("activity-answer-open-with-audio", {
  answer: z.object({
    maxAudioDuration: z.number().default(10),
    allowTextAnswer: z.boolean().default(false)
  }),
  solution: z
    .object({
      propActive: z.boolean().default(false).describe("Determina si hay una solución especificada o no"),
      // Backward compatibility
      content: z.string().default(""),
      image: z
        .object({
          propActive: z.boolean().default(false),
          image: z
            .object({
              id: z.string().nullable().optional(),
              filename: z.string().nullable().optional(),
              url: z.string().nullable().optional()
            })
            .nullable()
            .optional()
        })
        .default({ propActive: false, image: null }),
      text: z
        .object({
          propActive: z.boolean().default(false),
          content: z.string().default("")
        })
        .default({ propActive: false, content: "" })
    })
    .describe("Posible solución aportada")
});

const activityDictation = createComponentSchema("activity-dictation", {
  content: z.object({
    text: z.object({
      content: z.string(),
      isVisible: z
        .boolean()
        .describe("Indica si el texto proporcionado es visible para el estudiante. False por defecto.")
    }),
    audio: z.object({
      fileOne: fileObject(),
      fileTwo: fileObject()
    })
  }),
  solution: z
    .object({
      propActive: z.boolean().default(false).describe("Determina si hay una solución especificada o no"),
      content: z.string().default(""),
      image: z
        .object({
          propActive: z.boolean().default(false),
          image: z
            .object({
              id: z.string().nullable().optional(),
              filename: z.string().nullable().optional(),
              url: z.string().nullable().optional()
            })
            .nullable()
            .optional()
        })
        .default({ propActive: false, image: null }),
      text: z
        .object({
          propActive: z.boolean().default(false),
          content: z.string().default("")
        })
        .default({ propActive: false, content: "" })
    })
    .describe("Posible solución aportada")
});

const activityDictationAutoevaluated = createComponentSchema("activity-dictation-autoevaluated", {
  configuration: z.object({
    evaluable: z.enum(["auto"]).default("auto"),
    attempts: z.number().min(0).max(10).default(0)
  }),
  content: z.object({
    text: z.object({
      content: z.string(),
      isVisible: z
        .boolean()
        .describe("Indica si el texto proporcionado es visible para el estudiante. False por defecto.")
    }),
    audio: z.object({
      fileOne: fileObject(),
      fileTwo: fileObject()
    })
  })
});

const activityTrueFalse = createComponentSchema("activity-true-false", {
  contentQA: z.object({
    answerOne: z.string().describe("Posible primera respuesta a las preguntas, puede estar vacío"),
    answerTwo: z.string().describe("Segunda posible respuesta a las preguntas, puede estar vacío"),
    questionsItem: z.array(
      z.object({
        content: z.string(),
        answer: z
          .enum(["answerOne", "answerTwo"])
          .describe(
            "Representa cual de las dos posibles respuestas es la correcta. Si no hay respuesta correcta especificada, entender answerOne como verdadero y answerTwo como falso"
          )
      })
    ),
    questionsNumber: z.number().describe("Cantidad de preguntas, questionsItem.length"),
    questionsAlign: z.enum(["vertical", "horizontal"]).describe("Alineación de las preguntas")
  })
});

const timeUnit = () => z.enum(["seg", "min"]).describe("Unidad de tiempo: segundos o minutos");
const timeValue = () =>
  z.object({
    value: z.number().describe("Valor numérico del tiempo"),
    unit: timeUnit()
  });

const activityTimedReadingPair = createComponentSchema("activity-timed-reading", {
  content: z.object({
    text: z.object({
      content: z.string().describe("Texto a mostrar en la actividad de lectura cronometrada")
    }),
    time: z.object({
      enableTimeLimit: z.boolean().describe("Indica si hay límite de tiempo"),
      minTime: timeValue().nullable().describe("Tiempo mínimo permitido (opcional)"),
      maxTime: timeValue().nullable().describe("Tiempo máximo permitido (opcional)")
    }),
    recorder: z
      .object({
        enabled: z.boolean().describe("Indica si el grabador está habilitado"),
        required: z.boolean().describe("Indica si la grabación es obligatoria"),
        limit: timeValue().nullable().describe("Límite de tiempo para la grabación (opcional)")
      })
      .describe("Opciones de grabación de audio (opcional)")
  }),
  solution: z
    .object({
      propActive: z.boolean().optional().nullable(),
      image: z
        .object({
          propActive: z.boolean().optional().nullable(),
          url: z.string().optional().nullable(),
          alt: z.string().optional().nullable()
        })
        .optional()
        .nullable(),
      text: z
        .object({
          propActive: z.boolean().optional().nullable(),
          content: z.string().optional().nullable()
        })
        .optional()
        .nullable()
    })
    .optional()
    .nullable()
    .describe("Solución recomendada con imagen y/o texto")
});

const activityTimedReading = {
  full: activityTimedReadingPair.full.superRefine((data, ctx) => {
    validateTimedReadingMinMaxTime(data?.componentData?.props?.content?.time, ctx, [
      "componentData",
      "props",
      "content",
      "time",
      "minTime"
    ]);
  }),
  componentData: activityTimedReadingPair.componentData.superRefine((data, ctx) => {
    validateTimedReadingMinMaxTime(data?.props?.content?.time, ctx, ["props", "content", "time", "minTime"]);
  }),
  activityProps: activityTimedReadingPair.activityProps.superRefine((data, ctx) => {
    validateTimedReadingMinMaxTime(data?.content?.time, ctx, ["content", "time", "minTime"]);
  })
};

const activityMemory = createComponentSchema("activity-memory", {
  structure: z.object({
    groupSize: z.number().int().min(2).max(4),
    groupsNumber: z.number(),
    groupsItem: z.array(
      z.object({
        cards: z
          .array(
            z.object({
              type: z.enum(["text", "image", "image-text"]),
              sameImage: z
                .boolean()
                .describe("Indica si las cartas de un grupo utilizan la misma imagen o si son diferentes"),
              text: z.string(),
              image: fileObject()
            })
          )
          .describe("Cartas que pertenecen al mismo grupo, de modo que para solucionar la actividad deben unirse")
      })
    )
  })
});

const ActivityMark = createComponentSchema("activity-mark", {
  content: z.object({
    text: z
      .string()
      .describe(
        "Texto donde las palabras correctas están marcadas con @@palabra@@. Ejemplo: 'El perro @@blanco@@ corre rápido'"
      )
  }),
  position: z
    .object({
      layout: z.enum(["vertical", "horizontal"]).optional().nullable().describe("Disposición del texto"),
      align: z.enum(["left", "center", "right"]).optional().nullable().describe("Alineación del texto")
    })
    .optional()
    .nullable()
});

const activitySyntacticAnalysis = createComponentSchema("activity-syntactic-analysis", {
  content: z.object({
    sentence: z.string().describe("Frase completa a analizar"),
    numberOfLevels: z.number().describe("Cantidad de niveles"),
    levels: z.array(
      z.object({
        id: z.string().describe("Id único del nivel"),
        optionsText: z.string().optional().nullable().describe("Todas las opciones de texto para el nivel"),
        options: z
          .array(z.string())
          .describe('Opciones para el nivel, es equivalente a hacer un split por "," de optionsText')
      })
    ),
    groups: z
      .array(
        z.object({
          id: z.string().describe("Id único del grupo"),
          levelId: z.string().describe("Id del nivel al que pertenece"),
          startIndex: z
            .number()
            .describe(
              "Índice del primer caracter del grupo en la oración, no cuentes espacios en blanco al principio del grupo"
            ),
          endIndex: z
            .number()
            .describe(
              "Índice del último caracter del grupo en la oración, no cuentes espacios en blanco al final del grupo"
            ),
          selectedOption: z.string().describe("Opción (exclusivamente de entre options) correcta para el grupo")
        })
      )
      .describe(
        "Grupos que forman la actividad, cada grupo tiene un nivel y un rango de indices para seleccionar la opción correcta. Los grupos vienen definidos como texto entre paréntesis o corchetes en la oración."
      )
  })
});

const activityDraw = createComponentSchema("activity-draw", {
  background: z.object({
    image: fileObject()
  }),
  solution: z.object({
    image: z.object({
      propActive: z.boolean().optional().nullable(),
      image: fileObject()
    }),
    text: z.object({
      propActive: z.boolean().optional().nullable(),
      content: z.string()
    })
  })
});

// function activityRootPropsShape(schema: z.ZodTypeAny) {
//   return (schema as z.ZodObject<{ componentData: z.ZodObject<{ props: z.ZodTypeAny }> }>).shape.componentData.shape
//     .props;
// }

/** Leaf pairs — `as const` only so tuple `[0]` stays a literal union (needed for `Extract` / infer helpers). */
export const activitySchemaPairs = [
  ["activity-answer-open-with-audio", activityAnswerOpenWithAudio],
  ["activity-fill-text", activityFillText],
  ["activity-fill-text-deliverable", activityFillTextDeliverable],
  ["activity-answer-open", activityAnswerOpen],
  ["activity-answer-exact", activityAnswerExact],
  ["activity-answer-with-numbers", activityAnswerWithNumbers],
  ["activity-stacked-words", activityStackedWords],
  ["activity-crossword", activityCrossword],
  ["activity-dictation", activityDictation],
  ["activity-dictation-autoevaluated", activityDictationAutoevaluated],
  ["activity-drag-and-drop-classify", activityDragAndDropClassify],
  ["activity-drag-and-drop-text", activityDragAndDropText],
  ["activity-drag-and-drop", activityDragAndDrop],
  ["activity-dropdown-image", activityDropdownImage],
  ["activity-drag-and-drop-image", activityDragAndDropImage],
  ["activity-drag-and-drop-complete-image", activityDragAndDropCompleteImage],
  ["activity-drag-and-drop-fill-image", activityDragAndDropFillImage],
  ["activity-dropdown", activityDropdown],
  ["activity-fill-image", activityFillImage],
  ["activity-fill-math", activityFillMath],
  ["activity-fill-math-multi", activityFillMathMulti],
  ["activity-link-h", activityLinkH],
  ["activity-link-v", activityLinkV],
  ["activity-syntactic-analysis", activitySyntacticAnalysis],
  ["activity-mark", ActivityMark],
  ["activity-order", activityOrder],
  ["activity-send-file", activitySendFile],
  ["activity-test", activityTest],
  ["activity-true-false", activityTrueFalse],
  ["activity-timed-reading", activityTimedReading],
  ["activity-word-search", activityWordSearch],
  ["activity-memory", activityMemory],
  ["activity-draw", activityDraw]
] as const;

export type LeafActivityType = (typeof activitySchemaPairs)[number][0];

export type LeafActivitySchemaPair<T extends LeafActivityType> = Extract<
  (typeof activitySchemaPairs)[number],
  readonly [T, unknown]
>[1];

/** Inferred output of the root `full` Zod schema for a leaf activity. */
export type LeafActivityPayload<T extends LeafActivityType> = z.infer<LeafActivitySchemaPair<T>["full"]>;

export type InferredLeafActivityPayload<T extends LeafActivityType> = LeafActivityPayload<T>;

export type LeafActivityComponentData<T extends LeafActivityType> = z.infer<
  LeafActivitySchemaPair<T>["componentData"]
>;

export type LeafActivityProps<T extends LeafActivityType> = z.infer<LeafActivitySchemaPair<T>["activityProps"]>;

export type ActivitySchemaPairMap = {
  [Entry in (typeof activitySchemaPairs)[number] as Entry[0]]: Entry[1];
};

export const activityComponentSchemas = Object.fromEntries(activitySchemaPairs) as ActivitySchemaPairMap;

const activitySchemas = activitySchemaPairs.map(([type, pair]) => [type, pair.full] as const) as readonly (readonly [
  LeafActivityType,
  ZodType
])[];

const nestedActivityItemSchema = z.discriminatedUnion(
  "type",
  activitySchemaPairs.map(([activityType, pair]) =>
    z.object({
      propIndex: z.number().describe("Índice de la actividad dentro del contenedor"),
      id: z.string().describe("Identificador único de la actividad anidada"),
      name: z.string().describe("Nombre o título corto de la actividad anidada"),
      type: z.literal(activityType),
      props: pair.activityProps
    })
  ) as unknown as [z.ZodDiscriminatedUnionOption<"type">, ...z.ZodDiscriminatedUnionOption<"type">[]]
);

const activityGroup = createComponentSchema("activity-group", {
  contentActivities: z.object({
    activitiesNumber: z.number().describe("Número de actividades anidadas"),
    activitiesItem: z
      .array(nestedActivityItemSchema)
      .describe("Solo actividades hoja; no anidar activity-group ni activity-sequence")
  })
});

const activitySequence = createComponentSchema("activity-sequence", {
  contentActivities: z.object({
    activitiesNumber: z.number().describe("Número de actividades anidadas"),
    activitiesItem: z
      .array(nestedActivityItemSchema)
      .describe("Solo actividades hoja; no anidar activity-group ni activity-sequence"),
    solveInOrder: z.boolean().describe("Si el alumno debe completar las actividades en el orden dado")
  })
});

export type ContainerActivityType = "activity-group" | "activity-sequence";
export type ImageGalleryType = "image-gallery";

/** Root activity component types (leaf activities plus structural containers). */
export type ActivityRootType = LeafActivityType | ContainerActivityType;

export type ExerciseRootActivityType = ActivityRootType;

export type InferredContainerActivityPayload<T extends ContainerActivityType> = T extends "activity-group"
  ? z.infer<(typeof activityGroup)["full"]>
  : z.infer<(typeof activitySequence)["full"]>;

export const schemas = [
  ...activitySchemas,
  ["activity-group", activityGroup.full],
  ["activity-sequence", activitySequence.full],
  ["image-gallery", imageGallery.full]
] as const satisfies readonly (readonly [ComponentType, ZodType])[];

/** Tuple member type for pairing activity type string with its Zod schema (for `z.infer` / narrowing). */
export type ComponentType = LeafActivityType | ContainerActivityType | ImageGalleryType;

export type ComponentSchema<T extends ComponentType> = T extends LeafActivityType
  ? LeafActivitySchemaPair<T>["full"]
  : T extends "activity-group"
    ? (typeof activityGroup)["full"]
    : T extends "activity-sequence"
      ? (typeof activitySequence)["full"]
      : (typeof imageGallery)["full"];

export type ComponentSchemaEntry = {
  [T in ComponentType]: readonly [T, ComponentSchema<T>];
}[ComponentType];

export type ComponentSchemaMap = {
  [T in ComponentType]: ComponentSchema<T>;
};

export type ActivityPayloadByType = {
  [T in ComponentType]: z.infer<ComponentSchema<T>>;
};

export type ActivityPayload<T extends ComponentType> = ActivityPayloadByType[T];

export type AnyActivityPayload = ActivityPayloadByType[ComponentType];

export const componentSchemas = Object.fromEntries(schemas.map(([type, schema]) => [type, schema])) as ComponentSchemaMap;

export const zodSchemas = componentSchemas;
