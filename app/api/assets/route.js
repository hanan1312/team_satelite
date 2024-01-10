import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

import { getQSParamFromURL } from "../../../lib/utils";

const prisma = new PrismaClient();

import { S3Client, GetObjectCommand, S3 } from "@aws-sdk/client-s3";

export async function GET(req, res) {
  const path = getQSParamFromURL("path", req.url);

  try {
    const command = new GetObjectCommand({
      // Bucket: "rfims-prototype",
      Bucket: "rfims-ml-addson",
      Key: path,
    });

    const client = new S3Client({
      region: "us-east-1",
    });

    const response = await client.send(command);

    return new NextResponse(response.Body, {
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse(`Error: ${error.message}`, {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: error.message,
        params: {
          path: path,
          command: {
            // Bucket: "rfims-prototype",
            Bucket: "rfims-ml-addson",
            Key: path,
          },
          client: {
            region: "us-east-1",
          },
        },
        awsError: error, // Include the actual error object from AWS
        stackTrace: error.stack, // Include the stack trace for debugging
      }),
    });
  }
}
