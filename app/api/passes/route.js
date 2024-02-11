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
  
  let has_error = getQSParamFromURL("has_error", req.url);

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
    prisma.ml_localization_rf_events.groupBy({
      by: ["Pass_ID","image_name","Pass_Date", "s3_path", "has_error","station"],
      skip: skip,
      take: pageSize,
      where: {
        sat_name: {
          equals: sat_name,
        },
        AND: [
          {
            OR: [
              {
                Pass_Date: {
                  gte: startTime,
                },
              },
              // {
              //   Pass_Date: null,
              // },
            ],
          },
          {
            OR: [
              {
                Pass_Date: {
                  lte: endTime,
                },
              },
              // {
              //   Pass_Date: null,
              // },
            ],
          },
          {
            has_error: has_error !== "all" ? has_error === "true" : undefined,
          },
        ],
      },
      orderBy: {
        Pass_Date: "desc",
      },
    }),
    prisma.ml_localization_rf_events.groupBy({
      by: [ "Pass_ID", "image_name","Pass_Date","s3_path",  "has_error","station"],
      where: {
        sat_name: {
          equals: sat_name,
        },
        AND: [
          {
            OR: [
              {
                Pass_Date: {
                  gte: startTime,
                },
              },
              // {
              //   Pass_Date: null,
              // },
            ],
          },
          {
            OR: [
              {
                Pass_Date: {
                  lte: endTime,
                },
              },
              // {
              //   Pass_Date: null,
              // },
            ],
          },
          {
            has_error: has_error !== "all" ? has_error === "true" : undefined,
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
