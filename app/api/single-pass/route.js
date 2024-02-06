import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

import { getQSParamFromURL } from "../../../lib/utils";

const prisma = new PrismaClient();

const pageSize = 100;

async function getSatName() {
return await prisma.$queryRaw`select station,count(Pass_ID)from stand_alone.ml_localization_rf_events group by station`
}

// async function getSatName() {
//   return await prisma.$queryRaw`
//     SELECT station, COUNT(DISTINCT Pass_ID) AS count
//     FROM stand_alone.ml_localization_rf_events
//     GROUP BY station
//   `;
// }
// async function getPassId() {
// return await prisma.$queryRaw`select  Pass_ID from stand_alone.ml_localization_rf_events  where station="table_mountain" and sat_name="NOAA18"`
// }

async function getSatNameByStation() {
  const uniqueStationsResult = await prisma.$queryRaw`
    SELECT DISTINCT station
    FROM stand_alone.ml_localization_rf_events
  `;
  return uniqueStationsResult;

  const uniqueStations = uniqueStationsResult.map((row) => row.station);

  const promises = uniqueStations.map(async (station) => {
    const result = await prisma.$queryRaw`
      SELECT sat_name
      FROM stand_alone.ml_localization_rf_events
      WHERE station = ${station}
    `;
    return { station, satName: result.map((row) => row.sat_name) };
  });

  return Promise.all(promises);
}

async function getDataByPassId(passId, callback) {
  return await prisma.$queryRaw `SELECT image_name FROM stand_alone.ml_localization_rf_events WHERE Pass_ID = ?`, [passId], function (error, results, fields) {
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


// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { NextApiRequest, NextApiResponse } from "next";

// const prisma = new PrismaClient();
// const pageSize = 100;

// async function getSatName() {
//   return await prisma.$queryRaw`select station,count(Pass_ID)from stand_alone.ml_localization_rf_events group by station`;
// }

// async function getPassId(station, satName) {
//   return await prisma.$queryRaw`select  Pass_ID from stand_alone.ml_localization_rf_events  where station=${station} and sat_name=${satName}`;
// }

// async function getDataByPassId(passId, callback) {
//   return await prisma.$queryRaw `SELECT image_name FROM stand_alone.ml_localization_rf_events WHERE Pass_ID = ?`, [passId], function (error, results, fields) {
//     if (error) throw error;
//     callback(results);
//   }
// }

// async function fetchDataCountAndData(params) {
//   const [count, data] = await prisma.$transaction([
//     prisma.ml_localization_rf_events.count(params),
//     prisma.ml_localization_rf_events.findMany(params),
//   ]);

//   return { count, data };
// }

// export async function GET(req, res) {
//   const passId = [getQSParamFromURL("Pass_ID", req.url)];

//   const { count, data } = await fetchDataCountAndData({
//     where: {
//       Pass_ID: {
//         in: passId,
//       },
//     },
//   });

//   const responseData = {
//     count,
//     data,
//   };

//   return NextResponse.json({
//     data: responseData,
//   });
// }

// export async function POST(req, res) {
//   const passId = [getQSParamFromURL("Pass_ID", req.url)];

//   const startDateParam = getQSParamFromURL("startDate", req.url);
//   const endDateParam = getQSParamFromURL("endDate", req.url);

//   const startTime = startDateParam
//     ? startDateParam
//     : new Date("1999-01-01").toISOString();
//   const endTime = endDateParam
//     ? endDateParam
//     : new Date("2100-12-31").toISOString();

//   const squares = req.body.selectedSquares;
//   const event_type = req.body.event_type;
//   const has_error = req.body.has_error;

//   const { count, data } = await fetchDataCountAndData({
//     where: {
//       Pass_ID: {
//         in: passId,
//       },
//       AND: [
//         {
//           error_start_time: {
//             gte: startTime,
//           },
//         },
//         {
//           error_end_time: {
//             lte: endTime,
//           },
//         },
//         {
//           Error_Source: event_type !== "all" ? event_type : undefined,
//         },
//         {
//           has_error: has_error !== "all" ? has_error === "true" : undefined,
//         },
//         {
//           OR: squares.map((square) => ({
//             AND: [{ sub_img_loc_w: square.x }, { sub_img_loc_h: square.y }],
//           })),
//         },
//       ],
//     },
//   });

//   const responseData = {
//     count,
//     data,
//   };

//   return NextResponse.json({
//     data: responseData,
//   });
// }


