/* =========================================
   JOBFLOW JOB ENGINE
   India + International Job Search
========================================= */

"use strict";

const JobFlowJobs = {

  maxResults: 50,

  jobs: [],

  filters: {
    keyword: "",
    location: "",
    type: "all",
    workMode: "all"
  },


  /* =====================================
     SEARCH
  ===================================== */

  async search(options = {}) {

    this.filters = {
      keyword:
        options.keyword || "",

      location:
        options.location || "",

      type:
        options.type || "all",

      workMode:
        options.workMode || "all"
    };


    this.showLoading();


    try {

      const jobs =
        await this.loadJobs();


      const filtered =
        this.filterJobs(
          jobs
        );


      this.jobs =
        filtered
          .slice(
            0,
            this.maxResults
          );


      this.render(
        this.jobs
      );


      return this.jobs;


    } catch(error) {

      console.error(
        "JobFlow job search:",
        error
      );


      this.showError();

      return [];

    }

  },


  /* =====================================
     LOAD JOBS
  ===================================== */

  async loadJobs() {

    /*
      Demo/initial sources.

      Replace/add approved APIs and
      company career feeds here.
    */

    const sources = [

      this.loadGreenhouseJobs()

    ];


    const results =
      await Promise.allSettled(
        sources
      );


    let jobs = [];


    results.forEach(
      result => {

        if(
          result.status ===
          "fulfilled"
        ) {

          jobs =
            jobs.concat(
              result.value || []
            );

        }

      }
    );


    return this.removeDuplicates(
      jobs
    );

  },


  /* =====================================
     GREENHOUSE
  ===================================== */

  async loadGreenhouseJobs() {

    /*
      Public Greenhouse boards.

      Add companies here whose public
      job boards you want to aggregate.
    */

    const boards = [

      {
        company: "Example Company",
        token: "example"
      }

    ];


    const all = [];


    for(
      const board of boards
    ) {

      try {

        const response =
          await fetch(
            "https://boards-api.greenhouse.io/v1/boards/" +
            encodeURIComponent(
              board.token
            ) +
            "/jobs?content=true"
          );


        if(!response.ok)
          continue;


        const data =
          await response.json();


        (data.jobs || [])
          .forEach(
            job => {

              all.push(
                this.normalizeGreenhouseJob(
                  job,
                  board.company
                )
              );

            }
          );


      } catch(error) {

        console.warn(
          "Greenhouse source failed:",
          board.company
        );

      }

    }


    return all;

  },


  /* =====================================
     NORMALIZE GREENHOUSE JOB
  ===================================== */

  normalizeGreenhouseJob(
    job,
    fallbackCompany
  ) {

    const location =
      job.location?.name ||
      "India / International";


    return {

      id:
        "gh_" +
        job.id,

      title:
        job.title ||
        "Job",

      company:
        fallbackCompany ||
        "Company",

      location:
        location,

      description:
        job.content ||
        "",

      type:
        "Full-time",

      workMode:
        this.detectWorkMode(
          job.content ||
          ""
        ),

      source:
        "Greenhouse",

      applyUrl:
        job.absolute_url ||
        "#",

      official:
        true,

      postedAt:
        job.updated_at ||
        "",

      skills:
        this.extractSkills(
          job.content ||
          ""
        )

    };

  },


  /* =====================================
     FILTER
  ===================================== */

  filterJobs(
    jobs
  ) {

    const keyword =
      this.filters.keyword
        .toLowerCase()
        .trim();


    const location =
      this.filters.location
        .toLowerCase()
        .trim();


    return jobs.filter(
      job => {

        const searchable = (

          job.title +
          " " +
          job.company +
          " " +
          job.location +
          " " +
          job.description +
          " " +
          job.skills.join(" ")

        ).toLowerCase();


        const keywordMatch =
          !keyword ||
          searchable.includes(
            keyword
          );


        const locationMatch =
          !location ||
          location === "all" ||
          searchable.includes(
            location
          );


        const typeMatch =
          this.filters.type ===
          "all" ||
          job.type
            .toLowerCase()
            .includes(
              this.filters.type
            );


        const modeMatch =
          this.filters.workMode ===
          "all" ||
          job.workMode
            .toLowerCase()
            .includes(
              this.filters.workMode
            );


        return (
          keywordMatch &&
          locationMatch &&
          typeMatch &&
          modeMatch
        );

      }
    );

  },


  /* =====================================
     REMOVE DUPLICATES
  ===================================== */

  removeDuplicates(
    jobs
  ) {

    const map =
      new Map();


    jobs.forEach(
      job => {

        const key =
          (
            job.company +
            "|" +
            job.title +
            "|" +
            job.location
          )
          .toLowerCase();


        if(
          !map.has(key)
        ) {

          map.set(
            key,
            job
          );

        }

      }
    );


    return Array.from(
      map.values()
    );

  },


  /* =====================================
     DETECT WORK MODE
  ===================================== */

  detectWorkMode(
    text
  ) {

    const value =
      text.toLowerCase();


    if(
      value.includes(
        "remote"
      )
    ) {

      return "Remote";

    }


    if(
      value.includes(
        "hybrid"
      )
    ) {

      return "Hybrid";

    }


    return "On-site";

  },


  /* =====================================
     EXTRACT SKILLS
  ===================================== */

  extractSkills(
    text
  ) {

    const skills = [

      "JavaScript",
      "Python",
      "Java",
      "C++",
      "C#",
      "React",
      "Node.js",
      "SQL",
      "AWS",
      "Azure",
      "Machine Learning",
      "AI",
      "Data Science",
      "Mechanical Engineering",
      "CAD",
      "AutoCAD",
      "SolidWorks",
      "Marketing",
      "Sales"

    ];


    const value =
      text.toLowerCase();


    return skills.filter(
      skill =>
        value.includes(
          skill.toLowerCase()
        )
    );

  },


  /* =====================================
     RENDER
  ===================================== */

  render(
    jobs
  ) {

    const box =
      document.getElementById(
        "jobResults"
      );


    if(!box)
      return;


    if(!jobs.length) {

      box.innerHTML = `
        <div class="card">
          <div class="empty">
            <h3>No matching jobs found</h3>
            <p>
              Try another skill,
              location or job type.
            </p>
          </div>
        </div>
      `;

      return;

    }


    box.innerHTML = `

      <div
        style="
          display:grid;
          gap:14px;
        "
      >

        ${jobs.map(
          job =>
            this.jobCard(
              job
            )
        ).join("")}

      </div>

    `;

  },


  /* =====================================
     JOB CARD
  ===================================== */

  jobCard(
    job
  ) {

    return `

      <article
        class="card"
        style="
          border-left:4px solid #2563eb;
        "
      >

        <div
          style="
            display:flex;
            justify-content:space-between;
            gap:12px;
            flex-wrap:wrap;
          "
        >

          <div>

            <h3>
              ${this.escape(
                job.title
              )}
            </h3>

            <div
              class="muted"
              style="
                margin-top:6px;
              "
            >
              🏢
              ${this.escape(
                job.company
              )}
            </div>

          </div>


          <span
            class="badge badge-blue"
          >
            ${this.escape(
              job.workMode
            )}
          </span>

        </div>


        <div
          style="
            margin-top:12px;
            line-height:1.8;
          "
        >

          📍
          ${this.escape(
            job.location
          )}

          <br>

          💼
          ${this.escape(
            job.type
          )}

        </div>


        ${
          job.skills.length
          ?
          `
          <div
            style="
              display:flex;
              flex-wrap:wrap;
              gap:6px;
              margin-top:12px;
            "
          >

            ${job.skills
              .slice(0,6)
              .map(
                skill =>
                  `
                  <span
                    class="badge"
                  >
                    ${this.escape(
                      skill
                    )}
                  </span>
                  `
              )
              .join("")}

          </div>
          `
          :
          ""
        }


        <div
          class="actions"
        >

          <a
            href="${this.escape(
              job.applyUrl
            )}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-blue"
            style="
              text-decoration:none;
            "
          >
            View & Apply
          </a>


          <button
            class="btn btn-light"
            onclick='JobFlowJobs.saveJob(
              ${JSON.stringify(
                job
              ).replace(
                /'/g,
                "&#39;"
              )}
            )'
          >
            ☆ Save Job
          </button>


          <button
            class="btn btn-light"
            onclick='JobFlowJobs.matchResume(
              ${JSON.stringify(
                job
              ).replace(
                /'/g,
                "&#39;"
              )}
            )'
          >
            ⭐ Match Resume
          </button>

        </div>


        <div
          style="
            margin-top:10px;
            font-size:11px;
            color:#94a3b8;
          "
        >
          Source:
          ${this.escape(
            job.source
          )}
          · Official application link
        </div>

      </article>

    `;

  },


  /* =====================================
     SAVE JOB
  ===================================== */

  saveJob(
    job
  ) {

    const key =
      "jobflow_saved_jobs";


    const saved =
      JSON.parse(
        localStorage.getItem(
          key
        ) ||
        "[]"
      );


    const exists =
      saved.some(
        item =>
          item.id ===
          job.id
      );


    if(exists) {

      this.toast(
        "Job already saved."
      );

      return;

    }


    saved.unshift(
      {
        ...job,
        savedAt:
          new Date()
            .toISOString()
      }
    );


    localStorage.setItem(
      key,
      JSON.stringify(
        saved
      )
    );


    this.toast(
      "Job saved."
    );

  },


  /* =====================================
     RESUME MATCH
  ===================================== */

  matchResume(
    job
  ) {

    const resume =
      JSON.parse(
        localStorage.getItem(
          "jobflow_resume"
        ) ||
        "{}"
      );


    const resumeText =
      JSON.stringify(
        resume
      ).toLowerCase();


    const skills =
      job.skills || [];


    let matched = 0;


    skills.forEach(
      skill => {

        if(
          resumeText.includes(
            skill.toLowerCase()
          )
        ) {

          matched++;

        }

      }
    );


    const score =
      skills.length
      ?
        Math.round(
          (
            matched /
            skills.length
          ) *
          100
        )
      :
        0;


    this.toast(
      "Resume match: " +
      score +
      "%"
    );


    return score;

  },


  /* =====================================
     LOADING
  ===================================== */

  showLoading() {

    const box =
      document.getElementById(
        "jobResults"
      );


    if(!box)
      return;


    box.innerHTML = `

      <div class="card">

        <div
          class="empty"
        >
          🔎 Finding matching jobs...
        </div>

      </div>

    `;

  },


  /* =====================================
     ERROR
  ===================================== */

  showError() {

    const box =
      document.getElementById(
        "jobResults"
      );


    if(!box)
      return;


    box.innerHTML = `

      <div class="card">

        <div
          class="empty"
        >

          ⚠️ Job sources are
          temporarily unavailable.

          <br><br>

          Please try again.

        </div>

      </div>

    `;

  },


  /* =====================================
     TOAST
  ===================================== */

  toast(
    message
  ) {

    if(
      typeof window.toast ===
      "function"
    ) {

      window.toast(
        message
      );

    } else {

      alert(
        message
      );

    }

  },


  /* =====================================
     ESCAPE
  ===================================== */

  escape(
    value
  ) {

    return String(
      value || ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );

  }

};


/* =========================================
   CONNECT TO EXISTING SEARCH BUTTON
========================================= */

window.searchJobs =
function() {

  const keyword =
    document.getElementById(
      "jobSearch"
    )?.value || "";


  const location =
    document.getElementById(
      "jobLocation"
    )?.value || "";


  JobFlowJobs.search({

    keyword:
      keyword,

    location:
      location,

    type:
      "all",

    workMode:
      "all"

  });

};


/* =========================================
   INITIALIZE
========================================= */

console.log(
  "JobFlow Job Engine loaded."
);