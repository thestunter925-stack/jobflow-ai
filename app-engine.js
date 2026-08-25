/* =========================================
   JOBFLOW AI — APPLICATION ENGINE
   ========================================= */

const AppEngine = {

  version: "1.0.0",

  initialized: false,

  state: {

    currentPage: "dashboard",

    currentJob: null,

    currentMatch: null,

    currentCoverLetter: "",

    resume: {},

    applications: [],

    analyses: [],

    settings: {}

  },


  /* -----------------------------------------
     INITIALIZE
     ----------------------------------------- */

  init() {

    if (
      this.initialized
    ) {

      return this;

    }


    if (
      typeof StorageEngine !==
      "undefined"
    ) {

      StorageEngine.initialize();

      this.loadState();

    }


    if (
      typeof UIEngine !==
      "undefined"
    ) {

      UIEngine.init();

    }


    this.initialized =
      true;


    console.log(
      "JobFlow Application Engine loaded."
    );


    return this;

  },


  /* -----------------------------------------
     LOAD STATE
     ----------------------------------------- */

  loadState() {

    if (
      typeof StorageEngine ===
      "undefined"
    ) {

      return;

    }


    this.state.resume =
      StorageEngine.getResume();


    this.state.applications =
      StorageEngine.getApplications();


    this.state.analyses =
      StorageEngine.getJobAnalyses();


    this.state.settings =
      StorageEngine.getSettings();


    return this.state;

  },


  /* -----------------------------------------
     SAVE RESUME
     ----------------------------------------- */

  saveResume(
    resume
  ) {

    this.state.resume =
      resume;


    if (
      typeof StorageEngine !==
      "undefined"
    ) {

      StorageEngine.saveResume(
        resume
      );

    }


    if (
      typeof UIEngine !==
      "undefined"
    ) {

      UIEngine.success(
        "Resume saved successfully."
      );

    }


    return resume;

  },


  /* -----------------------------------------
     ANALYZE JOB
     ----------------------------------------- */

  analyzeJob(
    description
  ) {

    if (
      typeof JobEngine ===
      "undefined"
    ) {

      throw new Error(
        "JobEngine is not loaded."
      );

    }


    if (
      !description ||
      !String(
        description
      ).trim()
    ) {

      if (
        typeof UIEngine !==
        "undefined"
      ) {

        UIEngine.warning(
          "Enter a job description first."
        );

      }


      return null;

    }


    const analysis =
      JobEngine.analyze(
        description
      );


    this.state.currentJob =
      analysis;


    this.state.analyses.unshift(
      analysis
    );


    if (
      typeof StorageEngine !==
      "undefined"
    ) {

      StorageEngine.addJobAnalysis(
        analysis
      );

    }


    return analysis;

  },


  /* -----------------------------------------
     MATCH RESUME
     ----------------------------------------- */

  matchResume(
    resume = null,
    job = null
  ) {

    if (
      typeof JobEngine ===
      "undefined"
    ) {

      throw new Error(
        "JobEngine is not loaded."
      );

    }


    const selectedResume =
      resume ||
      this.state.resume;


    const selectedJob =
      job ||
      this.state.currentJob;


    if (
      !selectedJob
    ) {

      if (
        typeof UIEngine !==
        "undefined"
      ) {

        UIEngine.warning(
          "Analyze a job description first."
        );

      }


      return null;

    }


    const match =
      JobEngine.matchResume(
        selectedResume,
        selectedJob
      );


    this.state.currentMatch =
      match;


    return match;

  },


  /* -----------------------------------------
     CREATE COVER LETTER
     ----------------------------------------- */

  createCoverLetter(
    template = "professional"
  ) {

    if (
      typeof CoverLetterEngine ===
      "undefined"
    ) {

      throw new Error(
        "CoverLetterEngine is not loaded."
      );

    }


    const resume =
      this.state.resume;


    const job =
      this.state.currentJob;


    const data = {

      name:
        resume.name ||
        "",

      company:
        job?.company ||
        "your company",

      role:
        job?.role ||
        "this position",

      skills:
        resume.skills ||
        job?.skills ||
        "",

      experience:
        resume.experience ||
        "",

      achievement:
        resume.achievement ||
        ""

    };


    let letter =
      CoverLetterEngine
        .generateByTemplate(
          template,
          data
        );


    if (
      job?.text
    ) {

      letter =
        CoverLetterEngine
          .personalize(
            letter,
            job.text
          );

    }


    this.state.currentCoverLetter =
      letter;


    if (
      typeof StorageEngine !==
      "undefined"
    ) {

      StorageEngine.addCoverLetter({

        id:
          Date.now(),

        template:
          template,

        content:
          letter,

        createdAt:
          new Date()
            .toISOString()

      });

    }


    return letter;

  },


  /* -----------------------------------------
     CREATE APPLICATION
     ----------------------------------------- */

  addApplication(
    data = {}
  ) {

    const application = {

      id:
        data.id ||
        Date.now(),

      company:
        data.company ||
        "",

      role:
        data.role ||
        "",

      location:
        data.location ||
        "",

      url:
        data.url ||
        "",

      status:
        data.status ||
        "Saved",

      priority:
        data.priority ||
        "Medium",

      notes:
        data.notes ||
        "",

      appliedAt:
        data.appliedAt ||
        null,

      createdAt:
        data.createdAt ||
        new Date()
          .toISOString(),

      updatedAt:
        new Date()
          .toISOString()

    };


    this.state.applications.push(
      application
    );


    if (
      typeof StorageEngine !==
      "undefined"
    ) {

      StorageEngine.addApplication(
        application
      );

    }


    if (
      typeof UIEngine !==
      "undefined"
    ) {

      UIEngine.success(
        "Application added."
      );

    }


    return application;

  },


  /* -----------------------------------------
     UPDATE APPLICATION
     ----------------------------------------- */

  updateApplication(
    id,
    changes
  ) {

    const index =
      this.state.applications
        .findIndex(
          item =>
            String(item.id) ===
            String(id)
        );


    if (
      index === -1
    ) {

      return false;

    }


    this.state.applications[index] = {

      ...this.state
        .applications[index],

      ...changes,

      updatedAt:
        new Date()
          .toISOString()

    };


    if (
      typeof StorageEngine !==
      "undefined"
    ) {

      StorageEngine.updateApplication(
        id,
        changes
      );

    }


    return (
      this.state
        .applications[index]
    );

  },


  /* -----------------------------------------
     DELETE APPLICATION
     ----------------------------------------- */

  deleteApplication(
    id
  ) {

    this.state.applications =
      this.state
        .applications
        .filter(
          item =>
            String(item.id) !==
            String(id)
        );


    if (
      typeof StorageEngine !==
      "undefined"
    ) {

      StorageEngine.deleteApplication(
        id
      );

    }


    if (
      typeof UIEngine !==
      "undefined"
    ) {

      UIEngine.success(
        "Application removed."
      );

    }


    return true;

  },


  /* -----------------------------------------
     DASHBOARD STATISTICS
     ----------------------------------------- */

  getDashboardStats() {

    const apps =
      this.state
        .applications;


    const total =
      apps.length;


    const applied =
      apps.filter(
        item =>
          [
            "Applied",
            "Screening",
            "Interview",
            "Final Round",
            "Offer"
          ]
            .includes(
              item.status
            )
      ).length;


    const interviews =
      apps.filter(
        item =>
          [
            "Interview",
            "Final Round"
          ]
            .includes(
              item.status
            )
      ).length;


    const offers =
      apps.filter(
        item =>
          item.status ===
          "Offer"
      ).length;


    const rejected =
      apps.filter(
        item =>
          item.status ===
          "Rejected"
      ).length;


    const responseRate =
      applied
        ? Math.round(
            (
              (
                interviews +
                offers
              ) /
              applied
            ) *
            100
          )
        : 0;


    return {

      total:
        total,

      applied:
        applied,

      interviews:
        interviews,

      offers:
        offers,

      rejected:
        rejected,

      responseRate:
        responseRate

    };

  },


  /* -----------------------------------------
     JOB MATCH SCORE
     ----------------------------------------- */

  getCurrentMatchScore() {

    return (
      this.state
        .currentMatch
        ?.score ||
      0
    );

  },


  /* -----------------------------------------
     EXPORT USER DATA
     ----------------------------------------- */

  exportData() {

    if (
      typeof StorageEngine ===
      "undefined"
    ) {

      return null;

    }


    const data =
      StorageEngine.exportAll();


    if (
      typeof UIEngine !==
      "undefined"
    ) {

      UIEngine.download(
        data,
        "jobflow-backup.json",
        "application/json"
      );

      UIEngine.success(
        "JobFlow backup exported."
      );

    }


    return data;

  },


  /* -----------------------------------------
     IMPORT USER DATA
     ----------------------------------------- */

  importData(
    json
  ) {

    if (
      typeof StorageEngine ===
      "undefined"
    ) {

      return false;

    }


    const result =
      StorageEngine.importAll(
        json
      );


    if (
      result.success
    ) {

      this.loadState();


      if (
        typeof UIEngine !==
        "undefined"
      ) {

        UIEngine.success(
          result.message
        );

      }

    } else {

      if (
        typeof UIEngine !==
        "undefined"
      ) {

        UIEngine.error(
          result.message
        );

      }

    }


    return result;

  },


  /* -----------------------------------------
     RESET APP
     ----------------------------------------- */

  reset() {

    if (
      typeof StorageEngine ===
      "undefined"
    ) {

      return false;

    }


    const execute =
      () => {

        StorageEngine.clearAll();

        this.state.resume =
          {};

        this.state.applications =
          [];

        this.state.analyses =
          [];

        this.state.currentJob =
          null;

        this.state.currentMatch =
          null;

        this.state.currentCoverLetter =
          "";


        if (
          typeof UIEngine !==
          "undefined"
        ) {

          UIEngine.success(
            "JobFlow data has been reset."
          );

        }

      };


    if (
      typeof UIEngine !==
      "undefined"
    ) {

      UIEngine.confirm(
        "Delete all locally stored JobFlow data?",
        execute
      );

    } else {

      execute();

    }


    return true;

  },


  /* -----------------------------------------
     PAGE NAVIGATION
     ----------------------------------------- */

  navigate(
    page
  ) {

    this.state.currentPage =
      page;


    document
      .querySelectorAll(
        "[data-page]"
      )
      .forEach(
        element => {

          element.classList.toggle(
            "active",
            element.dataset.page ===
            page
          );

        }
      );


    document
      .querySelectorAll(
        "[data-view]"
      )
      .forEach(
        element => {

          element.hidden =
            element.dataset.view !==
            page;

        }
      );


    window.dispatchEvent(
      new CustomEvent(
        "jobflow:navigate",
        {
          detail: {
            page:
              page
          }
        }
      )
    );


    return page;

  },


  /* -----------------------------------------
     EVENT SYSTEM
     ----------------------------------------- */

  emit(
    name,
    detail = {}
  ) {

    window.dispatchEvent(
      new CustomEvent(
        "jobflow:" +
        name,
        {
          detail:
            detail
        }
      )
    );

  },


  on(
    name,
    callback
  ) {

    window.addEventListener(
      "jobflow:" +
      name,
      callback
    );

  },


  /* -----------------------------------------
     GLOBAL BUTTON HANDLER
     ----------------------------------------- */

  bindButtons() {

    document.addEventListener(
      "click",
      event => {

        const button =
          event.target.closest(
            "[data-jobflow-action]"
          );


        if (
          !button
        ) {

          return;

        }


        const action =
          button.dataset
            .jobflowAction;


        if (
          action ===
          "analyze-job"
        ) {

          this.handleAnalyze();

        }


        if (
          action ===
          "match-resume"
        ) {

          this.matchResume();

        }


        if (
          action ===
          "cover-letter"
        ) {

          this.createCoverLetter();

        }


        if (
          action ===
          "export"
        ) {

          this.exportData();

        }


        if (
          action ===
          "reset"
        ) {

          this.reset();

        }


        if (
          action ===
          "dashboard"
        ) {

          this.navigate(
            "dashboard"
          );

        }

      }
    );

  },


  /* -----------------------------------------
     ANALYZE BUTTON HANDLER
     ----------------------------------------- */

  handleAnalyze() {

    const field =
      document.querySelector(
        "[data-job-description]"
      );


    if (
      !field
    ) {

      if (
        typeof UIEngine !==
        "undefined"
      ) {

        UIEngine.warning(
          "Job description field not found."
        );

      }


      return null;

    }


    const analysis =
      this.analyzeJob(
        field.value
      );


    if (
      analysis
    ) {

      this.emit(
        "job-analyzed",
        analysis
      );


      if (
        typeof UIEngine !==
        "undefined"
      ) {

        UIEngine.success(
          "Job description analyzed."
        );

      }

    }


    return analysis;

  },


  /* -----------------------------------------
     STARTUP
     ----------------------------------------- */

  start() {

    this.init();

    this.bindButtons();


    window.dispatchEvent(
      new CustomEvent(
        "jobflow:ready",
        {
          detail:
            this.state
        }
      )
    );


    return this;

  }

};


/* -----------------------------------------
   START APPLICATION
   ----------------------------------------- */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    () => {

      AppEngine.start();

    }
  );

} else {

  AppEngine.start();

}
/* -----------------------------------------
   LEGACY NAVIGATION BRIDGE
   Connects index.html onclick buttons
   to AppEngine navigation.
   ----------------------------------------- */

window.showPage = function(page, button) {

  if (
    window.AppEngine &&
    typeof AppEngine.navigate === "function"
  ) {

    AppEngine.navigate(page);
  }

  document
    .querySelectorAll(".nav button")
    .forEach(function(item) {

      item.classList.remove("active");

    });

  if (button) {

    button.classList.add("active");

  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

};
