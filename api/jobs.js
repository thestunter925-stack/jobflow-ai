export default async function handler(req, res) {
  try {
    const keyword =
      String(req.query.keyword || "").trim();

    const location =
      String(req.query.location || "").trim();

    const page =
      Math.max(
        1,
        Number(req.query.page || 1)
      );

    const limit =
      Math.min(
        50,
        Math.max(
          1,
          Number(req.query.limit || 20)
        )
      );

    if (!keyword && !location) {
      return res.status(400).json({
        success: false,
        message:
          "Job title or location is required.",
        jobs: [],
        total: 0
      });
    }

    const results = [];

    /* ============================
       ADZUNA
    ============================ */

    const appId =
      process.env.ADZUNA_APP_ID;

    const appKey =
      process.env.ADZUNA_APP_KEY;

    if (appId && appKey) {

      const params =
        new URLSearchParams({
          app_id: appId,
          app_key: appKey,
          results_per_page:
            String(limit),
          what: keyword,
          where: location
        });

      const url =
        "https://api.adzuna.com/v1/api/jobs/in/search/" +
        page +
        "?" +
        params.toString();

      try {

        const response =
          await fetch(url);

        if (response.ok) {

          const data =
            await response.json();

          (data.results || []).forEach(
            job => {

              results.push({
                id:
                  "adzuna-" +
                  String(
                    job.id ||
                    Math.random()
                  ),

                title:
                  job.title || "",

                company:
                  job.company?.display_name ||
                  "",

                location:
                  job.location?.display_name ||
                  location,

                description:
                  job.description || "",

                url:
                  job.redirect_url || "",

                salaryMin:
                  job.salary_min || null,

                salaryMax:
                  job.salary_max || null,

                type:
                  job.contract_type || "",

                posted:
                  job.created || "",

                source:
                  "Adzuna"
              });

            }
          );

        }

      } catch (error) {

        console.error(
          "Adzuna error:",
          error
        );

      }

    }


    /* ============================
       REMOVE DUPLICATES
    ============================ */

    const unique =
      [];

    const seen =
      new Set();

    results.forEach(job => {

      const key =
        (
          job.title +
          "|" +
          job.company +
          "|" +
          job.location
        )
          .toLowerCase()
          .replace(
            /\s+/g,
            " "
          )
          .trim();

      if (!seen.has(key)) {

        seen.add(key);

        unique.push(job);

      }

    });


    return res.status(200).json({

      success: true,

      keyword,

      location,

      page,

      count:
        unique.length,

      total:
        unique.length,

      jobs:
        unique.slice(
          0,
          limit
        )

    });

  } catch (error) {

    console.error(
      "JobFlow API error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Job search service temporarily unavailable.",

      jobs: [],

      total: 0

    });

  }
}