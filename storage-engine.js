/* =========================================
   JOBFLOW AI — STORAGE ENGINE
   ========================================= */

const StorageEngine = {

  prefix: "jobflow_",

  defaults: {

    resume: {},

    applications: [],

    interviewSessions: [],

    coverLetters: [],

    jobAnalyses: [],

    settings: {

      theme: "system",

      autosave: true,

      notifications: true,

      compactMode: false

    }

  },


  key(name) {

    return (
      this.prefix +
      name
    );

  },


  clone(value) {

    return JSON.parse(
      JSON.stringify(
        value
      )
    );

  },


  save(
    name,
    value
  ) {

    try {

      localStorage.setItem(
        this.key(name),
        JSON.stringify(
          value
        )
      );

      return true;

    } catch (error) {

      console.error(
        "JobFlow save error:",
        error
      );

      return false;

    }

  },


  load(
    name,
    fallback = null
  ) {

    try {

      const value =
        localStorage.getItem(
          this.key(name)
        );


      if (
        value === null
      ) {

        return fallback;

      }


      return JSON.parse(
        value
      );

    } catch (error) {

      console.error(
        "JobFlow load error:",
        error
      );

      return fallback;

    }

  },


  remove(
    name
  ) {

    try {

      localStorage.removeItem(
        this.key(name)
      );

      return true;

    } catch (error) {

      return false;

    }

  },


  exists(
    name
  ) {

    return (
      localStorage.getItem(
        this.key(name)
      ) !== null
    );

  },


  initialize() {

    Object.keys(
      this.defaults
    )
      .forEach(
        name => {

          if (
            !this.exists(
              name
            )
          ) {

            this.save(
              name,
              this.defaults[name]
            );

          }

        }
      );

    return true;

  },


  getResume() {

    return this.load(
      "resume",
      this.clone(
        this.defaults.resume
      )
    );

  },


  saveResume(
    resume
  ) {

    return this.save(
      "resume",
      resume
    );

  },


  getApplications() {

    return this.load(
      "applications",
      []
    );

  },


  saveApplications(
    applications
  ) {

    return this.save(
      "applications",
      applications
    );

  },


  addApplication(
    application
  ) {

    const applications =
      this.getApplications();


    applications.push(
      application
    );


    return this.saveApplications(
      applications
    );

  },


  updateApplication(
    id,
    changes
  ) {

    const applications =
      this.getApplications();


    const index =
      applications.findIndex(
        item =>
          String(item.id) ===
          String(id)
      );


    if (
      index === -1
    ) {

      return false;

    }


    applications[index] = {

      ...applications[index],

      ...changes,

      updatedAt:
        new Date()
          .toISOString()

    };


    return this.saveApplications(
      applications
    );

  },


  deleteApplication(
    id
  ) {

    const applications =
      this.getApplications();


    const filtered =
      applications.filter(
        item =>
          String(item.id) !==
          String(id)
      );


    return this.saveApplications(
      filtered
    );

  },


  getInterviewSessions() {

    return this.load(
      "interviewSessions",
      []
    );

  },


  saveInterviewSessions(
    sessions
  ) {

    return this.save(
      "interviewSessions",
      sessions
    );

  },


  addInterviewSession(
    session
  ) {

    const sessions =
      this.getInterviewSessions();


    sessions.push(
      session
    );


    return this.saveInterviewSessions(
      sessions
    );

  },


  getCoverLetters() {

    return this.load(
      "coverLetters",
      []
    );

  },


  saveCoverLetters(
    letters
  ) {

    return this.save(
      "coverLetters",
      letters
    );

  },


  addCoverLetter(
    letter
  ) {

    const letters =
      this.getCoverLetters();


    letters.push(
      letter
    );


    return this.saveCoverLetters(
      letters
    );

  },


  getJobAnalyses() {

    return this.load(
      "jobAnalyses",
      []
    );

  },


  saveJobAnalyses(
    analyses
  ) {

    return this.save(
      "jobAnalyses",
      analyses
    );

  },


  addJobAnalysis(
    analysis
  ) {

    const analyses =
      this.getJobAnalyses();


    analyses.unshift(
      analysis
    );


    return this.saveJobAnalyses(
      analyses
    );

  },


  getSettings() {

    return this.load(
      "settings",
      this.clone(
        this.defaults.settings
      )
    );

  },


  saveSettings(
    settings
  ) {

    return this.save(
      "settings",
      settings
    );

  },


  updateSettings(
    changes
  ) {

    const settings =
      this.getSettings();


    const updated = {

      ...settings,

      ...changes

    };


    this.saveSettings(
      updated
    );


    return updated;

  },


  /* -----------------------------------------
     EXPORT EVERYTHING
     ----------------------------------------- */

  exportAll() {

    const data = {

      version:
        "1.0",

      product:
        "JobFlow AI",

      exportedAt:
        new Date()
          .toISOString(),

      resume:
        this.getResume(),

      applications:
        this.getApplications(),

      interviewSessions:
        this.getInterviewSessions(),

      coverLetters:
        this.getCoverLetters(),

      jobAnalyses:
        this.getJobAnalyses(),

      settings:
        this.getSettings()

    };


    return JSON.stringify(
      data,
      null,
      2
    );

  },


  /* -----------------------------------------
     IMPORT EVERYTHING
     ----------------------------------------- */

  importAll(
    json
  ) {

    try {

      const data =
        typeof json ===
        "string"

          ? JSON.parse(
              json
            )

          : json;


      if (
        !data ||
        typeof data !==
        "object"
      ) {

        throw new Error(
          "Invalid backup"
        );

      }


      if (
        data.resume
      ) {

        this.saveResume(
          data.resume
        );

      }


      if (
        Array.isArray(
          data.applications
        )
      ) {

        this.saveApplications(
          data.applications
        );

      }


      if (
        Array.isArray(
          data.interviewSessions
        )
      ) {

        this.saveInterviewSessions(
          data.interviewSessions
        );

      }


      if (
        Array.isArray(
          data.coverLetters
        )
      ) {

        this.saveCoverLetters(
          data.coverLetters
        );

      }


      if (
        Array.isArray(
          data.jobAnalyses
        )
      ) {

        this.saveJobAnalyses(
          data.jobAnalyses
        );

      }


      if (
        data.settings
      ) {

        this.saveSettings(
          data.settings
        );

      }


      return {

        success:
          true,

        message:
          "JobFlow backup restored successfully."

      };

    } catch (error) {

      return {

        success:
          false,

        message:
          "The backup file could not be restored."

      };

    }

  },


  /* -----------------------------------------
     COMPLETE RESET
     ----------------------------------------- */

  clearAll() {

    Object.keys(
      this.defaults
    )
      .forEach(
        name => {

          this.remove(
            name
          );

        }
      );


    this.initialize();


    return true;

  },


  /* -----------------------------------------
     STORAGE INFORMATION
     ----------------------------------------- */

  getInfo() {

    let size = 0;

    Object.keys(
      localStorage
    )
      .forEach(
        key => {

          if (
            key.startsWith(
              this.prefix
            )
          ) {

            size +=
              localStorage
                .getItem(
                  key
                )
                .length;

          }

        }
      );


    return {

      prefix:
        this.prefix,

      characters:
        size,

      approximateKB:
        Math.round(
          size / 1024
        ),

      items:
        Object.keys(
          localStorage
        )
          .filter(
            key =>
              key.startsWith(
                this.prefix
              )
          )
          .length

    };

  }

};


/* -----------------------------------------
   AUTO INITIALIZE
   ----------------------------------------- */

StorageEngine.initialize();


console.log(
  "JobFlow Storage Engine loaded."
);