import { Types } from "mongoose";
import { Area } from "../models/Area";
import { useMongo } from "../database";

export default defineEventHandler(async (event) => {
  await useMongo();

  const idParam = getRouterParam(event, "id");

  // ✅ Validation présence
  if (!idParam) {
    throw createError({
      statusCode: 400,
      statusMessage: "Area id is required",
    });
  }

  // ✅ Conversion number sécurisée
  const id = Number(idParam);

  if (Number.isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Area id must be a number",
    });
  }

  // ✅ Recherche via champ métier
  const area = await Area.findOne({ id }).lean();

  if (!area) {
    throw createError({
      statusCode: 404,
      statusMessage: "Area not found",
    });
  }

  return area;
});
