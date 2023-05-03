package com.primexop.webview.baseHelpers;

import static com.primexop.webview.projectHelpers.config.isLocalEnvironment;

import android.app.Activity;
import android.content.pm.PackageManager;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class PermissionHandler {

    private final Activity mActivity;

    public PermissionHandler(Activity activity) {
        mActivity = activity;
    }

    public boolean checkPermission(String permission) {
        int result = ContextCompat.checkSelfPermission(mActivity, permission);
        return result == PackageManager.PERMISSION_GRANTED;
    }

    public void requestPermission(String permission, int requestCode , String permissionNameForAlert ) {



        if (ActivityCompat.shouldShowRequestPermissionRationale(mActivity, permission)){
            // Show an explanation to the user
            new AlertDialog.Builder(mActivity)
                    .setTitle("Permission Denied")
                    .setMessage("You cant use this feature because you already denied for "+permissionNameForAlert+ "Permission")
                    .setPositiveButton("OK", (dialogInterface, i) -> {


                    })

                    .create()
                    .show();
        }else {


            // Show an explanation to the user
            new AlertDialog.Builder(mActivity)
                    .setTitle(permissionNameForAlert+" Permission Needed")
                    .setMessage("This App needs the "+permissionNameForAlert+" Permission, Please accept it to use this functionality.")
                    .setPositiveButton("OK", (dialogInterface, i) -> {
                        // Request the permission again
                        ActivityCompat.requestPermissions(mActivity, new String[]{permission}, requestCode);
                    })
                    .setNegativeButton("Cancel", (dialogInterface, i) -> {
                        // User canceled the permission request, do something else
                    })
                    .create()
                    .show();
        }


    }

    public boolean onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults,  int myRequestCode) {
        if (requestCode == myRequestCode) { // Replace 1 with your own request code


            boolean allPermissionsGranted = true;
            int i =0;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allPermissionsGranted = false;
                    if(isLocalEnvironment) {
                     Toast.makeText(mActivity, permissions[i]+" Permission denied .. ", Toast.LENGTH_SHORT).show();
              }
                    break;
                }
                i++;
            }

            if (allPermissionsGranted) {
                // All requested permissions have been granted, continue with your app logic
                if(isLocalEnvironment){
                    Toast.makeText(mActivity, "All Permission granted", Toast.LENGTH_SHORT).show();
              }
                return true;
            } else {
                // Some or all requested permissions have been denied, handle accordingly
                return false;
            }
        }else {
            return false;
        }

    }

    public boolean isPermissionGranted(String permission, int requestCode, String permissionNameForAlert) {
        if (!checkPermission(permission)) {
            requestPermission(permission, requestCode,permissionNameForAlert);
            return false;
        } else {
            return true;
        }
    }
}

