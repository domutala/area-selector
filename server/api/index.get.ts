import { PipelineStage } from "mongoose";
import { useMongo } from "../database";
import { Area } from "../models/Area";

function buildFullNameTokens() {
  return {
    $map: {
      input: {
        $split: [
          {
            $toLower: {
              $replaceAll: {
                input: {
                  $replaceAll: {
                    input: {
                      $replaceAll: {
                        input: {
                          $replaceAll: {
                            input: {
                              $replaceAll: {
                                input: {
                                  $replaceAll: {
                                    input: "$fullName",
                                    find: " ",
                                    replacement: "",
                                  },
                                },
                                find: ";",
                                replacement: "",
                              },
                            },
                            find: "_",
                            replacement: "",
                          },
                        },
                        find: "-",
                        replacement: "",
                      },
                    },
                    find: ".",
                    replacement: "",
                  },
                },
                find: " ",
                replacement: ",",
              },
            },
          },
          ",",
        ],
      },
      as: "token",
      in: { $trim: { input: "$$token" } },
    },
  };
}

function buildSearchTokens(value: string): string[] {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\-;]/g, "")
    .replace(/,/g, " ")
    .toLowerCase()
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean);
}

function buildTokenMatch(tokens: string[]) {
  return {
    $expr: {
      $allElementsTrue: {
        $map: {
          input: tokens,
          as: "searchToken",
          in: {
            $anyElementTrue: {
              $map: {
                input: "$fullNameTokens",
                as: "dbToken",
                in: {
                  $regexMatch: {
                    input: "$$dbToken",
                    regex: "$$searchToken",
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

function buildScoreStage(tokens: string[]): PipelineStage.AddFields {
  return {
    $addFields: {
      score: {
        $sum: tokens.map((token) => ({
          $max: {
            $map: {
              input: "$fullNameTokens",
              as: "dbToken",
              in: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $regexMatch: {
                          input: "$$dbToken",
                          regex: `^${token}`,
                        },
                      },
                      then: 2,
                    },
                    {
                      case: {
                        $regexMatch: {
                          input: "$$dbToken",
                          regex: token,
                        },
                      },
                      then: 1,
                    },
                  ],
                  default: 0,
                },
              },
            },
          },
        })),
      },
    },
  };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default defineEventHandler(async (event) => {
  await useMongo();

  const query = getQuery<{ q?: string }>(event);

  const aggregate: PipelineStage[] = [];

  if (query.q) {
    const tokens = buildSearchTokens(escapeRegex(query.q));

    aggregate.push({
      $addFields: {
        fullNameTokens: buildFullNameTokens(),
      },
    });

    aggregate.push(buildScoreStage(tokens));

    aggregate.push({
      $match: {
        score: { $gt: 0 },
      },
    });

    aggregate.push({
      $sort: {
        score: -1,
        fullName: 1,
      },
    });
  }

  aggregate.push({ $limit: 8 });

  return Area.aggregate(aggregate);
});
