package com.primexop.webview.helpers;



import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class AdvancedWebChromeClient extends WebChromeClient {
    private Activity mActivity;
    private ProgressBar mHorizontalProgressBar;

    public AdvancedWebChromeClient(Activity activity, ProgressBar horizontalProgressBar) {
        mActivity = activity;
        mHorizontalProgressBar=horizontalProgressBar;
    }

    /* File uploading in wev view  start  */
    private static final int REQUEST_CODE = 1234;
    private static final int FILE_CHOOSER_RESULT_CODE = 101;
    private ValueCallback<Uri[]> mFilePathCallback;
    private String mCameraPhotoPath;


    // For Android 5.0+
    public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
        mFilePathCallback = filePathCallback;
        requestPermission();
        return true;
    }

    // Check for permission and request it if not granted
    private void requestPermission() {
        if (ContextCompat.checkSelfPermission(mActivity, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(mActivity, new String[]{Manifest.permission.READ_EXTERNAL_STORAGE}, REQUEST_CODE);
        } else {
            showFileChooser();
        }
    }

    // Handle permission request result
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        switch (requestCode) {
            case REQUEST_CODE: {
                if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    showFileChooser();
                } else {
                    Toast.makeText(mActivity, "Permission denied", Toast.LENGTH_LONG).show();
                }
                return;
            }
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
