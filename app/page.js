"use client";

import Image from "next/image";
import Steps from "./components/Steps";
import Locations from "./components/screens/Locations";
import Passes from "./components/screens/Passes";
import Satalites from "./components/screens/Satalites";
import Preview from "./components/screens/Preview";
import SingleError from "./components/screens/SingleError";
import { useState, useEffect, use } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [steps, setSteps] = useState([
    { id: "Step 1", name: "Select Location", breadcrumb: null },
    { id: "Step 2", name: "Select Satellite", breadcrumb: null },
    { id: "Step 3", name: "Select Pass", breadcrumb: null },
    { id: "Step 4", name: "Select Error", breadcrumb: null },
    { id: "Step 5", name: "Preview", breadcrumb: null },
  ]);
  const { data: session, status, error, isLoading } = useSession();

  const [activeStep, setActiveStep] = useState(0);

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);

  const [selectedSatelite, setSelectedSatelite] = useState(
    selectedLocation
    
  );

  const [selectedPass, setSelectedPass] = useState(null);

  const [selectedError, setSelectedError] = useState(null);

  const [initialLoading, setInitialLoading] = useState(false);
  const fetchLocationData = async () => {
    setInitialLoading(true);
    const baseUrl = "/api/locations";
    

    

    
    const url = new URL(baseUrl, document.baseURI);
    // url.search = new URLSearchParams(params).toString();

    const response = await fetch(url);
    if (response.ok) {
      // setData(await response.json());

      // await response.json then execute the following
      let locationData = await response.json();
      const dataArray = Object.entries(locationData.response).map(e=>e[1])
      console.log(locationData, dataArray, "here ###############")


      setLocations(dataArray);

      // setTimeout(() => {
      setSelectedLocation(dataArray[0]);

      // }, 100);
    }
    setInitialLoading(false);
  };

  useEffect(() => {
    fetchLocationData();
  }, []);

  useEffect(() => {
    let stepClone = [...steps];
    if (selectedLocation) {
      stepClone[0].breadcrumb = selectedLocation.title;
    
    }
    if (selectedSatelite) {
      stepClone[1].breadcrumb = selectedSatelite.title;
    }
    if (selectedPass) {
      stepClone[2].breadcrumb = selectedPass.s3_path;
    }
    if (selectedError) {
      stepClone[3].breadcrumb = selectedError.image_name;
    }
    setSteps(stepClone);
  }, [selectedLocation, selectedSatelite, selectedPass, selectedError]);

  const { push } = useRouter();

  // set the active step

  const onStepChange = (index) => {
    setActiveStep(index);
  };

  // next step
  const resetNextStepData = () => {

    setSelectedPass({});
  };

  const nextStep = () => {
    if (activeStep === 1) resetNextStepData();
    if (activeStep === steps.length - 1) return;
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // previous step

  const prevStep = () => {
    if (activeStep === 0) return;
    if (activeStep === 1) setSelectedLocation(locations[0]);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSelectedLocation = (location) => {
    setSelectedLocation(location);
  };

  const onSelectedSatelite = (satelite) => {
    setSelectedSatelite(satelite);
  };

  const onSelectedPass = (pass) => {
    setSelectedPass(pass);
    nextStep();
  };

  const onSelectedError = (error) => {
    setSelectedError(error);
    nextStep();
  };

  // get server side props
// console.log(selectedPass,'selectedPass')
  // display the current screen based on the active step
  const displayScreen = () => {
    switch (activeStep) {
      case 0:
        return (
          <Locations
            locations={locations}
            nextStep={nextStep}
            onSelectedLocation={onSelectedLocation}
          />
        );
      case 1:
        return (
          <Satalites
          satellites={selectedLocation.satellites}
          nextStep={nextStep}
          prevStep={prevStep}
          onSelectedSatelite={onSelectedSatelite}
        />
        );
      case 2:
        if (activeStep === 2) {
          return (
            <Passes
              satalite={selectedSatelite}
              station={selectedLocation.id}
              selectPass={onSelectedPass}
              prevStep={prevStep}
              satellites={selectedLocation.satellites}
            />
          );
        } else {
          return null;
        }
        // return (
        //   <Passes
        //   satalite={selectedSatelite}
        //   selectPass={onSelectedPass}
        //   prevStep={prevStep}
        //   satellites={selectedLocation.satellites}

        // />
        // );
      case 3:
        return (
          <Preview
          pass={selectedPass}
          prevStep={prevStep}
          selectError={onSelectedError}
          onSelectedLocation={onSelectedLocation}
            satellites={selectedLocation.satellites}
            selectedSatelite={selectedSatelite}
         
        />
        );
      case 4:
        return (
          <SingleError
            error={selectedError}
            prevStep={prevStep}
         
          />
        );
      default:
        return (
          <Locations
            locations={locations}
            nextStep={nextStep}
          />
        );
    }
  };
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  else
    return status == "unauthenticated" ? (
      // redirect to login page
      push("/api/auth/signin")
    ) : (
      // signIn()
      <main className="container flex flex-col items-center w-full min-h-screen gap-10 py-24">
        <Steps
          steps={steps}
          activeStep={activeStep}
          onStepChange={onStepChange}
        />

        {initialLoading ? (
          <div className="flex flex-col flex-1 w-full overflow-hidden bg-white divide-y divide-gray-200 rounded-lg shadow">
            <div className="flex w-full h-full p-10 space-x-4 bg-white animate-pulse">
              <div className="flex-1 py-1 space-y-4">
                <div className="w-3/4 h-12 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex-1 py-1 space-y-4">
                <div className="w-3/4 h-12 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          displayScreen()
        )}
      </main>
    );
}
