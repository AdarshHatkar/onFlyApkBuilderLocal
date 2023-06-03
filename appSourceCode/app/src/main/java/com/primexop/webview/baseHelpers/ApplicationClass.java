package com.primexop.webview.baseHelpers;

import static android.content.ContentValues.TAG;

import android.app.Application;
import android.util.Log;

import com.onesignal.OneSignal;
import com.primexop.webview.R;

public class ApplicationClass extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        final String ONESIGNAL_APP_ID =  getString(R.string.onesignal_app_id);

        Log.d(TAG, "AC onesignal  "+ONESIGNAL_APP_ID);
        // Enable verbose OneSignal logging to debug issues if needed.
        OneSignal.setLogLevel(OneSignal.LOG_LEVEL.VERBOSE, OneSignal.LOG_LEVEL.NONE);

        // OneSignal Initialization
        OneSignal.initWithContext(this);
        OneSignal.setAppId(ONESIGNAL_APP_ID);

        // promptForPushNotifications will show the native Android notification permission prompt.
        // We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step 7)
        OneSignal.promptForPushNotifications();
    }

}
