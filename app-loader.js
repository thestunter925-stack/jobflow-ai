/* =========================================
   JOBFLOW AI — ENGINE LOADER
   Connects all JobFlow engines safely
========================================= */

(function () {

  "use strict";

  const scripts = [
    "storage-engine.js",
    "ui-engine.js",
    "job-engine.js",
    "application-engine.js",
    "analytics-engine.js",
    "ats-engine.js",
    "career-engine.js",
    "cover-letter-engine.js",
    "interview-engine.js",
    "resume-engine.js",
    "app-engine.js",
    "app.js"
  ];

  function loadScript(src) {

    return new Promise(function (resolve, reject) {

      const existing =
        document.querySelector(
          'script[data-jobflow="' + src + '"]'
        );

      if (existing) {

        resolve();

        return;

      }

      const script =
        document.createElement("script");

      script.src = src;

      script.async = false;

      script.dataset.jobflow = src;

      script.onload = function () {

        console.log(
          "JobFlow loaded:",
          src
        );

        resolve();

      };

      script.onerror = function () {

        console.error(
          "JobFlow failed to load:",
          src
        );

        reject(
          new Error(
            "Could not load " + src
          )
        );

      };

      document.body.appendChild(
        script
      );

    });

  }


  async function start() {

    try {

      for (
        const script of scripts
      ) {

        await loadScript(
          script
        );

      }

      console.log(
        "JobFlow engine connection complete."
      );

      window.JobFlowConnected =
        true;

      window.dispatchEvent(
        new CustomEvent(
          "jobflow:connected"
        )
      );

    } catch (error) {

      console.error(
        "JobFlow engine connection failed:",
        error
      );

      window.JobFlowConnected =
        false;

      window.dispatchEvent(
        new CustomEvent(
          "jobflow:connection-error",
          {
            detail: error
          }
        )
      );

    }

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start
    );

  } else {

    start();

  }

})();