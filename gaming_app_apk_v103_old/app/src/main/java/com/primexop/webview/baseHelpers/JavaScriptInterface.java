package com.primexop.webview.baseHelpers;


import static android.content.ContentValues.TAG;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;

import com.onesignal.OSDeviceState;
import com.onesignal.OSSubscriptionState;
import com.onesignal.OneSignal;

import org.json.JSONException;
import org.json.JSONObject;

public class JavaScriptInterface {
    private final Context mContext;
    public WebView mWebView;
    public JavaScriptInterface(Context context, WebView webView) {
        mContext = context;
        mWebView=webView;
    }

    public String externalIdString="null";



    @JavascriptInterface
    public void showToast( String msg){

        Log.d(TAG, " primeTest ToastMsg:"+msg);
        Toast.makeText(mContext,msg,Toast.LENGTH_LONG).show();
    }


    @JavascriptInterface
    public void openInBrowser(String url) {
        Log.d(TAG, " primeTest openInBrowser:"+url);

        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        mContext.startActivity(browserIntent);


    }

    @JavascriptInterface
    public void passData(String jsonData) {
        Log.d(TAG, " primeTest jsonData:"+jsonData);

        try {
            JSONObject data = new JSONObject(jsonData); //Convert from string to object, can also use JSONArray
            Log.d(TAG, " primeTest data:"+data);
            String name = data.getString("name");
            Number number = data.getInt("number");
            Log.d(TAG, " primeTest name  number:"+name + number);
        }  catch(Exception e) {

            Log.d(TAG, "Pxop Error"+ e);
        }


    }
    @JavascriptInterface
    public void shareMessage(String jsonData) {


        try {
            JSONObject data = new JSONObject(jsonData); //Convert from string to object, can also use JSONArray
            Log.d(TAG, " primeTest data:"+data);
            String shareMessage = data.getString("message");


            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("text/plain");
            shareIntent.putExtra(Intent.EXTRA_SUBJECT, "appName");

            // String   shareMessage =text;
            shareIntent.putExtra(Intent.EXTRA_TEXT, shareMessage);
            mContext.startActivity(shareIntent);
        } catch(Exception e) {
            Log.d(TAG, "Pxop Error"+ e);
        }

    }


    @JavascriptInterface

    public void initOnesignal( String jsonData){
        try{
            JSONObject data = new JSONObject(jsonData);
            Log.d(TAG, "onesignal initiated");
            String appId = data.getString("appId");
            //  final String ONESIGNAL_APP_ID = "cb424881-2e7b-4a48-93fd-d27e81d692f7";


            OneSignal.setLogLevel(OneSignal.LOG_LEVEL.VERBOSE, OneSignal.LOG_LEVEL.NONE);

            // OneSignal Initialization
            OneSignal.initWithContext(mContext);
            OneSignal.setAppId(appId);

            // promptForPushNotifications will show the native Android notification permission prompt.
            // We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step 7)
            OneSignal.promptForPushNotifications();

            // Set the initialization handler to call a function when initialization is complete

        } catch(Exception e) {
            Log.d(TAG, "Pxop Error"+ e);
        }

    }



    @JavascriptInterface

    public void getOnesignalPlayerId(){
        try{

            OSDeviceState deviceState = OneSignal.getDeviceState();
            if (deviceState != null) {
                String playerId  = deviceState.getUserId();
                // Use playerId as needed
                Log.d(TAG, "getOnesignalPlayerId "+playerId);
                // Call a JavaScript function

                mWebView.post(() -> mWebView.evaluateJavascript("onesignalPlayerIdFun('success','"+playerId+"')",null));

            } else {
                // Device state is not available yet
                Log.d(TAG, "getOnesignalPlayerId  not found  ");


                mWebView.post(() -> mWebView.evaluateJavascript("onesignalPlayerIdFun('error','')",null));
            }
        } catch(Exception e) {

            Log.d(TAG, "Pxop Error"+ e);
        }

    }

    @JavascriptInterface

    public void setOnesignalExternalId( String jsonData){
        try{
            JSONObject data = new JSONObject(jsonData);

            String externalId = data.getString("externalId");
            Log.d(TAG, "onesignal setOnesignalExternalId"+externalId+"-"+externalIdString);
           // OneSignal.setExternalUserId(externalId);
            if(!externalId.equals(externalIdString)){

                // Setting External User Id with Callback Available in SDK Version 4.0.0+
                OneSignal.setExternalUserId(externalId, new OneSignal.OSExternalUserIdUpdateCompletionHandler() {
                    @Override
                    public void onSuccess(JSONObject results) {
                        try {
                            if (results.has("push") && results.getJSONObject("push").has("success")) {
                                boolean isPushSuccess = results.getJSONObject("push").getBoolean("success");
                                OneSignal.onesignalLog(OneSignal.LOG_LEVEL.VERBOSE, "xxx Set external user id for push status: " + isPushSuccess);
                                externalIdString =externalId;
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }



                    }

                    @Override
                    public void onFailure(OneSignal.ExternalIdError error) {
                        // The results will contain channel failure statuses
                        // Use this to detect if external_user_id was not set and retry when a better network connection is made
                        OneSignal.onesignalLog(OneSignal.LOG_LEVEL.VERBOSE, "Set external user id done with error: " + error.toString());
                    }
                });

            }

        } catch(Exception e) {
            Log.d(TAG, "Pxop Error"+ e);
        }

    }

    @JavascriptInterface

    public void removeOnesignalExternalId(){
        try{

            OneSignal.removeExternalUserId();
            Log.d(TAG, "onesignal removeExternalUserId");

        } catch(Exception e) {
            Log.d(TAG, "Pxop Error"+ e);
        }

    }




}



