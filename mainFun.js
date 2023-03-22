import { exec } from "node:child_process";
// gradle --version
export let mainFun = () => {
    console.log("hello world");
   
    exec('gradle --version', (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout);
      });

    exec('cd gaming_app_apk_v103 && gradle build', (err, stdout, stderr) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(stdout);
      });
  
};
