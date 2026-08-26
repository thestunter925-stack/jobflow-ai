/* =========================================
   JOBFLOW JOB API
   Backend-ready job aggregation layer
========================================= */

"use strict";

const JobFlowAPI = {

  config: {
    adzuna: {
      appId: "",
      appKey: "",
      country: "in"
    },

    jooble: {
      apiKey: ""
    }
  },

  cache: new Map(),

  async search(options = {}) {

    const keyword =
      String(options.keyword || "").trim();

    const location =
      String(options.location || "").trim();

    const page =
      Number(options.page || 1);

    const limit =
      Math.min(
        Number(options.limit || 50),
        50
      );

    if (!keyword && !location) {
      return {
        jobs: [],
        total: 0,
        page: page
      };
    }

    const cacheKey =
      [
        keyword,
        location,
        page,
        limit
      ].join("|").toLowerCase();

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = {
      jobs: [],
      total: 0,
      page: page,
      sources: []
    };

    try {

      const adzuna =
        await this.searchAdzuna(
          keyword,
          location,
          page,
          limit
        );

      result.jobs =
        result.jobs.concat(
          adzuna.jobs
        );

      result.total +=
        adzuna.total;

      if (adzuna.jobs.length) {
        result.sources.push("Adzuna");
      }

    } catch (error) {

      console.warn(
        "Adzuna unavailable:",
        error.message
      );

    }


    try {

      const jooble =
        await this.searchJooble(
          keyword,
          location,
          page,
          limit
        );

      result.jobs =
        result.jobs.concat(
          jooble.jobs
        );

      result.total +=
        jooble.total;

      if (jooble.jobs.length) {
        result.sources.push("Jooble");
      }

    } catch (error) {

      console.warn(
        "Jooble unavailable:",
        error.message
      );

    }


    result.jobs =
      this.deduplicate(
        result.jobs
      ).slice(
        0,
        limit
      );


    this.cache.set(
      cacheKey,
      result
    );

    return result;
  },


  async searchAdzuna(
    keyword,
    location,
    page,
    limit
  ) {

    if (
      !this.config.adzuna.appId ||
      !this.config.adzuna.appKey
    ) {

      return {
        jobs: [],
        total: 0
      };

    }

    const params =
      new URLSearchParams({

        app_id:
          this.config.adzuna.appId,

        app_key:
          this.config.adzuna.appKey,

        results_per_page:
          String(limit),

        what:
          keyword,

        where:
          location,

        "content-type":
          "application/json"

      });


    const url =
      "https://api.adzuna.com/v1/api/jobs/" +
      this.config.adzuna.country +
      "/search/" +
      page +
      "?" +
      params.toString();


    const response =
      await fetch(url);


    if (!response.ok) {
      throw new Error(
        "Adzuna HTTP " +
        response.status
      );
    }


    const data =
      await response.json();


    return {

      total:
        Number(
          data.count || 0
        ),

      jobs:
        (data.results || [])
          .map(
            job =>
              this.normalizeAdzuna(
                job
              )
          )

    };

  },


  async searchJooble(
    keyword,
    location,
    page,
    limit
  ) {

    if (
      !this.config.jooble.apiKey
    ) {

      return {
        jobs: [],
        total: 0
      };

    }


    const url =
      "https://jooble.org/api/" +
      encodeURIComponent(
        this.config.jooble.apiKey
      );


    const response =
      await fetch(
        url,
        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              keywords:
                keyword,

              location:
                location,

              page:
                String(page),

              ResultOnPage:
                limit,

              companysearch:
                false

            })

        }
      );


    if (!response.ok) {
      throw new Error(
        "Jooble HTTP " +
        response.status
      );
    }


    const data =
      await response.json();


    return {

      total:
        Number(
          data.totalCount || 0
        ),

      jobs:
        (data.jobs || [])
          .map(
            job =>
              this.normalizeJooble(
                job
              )
          )

    };

  },


  normalizeAdzuna(job) {

    return {

      id:
        "adzuna_" +
        (
          job.id ||
          Date.now()
        ),

      title:
        job.title || "",

      company:
        job.company?.display_name ||
        "",

      location:
        job.location?.display_name ||
        "",

      description:
        job.description ||
        "",

      salaryMin:
        job.salary_min ||
        null,

      salaryMax:
        job.salary_max ||
        null,

      currency:
        job.salary_is_predicted
          ? "Estimated"
          : "",

      type:
        job.contract_type ||
        "",

      url:
        job.redirect_url ||
        "",

      source:
        "Adzuna",

      posted:
        job.created ||
        ""

    };

  },


  normalizeJooble(job) {

    return {

      id:
        "jooble_" +
        (
          job.id ||
          Date.now()
        ),

      title:
        job.title ||
        "",

      company:
        job.company ||
        "",

      location:
        job.location ||
        "",

      description:
        job.snippet ||
        "",

      salary:
        job.salary ||
        "",

      type:
        job.type ||
        "",

      url:
        job.link ||
        "",

      source:
        job.source ||
        "Jooble",

      posted:
        job.updated ||
        ""

    };

  },


  deduplicate(jobs) {

    const seen =
      new Set();

    return jobs.filter(
      job => {

        const key =
          (
            job.company +
            "|" +
            job.title +
            "|" +
            job.location
          )
          .toLowerCase()
          .replace(
            /\s+/g,
            " "
          )
          .trim();

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);

        return true;

      }
    );

  },


  clearCache() {
    this.cache.clear();
  }

};


console.log(
  "JobFlow Job API ready."
);