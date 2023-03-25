package com.primexop.webview.baseHelpers;


import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.ProgressBar;

public class AdvancedWebChromeClient extends WebChromeClient {
    public  Activity mActivity;

    private final ProgressBar mHorizontalProgressBar;
    private final PermissionHandler mPermissionHandler;

    public AdvancedWebChromeClient(Activity activity, PermissionHandler permissionHandler, ProgressBar horizontalProgressBar) {
        mActivity = activity;
        mHorizontalProgressBar=horizontalProgressBar;
        mPermissionHandler=permissionHandler;
    }

    /* File uploading in wev view  start  */

    private static final int REQUEST_CODE = 1234;
    private static final int FILE_CHOOSER_RESULT_CODE = 101;
    private ValueCallback<Uri[]> mFilePathCallback;


    // For Android 5.0+
    public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
        mFilePathCallback = filePathCallback;
       // Log.d(TAG, "adarsh  onShowFileChooser triggered ");
        if (mPermissionHandler.isPermissionGranted(Manifest.permission.READ_EXTERNAL_STORAGE, REQUEST_CODE,"File")) {
            showFileChooser();
            return true;
        }else {
            return false;
        }

    }



    // Handle permission request result
    public void onRequestPermissionsResultForFile(int requestCode, String[] permissions, int[] grantResults) {

        if(mPermissionHandler.onRequestPermissionsResult( requestCode,  permissions,  grantResults,REQUEST_CODE)){
            showFileChooser();
        }
    }

    // Show file chooser dialog
    private void showFileChooser() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        mActivity.startActivityForResult(Intent.createChooser(intent, "Choose File"), FILE_CHOOSER_RESULT_CODE);
    }

    // Handle file chooser result
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_RESULT_CODE) {
            if (null == mFilePathCallback) return;
            Uri[] result = null;
            // Check that the response is a good one
            if (resultCode == Activity.RESULT_OK) {
                // Get the file path from the URI
                result = new Uri[]{data.getData()};
            }
            mFilePathCallback.onReceiveValue(result);
            mFilePathCallback = null;
        }
    }
    /* File uploading in wev view end   */


    /* horizontal loading bar Start   */

    @Override
    public void onProgressChanged(WebView view, int newProgress) {
        super.onProgressChanged(view, newProgress);

        mHorizontalProgressBar.setProgress(newProgress);

        if (newProgress == 100) {

            mHorizontalProgressBar.setVisibility(View.GONE);
        }else{

            mHorizontalProgressBar.setVisibility(View.VISIBLE);
        }


    }

    /* horizontal loading bar End   */
}
