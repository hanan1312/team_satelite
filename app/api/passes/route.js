import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

import { getQSParamFromURL } from "../../../lib/utils";

const prisma = new PrismaClient();

const pageSize = 100;

export async function GET(req, res) {
  let skip = getQSParamFromURL("page", req.url)
    ? (getQSParamFromURL("page", req.url) - 1) * pageSize
    : 0;

  let sat_name = getQSParamFromURL("sat_name", req.url);

  const today = new Date();

  let startTime =
    new Date(getQSParamFromURL("startTime", req.url)) ??
    new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
  let endTime = new Date(getQSParamFromURL("endTime", req.url));
  if (endTime) {
    endTime.setHours(23, 59, 59, 999);
  } else {
    endTime = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
    endTime.setHours(23, 59, 59, 999);
  }
  const trans = await prisma.$transaction([
    prisma.ml_localization.groupBy({
      by: ["image_name", "s3_path", "Pass_Date"],
      skip: skip,
      take: pageSize,
      where: {
        sat_name: {
          equals: sat_name,
        },
        AND: [
          {
            Pass_Date: {
              gte: startTime,
            },
          },
          {
            Pass_Date: {
              lte: endTime,
            },
          },
        ],
      },
      orderBy: {
        Pass_Date: "desc",
      },
    }),
    prisma.ml_localization.groupBy({
      by: ["image_name", "s3_path", "Pass_Date"],
      where: {
        sat_name: {
          equals: sat_name,
        },
        AND: [
          {
            Pass_Date: {
              gte: startTime,
            },
          },
          {
            Pass_Date: {
              lte: endTime,
            },
          },
        ],
      },
      orderBy: {
        Pass_Date: "desc",
      },
    }),
  ]);

  return NextResponse.json({
    count: trans[1].length,
    passes: trans[0],
  });
}
