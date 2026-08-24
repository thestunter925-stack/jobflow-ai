/* =========================================
   JOBFLOW AI — APPLICATION ENGINE
   ========================================= */

const ApplicationEngine = {

  stages: [
    "Saved",
    "Applied",
    "Screening",
    "Interview",
    "Final Round",
    "Offer",
    "Rejected"
  ],

  priorities: [
    "Low",
    "Medium",
    "High",
    "Urgent"
  ],


  normalize(value) {

    return String(value || "")
      .toLowerCase()
      .trim();

  },


  create(data = {}) {

    return {

      id:
        data.id ||
        Date.now(),

      company:
        data.company || "",

      role:
        data.role || "",

      location:
        data.location || "",

      link:
        data.link || "",

      salary:
        data.salary || "",

      source:
        data.source || "Other",

      status:
        this.stages.includes(
          data.status
        )
          ? data.status
          : "Saved",

      priority:
        this.priorities.includes(
          data.priority
        )
          ? data.priority
          : "Medium",

      notes:
        data.notes || "",

      contact:
        data.contact || "",

      email:
        data.email || "",

      appliedDate:
        data.appliedDate || "",

      followUpDate:
        data.followUpDate || "",

      interviewDate:
        data.interviewDate || "",

      createdAt:
        data.createdAt ||
        new Date()
          .toISOString(),

      updatedAt:
        new Date()
          .toISOString()

    };

  },


  update(application, changes = {}) {

    Object.keys(changes)
      .forEach(key => {

        if (
          changes[key] !==
          undefined
        ) {

          application[key] =
            changes[key];

        }

      });

    application.updatedAt =
      new Date()
        .toISOString();

    return application;

  },


  changeStage(
    application,
    stage
  ) {

    if (
      !this.stages.includes(
        stage
      )
    ) {

      return false;

    }

    application.status =
      stage;

    application.updatedAt =
      new Date()
        .toISOString();

    return true;

  },


  setPriority(
    application,
    priority
  ) {

    if (
      !this.priorities.includes(
        priority
      )
    ) {

      return false;

    }

    application.priority =
      priority;

    application.updatedAt =
      new Date()
        .toISOString();

    return true;

  },


  search(
    applications,
    query
  ) {

    const q =
      this.normalize(
        query
      );

    if (!q) {

      return applications;

    }

    return applications.filter(
      item => {

        const text = [

          item.company,
          item.role,
          item.location,
          item.source,
          item.status,
          item.priority,
          item.contact,
          item.notes

        ]
          .join(" ")
          .toLowerCase();

        return text.includes(q);

      }
    );

  },


  filter(
    applications,
    options = {}
  ) {

    return applications.filter(
      item => {

        if (
          options.status &&
          item.status !==
          options.status
        ) {

          return false;

        }

        if (
          options.priority &&
          item.priority !==
          options.priority
        ) {

          return false;

        }

        if (
          options.source &&
          item.source !==
          options.source
        ) {

          return false;

        }

        return true;

      }
    );

  },


  sort(
    applications,
    sortBy = "updated"
  ) {

    const list =
      [...applications];

    if (
      sortBy ===
      "company"
    ) {

      return list.sort(
        (a,b) =>
          String(a.company)
            .localeCompare(
              String(b.company)
            )
      );

    }


    if (
      sortBy ===
      "priority"
    ) {

      const order = {

        Urgent: 4,
        High: 3,
        Medium: 2,
        Low: 1

      };

      return list.sort(
        (a,b) =>
          (
            order[b.priority] || 0
          ) -
          (
            order[a.priority] || 0
          )
      );

    }


    if (
      sortBy ===
      "oldest"
    ) {

      return list.sort(
        (a,b) =>
          new Date(
            a.createdAt
          ) -
          new Date(
            b.createdAt
          )
      );

    }


    return list.sort(
      (a,b) =>
        new Date(
          b.updatedAt ||
          b.createdAt
        ) -
        new Date(
          a.updatedAt ||
          a.createdAt
        )
    );

  },


  getPipeline(
    applications
  ) {

    const pipeline = {};

    this.stages.forEach(
      stage => {

        pipeline[stage] =
          applications.filter(
            item =>
              item.status ===
              stage
          );

      }
    );

    return pipeline;

  },


  getStats(
    applications
  ) {

    const total =
      applications.length;

    const count =
      stage =>
        applications.filter(
          item =>
            item.status ===
            stage
        ).length;


    const applied =
      count("Applied") +
      count("Screening") +
      count("Interview") +
      count("Final Round") +
      count("Offer");


    const interviews =
      count("Interview") +
      count("Final Round");


    const offers =
      count("Offer");


    const rejected =
      count("Rejected");


    const responseRate =
      applied > 0
        ? Math.round(
            (
              interviews +
              offers +
              rejected
            ) /
            applied *
            100
          )
        : 0;


    const interviewRate =
      applied > 0
        ? Math.round(
            interviews /
            applied *
            100
          )
        : 0;


    const offerRate =
      applied > 0
        ? Math.round(
            offers /
            applied *
            100
          )
        : 0;


    return {

      total:
        total,

      saved:
        count("Saved"),

      applied:
        count("Applied"),

      screening:
        count("Screening"),

      interviews:
        interviews,

      finalRound:
        count("Final Round"),

      offers:
        offers,

      rejected:
        rejected,

      responseRate:
        responseRate,

      interviewRate:
        interviewRate,

      offerRate:
        offerRate

    };

  },


  isOverdue(
    application
  ) {

    if (
      !application.followUpDate
    ) {

      return false;

    }


    if (
      application.status ===
      "Rejected"
    ) {

      return false;

    }


    if (
      application.status ===
      "Offer"
    ) {

      return false;

    }


    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );


    const followUp =
      new Date(
        application.followUpDate
      );

    followUp.setHours(
      0,
      0,
      0,
      0
    );


    return (
      followUp < today
    );

  },


  isDueToday(
    application
  ) {

    if (
      !application.followUpDate
    ) {

      return false;

    }


    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );


    const date =
      new Date(
        application.followUpDate
      );

    date.setHours(
      0,
      0,
      0,
      0
    );


    return (
      date.getTime() ===
      today.getTime()
    );

  },


  getFollowUps(
    applications
  ) {

    return applications.filter(
      application =>
        this.isOverdue(
          application
        ) ||
        this.isDueToday(
          application
        )
    );

  },


  getUpcomingInterviews(
    applications
  ) {

    const now =
      new Date();


    return applications

      .filter(
        item =>
          item.interviewDate
      )

      .filter(
        item => {

          const date =
            new Date(
              item.interviewDate
            );

          return date >= now;

        }
      )

      .sort(
        (a,b) =>
          new Date(
            a.interviewDate
          ) -
          new Date(
            b.interviewDate
          )
      );

  },


  getHighPriority(
    applications
  ) {

    return applications.filter(
      item =>
        item.priority ===
        "High" ||
        item.priority ===
        "Urgent"
    );

  },


  getCompanyList(
    applications
  ) {

    const companies = {};

    applications.forEach(
      item => {

        const name =
          item.company ||
          "Unknown";

        if (
          !companies[name]
        ) {

          companies[name] = {

            name:
              name,

            applications:
              0,

            interviews:
              0,

            offers:
              0

          };

        }


        companies[name]
          .applications++;


        if (
          item.status ===
          "Interview" ||
          item.status ===
          "Final Round"
        ) {

          companies[name]
            .interviews++;

        }


        if (
          item.status ===
          "Offer"
        ) {

          companies[name]
            .offers++;

        }

      }
    );


    return Object.values(
      companies
    );

  },


  generateFollowUpMessage(
    application
  ) {

    const name =
      application.contact ||
      "Hiring Manager";

    const company =
      application.company ||
      "your company";

    const role =
      application.role ||
      "the position";


    return (

      "Hello " +
      name +
      ",\n\n" +

      "I wanted to follow up regarding my application for the " +
      role +
      " position at " +
      company +
      ". " +

      "I remain very interested in the opportunity and would be happy to provide any additional information.\n\n" +

      "Thank you for your time."

    );

  },


  getSources(
    applications
  ) {

    const sources = {};

    applications.forEach(
      item => {

        const source =
          item.source ||
          "Other";

        sources[source] =
          (
            sources[source] ||
            0
          ) + 1;

      }
    );

    return sources;

  },


  getBestSource(
    applications
  ) {

    const sources =
      this.getSources(
        applications
      );

    let best =
      null;

    let highest =
      0;

    Object.keys(
      sources
    ).forEach(
      source => {

        if (
          sources[source] >
          highest
        ) {

          highest =
            sources[source];

          best =
            source;

        }

      }
    );

    return {

      source:
        best,

      applications:
        highest

    };

  },


  exportApplications(
    applications
  ) {

    return JSON.stringify(
      applications,
      null,
      2
    );

  },


  importApplications(
    json
  ) {

    try {

      const data =
        JSON.parse(
          json
        );

      if (
        !Array.isArray(
          data
        )
      ) {

        throw new Error(
          "Invalid data"
        );

      }

      return data.map(
        item =>
          this.create(
            item
          )
      );

    } catch (error) {

      throw new Error(
        "Could not import applications."
      );

    }

  }

};


console.log(
  "JobFlow Application Engine loaded."
);