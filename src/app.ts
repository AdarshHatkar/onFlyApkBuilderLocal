import axios from "axios";
import { builderFun } from "./helpers/builder.js";
import { restBaseUrl } from "./helpers/config.js";

let isBuilderRunning:boolean = false


let main = async () => {
    try {
        isBuilderRunning = true
        let response = await axios.get(`${restBaseUrl}/basic/getWebApkOrders`)

        console.log(response.data);
        if (response.data.status == 'success') {
            //new data variable
            let { pendingOrders } = response.data

            if (pendingOrders.length > 0) {

                for (let i = 0; i < pendingOrders.length; i++) {

                    let { sn, ownerId, version, logoLink, orderType, all_owners } = pendingOrders[i]
                    let orderId = sn
                    if (orderType == 'apk') {

                        let userName = all_owners.web_app_details[0].username;
                        let newApplicationId = `com.${userName}.web_apk`;

                        let apkName = all_owners.web_app_details[0].name;


                        let newVersionCode = version;

                        let googleServiceJson = all_owners.web_apk_details.googleServiceJson

                        await builderFun(orderId, ownerId, newApplicationId, userName, apkName, newVersionCode, googleServiceJson)
                    }

                }

            }


        }
        isBuilderRunning = false
    } catch (error) {
        isBuilderRunning = false
        console.log(error);
    }


}





let callTheMainFun = async () => {
    console.log("-----Main fun called -------");
    await main()
    console.log("-----Main fun Ended -------");

    // Schedule the function to run again in 2 minutes
    setTimeout(callTheMainFun, 2 * 60 * 1000);
}

callTheMainFun();