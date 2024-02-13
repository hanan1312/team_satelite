import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

import { getQSParamFromURL } from "../../../lib/utils";

import moment from "moment";
const prisma = new PrismaClient();

const pageSize = 100;

// Helper function to get location data
async function getLocationData(location) {
  return await prisma.ml_localization_rf_events.groupBy({
    by: ["sat_name"],
    where: {
      station: location,
    },
    _count: {
      _all: true,
    },
  });
}


// Helper function to get satellite data
async function getSatData(satNames, location) {
  const findManyTransactions = satNames.map((sat_name) =>
    prisma.ml_localization_rf_events.findMany({
      where: {
        sat_name: sat_name,
        station: location,
      },
      orderBy: {
        Pass_Date: "desc",
      },
      take: 1,
    })
  );

  const groupByTransactions = satNames.map((sat_name) =>
    prisma.ml_localization_rf_events.groupBy({
      by: ["image_name", "s3_path", "Pass_Date","Pass_ID"],
      where: {
        sat_name: sat_name,
        station: location,
      },
    //   orderBy: {
    //     Pass_Date: "desc",
      // },
    })
  );

  const findManyResults = await Promise.all(findManyTransactions);
  const groupByResults = await Promise.all(groupByTransactions);


  return { findManyResults, groupByResults };
}

// Helper function to create satellite object
function createSatellite(e, locationData, groupByResult) {
  
  const locationDataItem = locationData.find(
    (item) => item.sat_name === e[0].sat_name
  );
  const numOfErrors = locationDataItem ? locationDataItem._count._all : 0;

  const numOfPasses = groupByResult.length ?? 0;
  

  return {
    id: e[0].sat_name,
    title: e[0].sat_name,
    description: e[0].Pass_Date
      ? "Last pass was " +
        moment(e[0].Pass_Date, "YYYY-MM-DD-HH:mm:ss").fromNow()
      : "No passes yet.",
    additional: `${numOfErrors} Error(s), ${numOfPasses} Pass(es)`,
    station:e[0].station
 
 
  };
}

async function getLocations() {
  return prisma.$queryRaw`SELECT distinct station FROM stand_alone.ml_localization_rf_events`
}
async function getErrors() {
  return prisma.$queryRaw`SELECT distinct station FROM stand_alone.ml_localization_rf_events`
}

export async function GET(req, res) {
  // let locations = getQSParamFromURL("locations", req.url).split(",");
  let response = {};
  let locations = await getLocations();
  console.log(locations, "locations, here >>>>>>>>")
  let locationNames=locations.map(e=>e.station)

  let locationPromises = locationNames.map(async (location) => {
    let locationData = await getLocationData(location);
    console.log(locationData, "locationData, here >>>>>>>>")
    let lastLocationDate = null;
    let satNames = locationData.map((item) => item.sat_name);
    let { findManyResults, groupByResults } = await getSatData(
      satNames,
      location
    );

    // console.log({ findManyResults, groupByResults });
    // let lastEntries = await Promise.all(satDataPromises);

    let satellites = findManyResults.map((e, i) => {
      const groupByResult = groupByResults[i];

      let satellite = createSatellite(e, locationData, groupByResult);
     
      if (
        !lastLocationDate ||
        moment(e[0].Pass_Date, "YYYY-MM-DD-HH:mm:ss").isAfter(lastLocationDate)
      ) {
        lastLocationDate = e[0].Pass_Date;
      }
      return satellite;
    });

    response[location] = {
      id: location,
      title: location,
      description: lastLocationDate
        ? "Last pass was " +
          moment(lastLocationDate, "YYYY-MM-DD-HH:mm:ss").fromNow()
        : "No passes yet.",
      additional: locationData.length + " Satellites",
      satellites,
    };
  });

  await Promise.all(locationPromises);

  return NextResponse.json({
    response,
  });
}
