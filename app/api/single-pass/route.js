import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import { getQSParamFromURL } from "../../../lib/utils";

const prisma = new PrismaClient();

const pageSize = 100;

export async function GET(req, res) {
  let skip = getQSParamFromURL("page", req.url)
    ? (getQSParamFromURL("page", req.url) - 1) * pageSize
    : 0;

  let imageNames = [getQSParamFromURL("image_name", req.url)];

  const trans = await prisma.$transaction([
    prisma.ml_localization_rf_events.count({
      where: {
        image_name: {
          in: imageNames,
        },
      },
    }),

    prisma.ml_localization_rf_events.findMany({
      skip: skip,
      take: pageSize,
      where: {
        image_name: {
          in: imageNames,
        },
      },
    }),
  ]);

  const data = {
    count: trans[0],
    data: trans[1],
  };

  // console.log(data.data);

  return NextResponse.json({
    data,
  });
}
export async function POST(req, res) {
  const body = await req.json();
  console.log(body);

  let skip = getQSParamFromURL("page", req.url)
    ? (getQSParamFromURL("page", req.url) - 1) * pageSize
    : 0;

  let imageNames = [getQSParamFromURL("image_name", req.url)];

  let startDateParam = getQSParamFromURL("startDate", req.url);
  let endDateParam = getQSParamFromURL("endDate", req.url);

  let startTime = startDateParam
    ? startDateParam
    : new Date("1999-01-01").toISOString();
  let endTime = endDateParam
    ? endDateParam
    : new Date("2100-12-31").toISOString();

  const squares = body.selectedSquares;

  const event_type = body.event_type;

  const has_error = body.has_error;

  console.log(body);

  const trans = await prisma.$transaction([
    prisma.ml_localization_rf_events.count({
      where: {
        image_name: {
          in: imageNames,
        },
        AND: [
          {
            error_start_time: {
              gte: startTime,
            },
          },
          {
            error_end_time: {
              lte: endTime,
            },
          },
          {
            Error_Source: event_type !== "all" ? event_type : undefined,
          },
          {
            has_error: has_error !== "all" ? has_error === "true" : undefined,
          },
          {
            OR: squares.map((square) => ({
              AND: [{ sub_img_loc_w: square.x }, { sub_img_loc_h: square.y }],
            })),
          },
        ],
      },
    }),

    prisma.ml_localization_rf_events.findMany({
      skip: skip,
      take: pageSize,
      where: {
        image_name: {
          in: imageNames,
        },
        AND: [
          {
            error_start_time: {
              gte: startTime,
            },
          },
          {
            error_end_time: {
              lte: endTime,
            },
          },
          {
            Error_Source: event_type !== "all" ? event_type : undefined,
          },
          {
            has_error: has_error !== "all" ? has_error === "true" : undefined,
          },
          {
            OR: squares.map((square) => ({
              AND: [{ sub_img_loc_w: square.x }, { sub_img_loc_h: square.y }],
            })),
          },
        ],
      },
    }),
  ]);

  const data = {
    count: trans[0],
    data: trans[1],
  };

  // console.log(data.data);

  return NextResponse.json({
    data,
  });
}
