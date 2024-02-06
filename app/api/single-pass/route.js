import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import { getQSParamFromURL } from "../../../lib/utils";

const prisma = new PrismaClient();

const pageSize = 100;

async function getSatName() {
return await prisma.$queryRaw`select station,count(Pass_ID)from sys.ml_localization_rf_events group by station`
}

async function getDataByPassId(passId, callback) {
  return await prisma.$queryRaw `SELECT image_name FROM sys.ml_localization_rf_events WHERE Pass_ID = ?`, [passId], function (error, results, fields) {
     if (error) throw error;
     callback(results);
  }
}
 
export async function GET(req, res) {
  let skip = getQSParamFromURL("page", req.url)
    ? (getQSParamFromURL("page", req.url) - 1) * pageSize
    : 0;

  let imageNames = [getQSParamFromURL("image_name", req.url)];
  let passId = [getQSParamFromURL("Pass_ID", req.url)];

console.log(passId,'test pass Id')
  const trans = await prisma.$transaction([
    prisma.ml_localization_rf_events.count({
      where: {
        Pass_ID: {
          in: passId,
        }
      },
    }),

    prisma.ml_localization_rf_events.findMany({
      skip: skip,
      take: pageSize,
      where: {
        Pass_ID: {
          in: passId,
        }
      },
    }),
  ]);

 
  const data = {
    count: trans[0],
    data: trans[1],
  };

  
  return NextResponse.json({
    data,
  });

}



export async function POST(req, res) {
  const body = await req.json();
  // console.log(body);

  let skip = getQSParamFromURL("page", req.url)
    ? (getQSParamFromURL("page", req.url) - 1) * pageSize
    : 0;

  let imageNames = [getQSParamFromURL("image_name", req.url)];

  
  let passId = [getQSParamFromURL("Pass_ID", req.url)];

  console.log(passId, 'test pass Id')
  
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
  

  // console.log(body);

  const trans = await prisma.$transaction([
    prisma.ml_localization_rf_events.count({
      where: {
        Pass_ID: {
          in: passId,
        }
      ,
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
        Pass_ID: {
          in: passId,
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

  return NextResponse.json({
    data,
  });
}
