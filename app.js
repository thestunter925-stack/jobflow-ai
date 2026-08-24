/* =========================================
   JOBFLOW AI — CORE APPLICATION ENGINE
   ========================================= */

const JobFlow = {

  version: "3.0",

  storage: {
    resume: "jobflow_resume",
    profile: "jobflow_profile",
    applications: "jobflow_applications",
    savedJobs: "jobflow_saved_jobs",
    notes: "jobflow_notes",
    answers: "jobflow_answers",
    settings: "jobflow_settings"
  },

  state: {
    jobDescription: "",
    jobSkills: [],
    jobRequirements: [],
    jobResponsibilities: [],
    applications: [],
    savedJobs: [],
    notes: [],
    answers: [],
    resume: {},
    profile: {}
  },

  init() {

    this.loadAll();

    console.log(
      "JobFlow AI " +
      this.version +
      " initialized."
    );

  },

  get(key) {

    try {

      return localStorage.getItem(
        key
      );

    } catch (error) {

      console.warn(
        "Storage unavailable."
      );

      return null;

    }

  },

  set(key, value) {

    try {

      localStorage.setItem(
        key,
        value
      );

      return true;

    } catch (error) {

      console.warn(
        "Could not save data."
      );

      return false;

    }

  },

  remove(key) {

    try {

      localStorage.removeItem(
        key
      );

    } catch (error) {}

  },

  readJSON(key, fallback) {

    try {

      const data =
        this.get(key);

      return data
        ? JSON.parse(data)
        : fallback;

    } catch (error) {

      return fallback;

    }

  },

  writeJSON(key, data) {

    return this.set(
      key,
      JSON.stringify(data)
    );

  },

  loadAll() {

    this.state.resume =
      this.readJSON(
        this.storage.resume,
        {}
      );

    this.state.profile =
      this.readJSON(
        this.storage.profile,
        {}
      );

    this.state.applications =
      this.readJSON(
        this.storage.applications,
        []
      );

    this.state.savedJobs =
      this.readJSON(
        this.storage.savedJobs,
        []
      );

    this.state.notes =
      this.readJSON(
        this.storage.notes,
        []
      );

    this.state.answers =
      this.readJSON(
        this.storage.answers,
        []
      );

  },

  saveResume(data) {

    this.state.resume =
      data;

    return this.writeJSON(
      this.storage.resume,
      data
    );

  },

  saveProfile(data) {

    this.state.profile =
      data;

    return this.writeJSON(
      this.storage.profile,
      data
    );

  },

  addApplication(data) {

    const application = {

      id: Date.now(),

      company:
        data.company || "",

      role:
        data.role || "",

      link:
        data.link || "",

      status:
        data.status || "Saved",

      note:
        data.note || "",

      created:
        new Date().toISOString()

    };

    this.state.applications.unshift(
      application
    );

    this.writeJSON(
      this.storage.applications,
      this.state.applications
    );

    return application;

  },

  deleteApplication(id) {

    this.state.applications =
      this.state.applications.filter(
        item => item.id !== id
      );

    this.writeJSON(
      this.storage.applications,
      this.state.applications
    );

  },

  updateApplication(id, changes) {

    const item =
      this.state.applications.find(
        x => x.id === id
      );

    if (!item) return false;

    Object.assign(
      item,
      changes
    );

    this.writeJSON(
      this.storage.applications,
      this.state.applications
    );

    return true;

  },

  addSavedJob(data) {

    const job = {

      id: Date.now(),

      company:
        data.company || "",

      role:
        data.role || "",

      link:
        data.link || "",

      created:
        new Date().toISOString()

    };

    this.state.savedJobs.unshift(
      job
    );

    this.writeJSON(
      this.storage.savedJobs,
      this.state.savedJobs
    );

    return job;

  },

  deleteSavedJob(id) {

    this.state.savedJobs =
      this.state.savedJobs.filter(
        item => item.id !== id
      );

    this.writeJSON(
      this.storage.savedJobs,
      this.state.savedJobs
    );

  },

  addNote(title, text) {

    const note = {

      id: Date.now(),

      title: title,

      text: text,

      created:
        new Date().toISOString()

    };

    this.state.notes.unshift(
      note
    );

    this.writeJSON(
      this.storage.notes,
      this.state.notes
    );

    return note;

  },

  deleteNote(id) {

    this.state.notes =
      this.state.notes.filter(
        item => item.id !== id
      );

    this.writeJSON(
      this.storage.notes,
      this.state.notes
    );

  },

  addAnswer(question, answer) {

    const item = {

      id: Date.now(),

      question: question,

      answer: answer,

      created:
        new Date().toISOString()

    };

    this.state.answers.unshift(
      item
    );

    this.writeJSON(
      this.storage.answers,
      this.state.answers
    );

    return item;

  },

  deleteAnswer(id) {

    this.state.answers =
      this.state.answers.filter(
        item => item.id !== id
      );

    this.writeJSON(
      this.storage.answers,
      this.state.answers
    );

  },

  analyzeJob(text) {

    const lower =
      String(text || "")
      .toLowerCase();

    const skills = [

      "javascript",
      "typescript",
      "html",
      "css",
      "react",
      "vue",
      "angular",
      "node.js",
      "node",
      "python",
      "java",
      "c++",
      "sql",
      "mongodb",
      "mysql",
      "postgresql",
      "api",
      "rest",
      "git",
      "github",
      "aws",
      "azure",
      "docker",
      "kubernetes",
      "figma",
      "excel",
      "power bi",
      "machine learning",
      "artificial intelligence",
      "ai",
      "php",
      "swift",
      "kotlin",
      "flutter",
      "firebase"

    ];

    const requirements = [

      "communication",
      "leadership",
      "teamwork",
      "problem solving",
      "problem-solving",
      "analytical",
      "collaboration",
      "creativity",
      "adaptability",
      "organization",
      "critical thinking"

    ];

    const responsibilities = [

      "develop",
      "build",
      "design",
      "maintain",
      "debug",
      "test",
      "deploy",
      "implement",
      "manage",
      "collaborate",
      "analyze",
      "create",
      "integrate",
      "optimize",
      "support",
      "monitor"

    ];

    const foundSkills =
      skills.filter(
        skill =>
          lower.includes(skill)
      );

    const foundRequirements =
      requirements.filter(
        item =>
          lower.includes(item)
      );

    const foundResponsibilities =
      responsibilities.filter(
        item =>
          lower.includes(item)
      );

    this.state.jobDescription =
      text;

    this.state.jobSkills =
      foundSkills;

    this.state.jobRequirements =
      foundRequirements;

    this.state.jobResponsibilities =
      foundResponsibilities;

    return {

      skills:
        foundSkills,

      requirements:
        foundRequirements,

      responsibilities:
        foundResponsibilities

    };

  },

  calculateMatch(resumeSkills) {

    const target =
      this.state.jobSkills;

    if (!target.length) {

      return {
        score: 0,
        matched: [],
        missing: []
      };

    }

    const resume =
      String(
        resumeSkills || ""
      ).toLowerCase();

    const matched =
      target.filter(
        skill =>
          resume.includes(skill)
      );

    const missing =
      target.filter(
        skill =>
          !resume.includes(skill)
      );

    return {

      score:
        Math.round(
          matched.length /
          target.length *
          100
        ),

      matched:
        matched,

      missing:
        missing

    };

  },

  getDashboard() {

    const applications =
      this.state.applications;

    return {

      applications:
        applications.length,

      interviews:
        applications.filter(
          x =>
            x.status ===
            "Interview"
        ).length,

      offers:
        applications.filter(
          x =>
            x.status ===
            "Offer"
        ).length,

      savedJobs:
        this.state.savedJobs.length,

      notes:
        this.state.notes.length,

      answers:
        this.state.answers.length,

      detectedSkills:
        this.state.jobSkills.length

    };

  },

  exportData() {

    return {

      version:
        this.version,

      exportedAt:
        new Date().toISOString(),

      state:
        this.state

    };

  },

  importData(data) {

    if (!data || !data.state) {

      throw new Error(
        "Invalid JobFlow backup."
      );

    }

    this.state =
      data.state;

    this.writeJSON(
      this.storage.resume,
      this.state.resume
    );

    this.writeJSON(
      this.storage.profile,
      this.state.profile
    );

    this.writeJSON(
      this.storage.applications,
      this.state.applications
    );

    this.writeJSON(
      this.storage.savedJobs,
      this.state.savedJobs
    );

    this.writeJSON(
      this.storage.notes,
      this.state.notes
    );

    this.writeJSON(
      this.storage.answers,
      this.state.answers
    );

  }

};


/* Start the JobFlow engine */

JobFlow.init();