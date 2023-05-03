package com.primexop.webview.helpers;



import static android.content.ContentValues.TAG;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;


import com.onesignal.OSDeviceState;
import com.onesignal.OneSignal;
import com.primexop.webview.activities.MainActivity;

import org.json.JSONObject;

public class JavaScriptInterface {
    private Context context;
    public WebView webView;
    public JavaScriptInterface(Context context, WebView webView) {
        this.context = context;
        this.webView=webView;
    }
    MainActivity mainActivity = new MainActivity();



    @JavascriptInterface

    public void showToast( String msg){

        Log.d(TAG, " primeTest ToastMsg:"+msg);
        Toast.makeText(context,msg,Toast.LENGTH_LONG).show();
    }

    @JavascriptInterface
    public void openInBrowser(String url) {
        Log.d(TAG, " primeTest openInBrowser:"+url);

        Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        context.startActivity(browserIntent);


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
        } catch (Exception ex) {}


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
            context.startActivity(shareIntent);
        } catch(Exception e) {
            e.toString();
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
            OneSignal.initWithContext(context);
            OneSignal.setAppId(appId);

            // promptForPushNotifications will show the native Android notification permission prompt.
            // We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step 7)
            OneSignal.promptForPushNotifications();



        } catch(Exception e) {
            e.toString();
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

                webView.post(() -> webView.evaluateJavascript("onesignalPlayerIdFun('success','"+playerId+"')",null));

            } else {
                // Device state is not available yet
                Log.d(TAG, "getOnesignalPlayerId  not found  ");


                webView.post(() -> webView.evaluateJavascript("onesignalPlayerIdFun('error','')",null));
            }
        } catch(Exception e) {

            e.toString();
        }

    }






}



