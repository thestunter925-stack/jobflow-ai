/* =========================================
   JOBFLOW AI — ANALYTICS ENGINE
   ========================================= */

const AnalyticsEngine = {

  stages: [
    "Saved",
    "Applied",
    "Screening",
    "Interview",
    "Final Round",
    "Offer",
    "Rejected"
  ],


  count(applications, status) {

    return applications.filter(
      item =>
        item.status === status
    ).length;

  },


  calculateFunnel(applications) {

    const saved =
      this.count(
        applications,
        "Saved"
      );

    const applied =
      this.count(
        applications,
        "Applied"
      );

    const screening =
      this.count(
        applications,
        "Screening"
      );

    const interview =
      this.count(
        applications,
        "Interview"
      );

    const finalRound =
      this.count(
        applications,
        "Final Round"
      );

    const offer =
      this.count(
        applications,
        "Offer"
      );

    const rejected =
      this.count(
        applications,
        "Rejected"
      );


    return {

      saved:
        saved,

      applied:
        applied,

      screening:
        screening,

      interview:
        interview,

      finalRound:
        finalRound,

      offer:
        offer,

      rejected:
        rejected,

      total:
        applications.length

    };

  },


  percentage(
    part,
    total
  ) {

    if (!total) {

      return 0;

    }

    return Math.round(
      part /
      total *
      100
    );

  },


  conversionRates(
    applications
  ) {

    const funnel =
      this.calculateFunnel(
        applications
      );


    const active =
      funnel.applied +
      funnel.screening +
      funnel.interview +
      funnel.finalRound +
      funnel.offer;


    return {

      applicationToInterview:
        this.percentage(
          funnel.interview +
          funnel.finalRound +
          funnel.offer,
          active
        ),

      interviewToOffer:
        this.percentage(
          funnel.offer,
          funnel.interview +
          funnel.finalRound
        ),

      applicationToOffer:
        this.percentage(
          funnel.offer,
          active
        ),

      rejectionRate:
        this.percentage(
          funnel.rejected,
          applications.length
        )

    };

  },


  getTimeline(
    applications
  ) {

    const timeline = {};


    applications.forEach(
      item => {

        if (
          !item.createdAt
        ) {

          return;

        }


        const date =
          new Date(
            item.createdAt
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return;

        }


        const key =
          date.toISOString()
            .slice(0,10);


        if (
          !timeline[key]
        ) {

          timeline[key] = {

            date:
              key,

            total:
              0,

            applications:
              0,

            interviews:
              0,

            offers:
              0,

            rejected:
              0

          };

        }


        timeline[key].total++;


        if (
          item.status ===
          "Applied"
        ) {

          timeline[key]
            .applications++;

        }


        if (
          item.status ===
          "Interview" ||
          item.status ===
          "Final Round"
        ) {

          timeline[key]
            .interviews++;

        }


        if (
          item.status ===
          "Offer"
        ) {

          timeline[key]
            .offers++;

        }


        if (
          item.status ===
          "Rejected"
        ) {

          timeline[key]
            .rejected++;

        }

      }
    );


    return Object.values(
      timeline
    ).sort(
      (a,b) =>
        a.date.localeCompare(
          b.date
        )
    );

  },


  getWeeklyStats(
    applications
  ) {

    const now =
      new Date();


    const weeks = [];


    for (
      let i = 7;
      i >= 0;
      i--
    ) {

      const end =
        new Date(now);

      end.setDate(
        now.getDate() -
        i * 7
      );


      const start =
        new Date(end);

      start.setDate(
        end.getDate() -
        6
      );


      const items =
        applications.filter(
          item => {

            const date =
              new Date(
                item.createdAt
              );

            return (
              date >= start &&
              date <= end
            );

          }
        );


      weeks.push({

        week:
          "Week " +
          (8-i),

        start:
          start
            .toISOString()
            .slice(0,10),

        end:
          end
            .toISOString()
            .slice(0,10),

        total:
          items.length,

        interviews:
          items.filter(
            x =>
              x.status ===
              "Interview" ||
              x.status ===
              "Final Round"
          ).length,

        offers:
          items.filter(
            x =>
              x.status ===
              "Offer"
          ).length

      });

    }


    return weeks;

  },


  getMonthlyStats(
    applications
  ) {

    const months = {};


    applications.forEach(
      item => {

        const date =
          new Date(
            item.createdAt
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return;

        }


        const key =
          date.getFullYear() +
          "-" +
          String(
            date.getMonth()+1
          ).padStart(
            2,
            "0"
          );


        if (
          !months[key]
        ) {

          months[key] = {

            month:
              key,

            applications:
              0,

            interviews:
              0,

            offers:
              0,

            rejected:
              0

          };

        }


        months[key]
          .applications++;


        if (
          item.status ===
          "Interview" ||
          item.status ===
          "Final Round"
        ) {

          months[key]
            .interviews++;

        }


        if (
          item.status ===
          "Offer"
        ) {

          months[key]
            .offers++;

        }


        if (
          item.status ===
          "Rejected"
        ) {

          months[key]
            .rejected++;

        }

      }
    );


    return Object.values(
      months
    ).sort(
      (a,b) =>
        a.month.localeCompare(
          b.month
        )
    );

  },


  getPriorityStats(
    applications
  ) {

    const result = {

      Low: 0,
      Medium: 0,
      High: 0,
      Urgent: 0

    };


    applications.forEach(
      item => {

        if (
          result[
            item.priority
          ] !== undefined
        ) {

          result[
            item.priority
          ]++;

        }

      }
    );


    return result;

  },


  getSourceStats(
    applications
  ) {

    const result = {};


    applications.forEach(
      item => {

        const source =
          item.source ||
          "Other";


        result[source] =
          (
            result[source] ||
            0
          ) + 1;

      }
    );


    return Object.keys(
      result
    )
      .map(
        source => ({

          source:
            source,

          count:
            result[source]

        })
      )
      .sort(
        (a,b) =>
          b.count -
          a.count
      );

  },


  getLocationStats(
    applications
  ) {

    const result = {};


    applications.forEach(
      item => {

        const location =
          item.location ||
          "Not specified";


        result[location] =
          (
            result[location] ||
            0
          ) + 1;

      }
    );


    return Object.keys(
      result
    )
      .map(
        location => ({

          location:
            location,

          count:
            result[location]

        })
      )
      .sort(
        (a,b) =>
          b.count -
          a.count
      );

  },


  getSalaryStats(
    applications
  ) {

    const values = [];


    applications.forEach(
      item => {

        if (
          !item.salary
        ) {

          return;

        }


        const numbers =
          String(
            item.salary
          )
            .replace(
              /,/g,
              ""
            )
            .match(
              /\d+(?:\.\d+)?/g
            );


        if (
          numbers &&
          numbers.length
        ) {

          values.push(
            Number(
              numbers[0]
            )
          );

        }

      }
    );


    if (!values.length) {

      return {

        count: 0,
        minimum: 0,
        maximum: 0,
        average: 0

      };

    }


    const total =
      values.reduce(
        (sum,value) =>
          sum + value,
        0
      );


    return {

      count:
        values.length,

      minimum:
        Math.min(
          ...values
        ),

      maximum:
        Math.max(
          ...values
        ),

      average:
        Math.round(
          total /
          values.length
        )

    };

  },


  getTopCompanies(
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

            company:
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
    )
      .sort(
        (a,b) =>
          b.applications -
          a.applications
      )
      .slice(
        0,
        10
      );

  },


  getInsights(
    applications
  ) {

    const insights = [];


    if (
      !applications.length
    ) {

      return [

        "Add your first job application to start generating career insights."

      ];

    }


    const rates =
      this.conversionRates(
        applications
      );


    const source =
      this.getSourceStats(
        applications
      );


    const priority =
      this.getPriorityStats(
        applications
      );


    if (
      rates.applicationToInterview >= 30
    ) {

      insights.push(
        "Your application-to-interview conversion is strong."
      );

    } else {

      insights.push(
        "Improve job targeting and resume tailoring to increase interview conversions."
      );

    }


    if (
      rates.interviewToOffer >= 30
    ) {

      insights.push(
        "Your interview-to-offer conversion is healthy."
      );

    } else {

      insights.push(
        "More interview practice could improve your offer conversion."
      );

    }


    if (
      priority.Urgent +
      priority.High >
      0
    ) {

      insights.push(
        "You have high-priority applications that should receive follow-up attention."
      );

    }


    if (
      source.length
    ) {

      insights.push(
        "Your most-used job source is " +
        source[0].source +
        "."
      );

    }


    const overdue =
      applications.filter(
        item => {

          if (
            !item.followUpDate
          ) {

            return false;

          }


          return (
            new Date(
              item.followUpDate
            ) <
            new Date()
          );

        }
      ).length;


    if (
      overdue
    ) {

      insights.push(
        "You have " +
        overdue +
        " overdue follow-up" +
        (
          overdue === 1
            ? ""
            : "s"
        ) +
        "."
      );

    }


    return insights;

  },


  generateReport(
    applications
  ) {

    return {

      generatedAt:
        new Date()
          .toISOString(),

      funnel:
        this.calculateFunnel(
          applications
        ),

      conversion:
        this.conversionRates(
          applications
        ),

      timeline:
        this.getTimeline(
          applications
        ),

      weekly:
        this.getWeeklyStats(
          applications
        ),

      monthly:
        this.getMonthlyStats(
          applications
        ),

      priority:
        this.getPriorityStats(
          applications
        ),

      sources:
        this.getSourceStats(
          applications
        ),

      locations:
        this.getLocationStats(
          applications
        ),

      salary:
        this.getSalaryStats(
          applications
        ),

      companies:
        this.getTopCompanies(
          applications
        ),

      insights:
        this.getInsights(
          applications
        )

    };

  }

};


console.log(
  "JobFlow Analytics Engine loaded."
);