import axios from "axios";
import { builderFun } from "./helpers/builder.js";
import { restBaseUrl } from "./helpers/config.js";




let main = async () => {
    try {
        let response = await axios.get(`${restBaseUrl}/basic/getWebApkOrders`)

        console.log(response.data);
        if (response.data.status == 'success') {
            //new data variable
            let { pendingOrders } = response.data

            if (pendingOrders.length > 0) {

                for (let i = 0; i < pendingOrders.length; i++) {

                    let { sn,ownerId,version,logoLink, orderType,all_owners } = pendingOrders[i]
                   
                    if (orderType == 'apk') {

                        let userName = all_owners.web_app_details[0].username;
                        let newApplicationId = `com.${userName}.web_apk`;
                        
                        let apkName = all_owners.web_app_details[0].name;
                        let appLogoUrl = logoLink; // Replace with your image URL

                        let newVersionCode = version;

                        let googleServiceJson=all_owners.web_apk_details.googleServiceJson

                        await builderFun(newApplicationId, userName, apkName, appLogoUrl, newVersionCode,googleServiceJson)
                    }

                }

            }


        }

    } catch (error) {
        console.log(error);
    }


}
main()

