import axios from "axios";
import { builderFun } from "./helpers/builder.js";
import { restBaseUrl } from "./helpers/config.js";

let isBuilderRunning: boolean = false;

type pendingOrdersElement = {
  orderId: number;
  apkName: string;
  webLink: string;
  packageName: string;
  versionName: string;
  status: string;
  comment: string;
  iconBundleLink: string;
  googleJsonLink: string;
  onesignalAppId: string;
  apkLink: string;
  aabLink: string;
  updatedAt: number;
};

type pendingOrdersType = Array<pendingOrdersElement>;

let main = async () => {
  try {
    isBuilderRunning = true;
    let response = await axios.get(`${restBaseUrl}/getPendingOrders`);

    console.log(response.data);
    // return false;
    if (response.data.status == "success") {
      //new data variable
      let pendingOrders: pendingOrdersType = response.data.pendingOrders;

      if (pendingOrders.length > 0) {
        for (let i = 0; i < pendingOrders.length; i++) {
          let { orderId , webLink, iconBundleLink , apkName, googleJsonLink,onesignalAppId,packageName,versionName} =
            pendingOrders[i];
      
          let newApplicationId = packageName;

      

       

   
          let oneSignalAppId = onesignalAppId

          await builderFun(
            orderId,
         
            newApplicationId,
   
            apkName,
            versionName,
            googleJsonLink,
     
            oneSignalAppId,
            webLink,
            iconBundleLink
          );
        }
      }
    }
    isBuilderRunning = false;
  } catch (error) {
    isBuilderRunning = false;
    console.log(error);
  }
};

let callTheMainFun = async () => {
  console.log("-----Main fun called -------");
  console.log(`Url: ${restBaseUrl}`);

  await main();
  console.log("-----Main fun Ended -------");

  // Schedule the function to run again in 1 minutes
  setTimeout(callTheMainFun, 1 * 60 * 1000);
};

callTheMainFun();
