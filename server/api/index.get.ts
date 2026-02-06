import { PipelineStage } from "mongoose";
import { useMongo } from "../database";
import { Area } from "../models/Area";

function normalizeText(value: string): string {
  return value
    .normalize("NFD") // sépare accents
    .replace(/[\u0300-\u036f]/g, "") // supprime accents
    .toLowerCase()
    .trim();
}

export default defineEventHandler(async (event) => {
  await useMongo();

  const aggregate: PipelineStage[] = [
    { $addFields: { fullNameNormalized: { $toLower: "$fullName" } } },
  ];

  const query = getQuery(event);
  const search = query.q as string | undefined;
  if (search) {
    const normalized = normalizeText(search);
    aggregate.push({ $match: { fullNameNormalized: { $regex: normalized } } });
  }

  aggregate.push({ $limit: 20 });

  const areas = await Area.aggregate(aggregate);

  return areas;
});
