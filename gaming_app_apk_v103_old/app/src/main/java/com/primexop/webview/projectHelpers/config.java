package com.primexop.webview.projectHelpers;

import com.primexop.webview.BuildConfig;

public class config {
    public static  final  Boolean isLocalEnvironment  =false;
    public static final String[] urlContainsForDirectExit = {"play", "account", "earn","login"};
    static final int app_v_code = BuildConfig.VERSION_CODE;
    static final String appUsername = BuildConfig.APPLICATION_ID.replaceFirst("^com.", "").replaceFirst("\\.web_apk", "");





    /* production gaming admin  link */
    // public static   String HomePageLink = "https://mtaapr.primexop.com/init/"+app_v_code+"/";


    /*production gaming app link*/
    public static   String HomePageLink = "https://mtawar.primexop.com/"+appUsername+"/init/"+app_v_code+"/";




    /* Local gaming app  link */
  //  public static   String HomePageLink = "http://10.0.2.2:3000/"+appUsername+"/init/"+app_v_code+"/";


}
