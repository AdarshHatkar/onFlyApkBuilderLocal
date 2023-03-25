package com.primexop.webview.activities;



import static android.content.ContentValues.TAG;
import static com.primexop.webview.projectHelpers.config.HomePageLink;
import static com.primexop.webview.projectHelpers.config.isLocalEnvironment;
import static com.primexop.webview.projectHelpers.config.urlContainsForDirectExit;


import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.os.Bundle;

import com.primexop.webview.R;
import com.primexop.webview.baseHelpers.DetectConnection;
import com.primexop.webview.baseHelpers.AdvancedWebChromeClient;
import com.primexop.webview.baseHelpers.JavaScriptInterface;
import com.primexop.webview.baseHelpers.PermissionHandler;


import androidx.annotation.Nullable;


import android.content.Intent;

import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.Toast;




public class MainActivity extends AppCompatActivity {
    RelativeLayout splashScreenRelativeLayout;
    RelativeLayout webViewRelativeLayout;


    ProgressBar HorizontalProgressBar;
    FrameLayout horizontalProgressFrameLayout;
    public WebView webView;
    final Handler handler = new Handler();
    public AdvancedWebChromeClient advancedWebChromeClient;




    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        splashScreenRelativeLayout = findViewById(R.id.splash_screen_relative_layout);
        webViewRelativeLayout  = findViewById(R.id.web_view_relative_layout);
        horizontalProgressFrameLayout = findViewById(R.id.frameLayoutHorizontalProgress);
        HorizontalProgressBar = findViewById(R.id.progressbar);

        webView = findViewById(R.id.web_view);


        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setLoadsImagesAutomatically(true);
        webSettings.setAllowFileAccess(true);
        webView.addJavascriptInterface(new JavaScriptInterface(this,webView), "Android");
        PermissionHandler permissionHandler = new PermissionHandler(this);
        advancedWebChromeClient =new AdvancedWebChromeClient(this,permissionHandler,HorizontalProgressBar);
        webView.setWebChromeClient(advancedWebChromeClient);


        webView.loadUrl(HomePageLink);



        if (!DetectConnection.checkInternetConnection(this)) {
            Toast.makeText(getApplicationContext(), "No Internet!", Toast.LENGTH_SHORT).show();
            webView.evaluateJavascript("alert('Internet Connection Not Available')",null);
            // splashScreenRelativelayout.setVisibility(View.GONE);

        } else {
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageFinished(WebView view, String url) {
                    // hide the splash screen and show the WebView

                    splashScreenRelativeLayout.setVisibility(View.GONE);
                    webViewRelativeLayout.setVisibility(View.VISIBLE);
//                    handler.postDelayed(() -> {
//                        // Timeout logic here
//
//                    }, 1000 * 2);

                }
            });
        }









    }

    @Override
    public void onBackPressed() {
        boolean isMatchedToUrlContainsArray = false;
        for (String s : urlContainsForDirectExit) {
            if (webView.getUrl().contains(s)) {
                isMatchedToUrlContainsArray = true;
                if(isLocalEnvironment){
                    Log.d(TAG, "adarsh  urlContainsForDirectExit Matched "+s);
                }
                break;
            }else {
                if(isLocalEnvironment) {
                    Log.d(TAG, "adarsh  urlContainsForDirectExit NotMatched " + s);
                }
            }
        }

        if(isMatchedToUrlContainsArray){
            Intent homeIntent = new Intent(Intent.ACTION_MAIN);
            homeIntent.addCategory( Intent.CATEGORY_HOME );
            homeIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(homeIntent);
        }else  if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        // Pass the permission result to your file upload/download manager
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        advancedWebChromeClient.onRequestPermissionsResultForFile(requestCode, permissions, grantResults);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        // Pass the file chooser result to your file upload/download manager
        super.onActivityResult(requestCode, resultCode, data);
        advancedWebChromeClient.onActivityResult(requestCode, resultCode, data);
    }















}

