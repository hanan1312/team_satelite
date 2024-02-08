import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getQSParamFromURL(
  key: string,
  url: string | undefined
): string | null {
  if (!url) return "";
  const search = new URL(url).search;
  const urlParams = new URLSearchParams(search);
  return urlParams.get(key);
}

export function constructS3Url(path, name) {
  const testBucketName = "rfims-ml-addson";
  const liveBucketName = "rfims-prototype";

  const baseUrl = `https://s3.us-east-1.amazonaws.com/${testBucketName}/stand_alone/`;

  const middle = "/localized_processed/";

  const ext = ".png";

  // return baseUrl + path + middle + path + name + ext;

  return "/example.jpeg";
}

export function constructMainEC2Url(path, name) {
  const middle = "level0";

  const ext = "_with_localization.png";

  console.log("path", path, "name", name);

  // remove the last / from path

  // path = path.substring(0, path.length - 1);

  // remove the first part of the path

  // path = path.replace("project/img_class_loc", ``);

  // remove the first / from path

  // path = path.substring(1, path.length);

  let processedPath =
    "/api/assets?path=" +
    path.replace(name, `${name}/localized_processed/${name}${ext}`);

  // processedPath = processedPath.substring(1, path.length);

  // processedPath = "" + processedPath;

  return processedPath;

  // return baseUrl + path + middle + path + name + ext;

  // return "/example.jpeg";
}
export function constructSubEC2Url(path, name, height = 0, width = 0) {
  // const middle = "level0";

  const ext = "_processed_with_localization.png";

  // console.log("path", path, "name", name);

  // remove the last / from path

  // path = path.substring(0, path.length - 1);

  // remove the first part of the path

  // path = path.replace("project/img_class_loc", ``);

  // remove the first / from path

  // path = path.substring(1, path.length);

  let processedPath =
    "/api/assets?path=" +
    path.replace(
      name,
      `${name}/localized_processed/${name}_${height}_${width}${ext}`
    );

  return processedPath;

  // return baseUrl + path + middle + path + name + ext;

  // return "/example.jpeg";
}
