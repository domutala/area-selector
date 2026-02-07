import { PipelineStage } from "mongoose";
import { useMongo } from "../database";
import { Area } from "../models/Area";

function normalizeText(value: string): string {
  return value
    .normalize("NFD") // sépare accents
    .replace(/[\u0300-\u036f]/g, "") // supprime accents
    .replace(/[\s,;_\-]/g, "") // espaces + , ; _ -
    .toLowerCase()
    .trim();
}

function buildReplacePipeline(field: string, chars: string[]) {
  return chars.reduceRight<any>((acc, char) => {
    return {
      $replaceAll: {
        input: acc,
        find: char,
        replacement: "",
      },
    };
  }, `$${field}`);
}

function normalizeAndSplit(value: string): string[] {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_;\-]/g, "")
    .replace(/[,]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
function buildNormalizedArray(field: string) {
  return {
    $filter: {
      input: {
        $split: [
          {
            $toLower: {
              $replaceAll: {
                input: `$${field}`,
                find: "-",
                replacement: " ",
              },
            },
          },
          " ",
        ],
      },
      as: "word",
      cond: { $ne: ["$$word", ""] },
    },
  };
}

export default defineEventHandler(async (event) => {
  await useMongo();

  const charsToRemove = [" ", ",", ";", "_", "-", "."];
  const aggregate: PipelineStage[] = [
    {
      $addFields: {
        fullNameNormalized: {
          $toLower: buildReplacePipeline("fullName", charsToRemove),
        },
      },
    },
  ];

  const query = getQuery<{
    q?: string;
    page?: string;
    pageSize?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    filterBy?: string;
  }>(event);

  if (query.q) {
    const normalized = normalizeText(query.q);
    // aggregate.push({
    //   $match: {
    //     fullNameNormalized: { $regex: normalized },
    //   },
    // });

    const tokens = normalizeAndSplit(query.q);
    aggregate.push({
      $addFields: {
        fullNameTokens: buildNormalizedArray("fullName"),
      },
    });
    aggregate.push({
      $match: {
        $expr: {
          $setIsSubset: [tokens, "$fullNameTokens"],
        },
      },
    });
  }

  const page = Number(query.page ?? 1);
  const pageSize = Number(query.pageSize ?? 8);
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 8);
  const offset = (safePage - 1) * safePageSize;
  const limit = safePageSize;

  const allowedSortFields = ["fullName"];
  const sortDirection = query.sortOrder === "asc" ? 1 : -1;
  const sortField = allowedSortFields.includes(query.sortBy ?? "")
    ? query.sortBy!
    : "fullName";

  aggregate.push({
    $facet: {
      data: [
        { $sort: { [sortField]: sortDirection } },
        { $skip: offset },
        { $limit: limit },
      ],
      meta: [{ $count: "total" }],
    },
  });

  const result = await Area.aggregate(aggregate);

  const data = result[0]?.data ?? [];
  const total = result[0]?.meta[0]?.total ?? 0;

  return {
    data,
    meta: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages: Math.ceil(total / safePageSize),
    },
  };
});
