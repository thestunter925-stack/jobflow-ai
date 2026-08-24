/* =========================================
   JOBFLOW AI — ATS & RESUME INTELLIGENCE
   ========================================= */

const ATSEngine = {

  sections: [
    "name",
    "email",
    "phone",
    "summary",
    "skills",
    "experience",
    "education"
  ],

  actionWords: [
    "built",
    "created",
    "developed",
    "designed",
    "implemented",
    "improved",
    "increased",
    "reduced",
    "managed",
    "led",
    "launched",
    "optimized",
    "automated",
    "analyzed",
    "delivered",
    "engineered",
    "deployed",
    "integrated",
    "maintained"
  ],

  weakWords: [
    "hardworking",
    "good",
    "nice",
    "responsible",
    "helped",
    "worked",
    "various",
    "things",
    "etc",
    "passionate",
    "motivated"
  ],

  normalize(text) {

    return String(text || "")
      .toLowerCase()
      .replace(/[^\w\s.+#-]/g, " ");

  },

  countWords(text) {

    return String(text || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length;

  },

  scanResume(resume, jobText = "") {

    const combined = [

      resume.name,
      resume.title,
      resume.summary,
      resume.skills,
      resume.experience,
      resume.education

    ].join(" ");

    const text =
      this.normalize(combined);

    const job =
      this.normalize(jobText);

    const report = {

      score: 0,

      sections: {
        completed: [],
        missing: []
      },

      keywords: {
        matched: [],
        missing: []
      },

      quality: {
        actionWords: [],
        weakWords: []
      },

      recommendations: []

    };


    /* -------------------------------------
       SECTION CHECK
       ------------------------------------- */

    this.sections.forEach(
      section => {

        const value =
          resume[section];

        if (
          value &&
          String(value)
            .trim()
            .length > 2
        ) {

          report.sections
            .completed
            .push(section);

        } else {

          report.sections
            .missing
            .push(section);

        }

      }
    );


    /* -------------------------------------
       JOB KEYWORD MATCHING
       ------------------------------------- */

    if (job) {

      const jobWords =
        job
          .split(/\s+/)
          .filter(
            word =>
              word.length >= 4
          );

      const uniqueWords =
        [...new Set(jobWords)];

      uniqueWords.forEach(
        word => {

          if (
            text.includes(word)
          ) {

            report.keywords
              .matched
              .push(word);

          }

        }
      );

      report.keywords.matched =
        [
          ...new Set(
            report.keywords.matched
          )
        ];

      const importantWords =
        uniqueWords.filter(
          word =>
            ![
              "with",
              "this",
              "that",
              "have",
              "will",
              "from",
              "your",
              "their",
              "they",
              "into",
              "about",
              "using",
              "work",
              "team",
              "role",
              "company",
              "years",
              "year",
              "experience"
            ].includes(word)
        );

      report.keywords.missing =
        importantWords
          .filter(
            word =>
              !text.includes(word)
          )
          .slice(0,30);

    }


    /* -------------------------------------
       ACTION WORD QUALITY
       ------------------------------------- */

    this.actionWords.forEach(
      word => {

        if (
          text.includes(word)
        ) {

          report.quality
            .actionWords
            .push(word);

        }

      }
    );


    /* -------------------------------------
       WEAK WORD DETECTION
       ------------------------------------- */

    this.weakWords.forEach(
      word => {

        if (
          text.includes(word)
        ) {

          report.quality
            .weakWords
            .push(word);

        }

      }
    );


    /* -------------------------------------
       RECOMMENDATIONS
       ------------------------------------- */

    if (
      report.sections.missing
        .length
    ) {

      report.recommendations.push(
        "Complete all important resume sections."
      );

    }

    if (
      this.countWords(
        resume.summary
      ) < 25
    ) {

      report.recommendations.push(
        "Expand your professional summary with your strongest skills and target role."
      );

    }

    if (
      report.quality.actionWords
        .length < 3
    ) {

      report.recommendations.push(
        "Use stronger action verbs such as built, developed, implemented and improved."
      );

    }

    if (
      report.quality.weakWords
        .length
    ) {

      report.recommendations.push(
        "Replace vague words with specific achievements and evidence."
      );

    }

    if (
      resume.experience &&
      this.countWords(
        resume.experience
      ) < 30
    ) {

      report.recommendations.push(
        "Add more detail to your experience section."
      );

    }

    if (
      job &&
      report.keywords.missing
        .length > 8
    ) {

      report.recommendations.push(
        "Tailor your resume to the target job using relevant keywords you genuinely possess."
      );

    }


    /* -------------------------------------
       FINAL SCORE
       ------------------------------------- */

    let score = 0;


    /* Sections: 35 points */

    score +=
      Math.round(
        report.sections.completed
          .length /
        this.sections.length *
        35
      );


    /* Summary: 10 points */

    if (
      this.countWords(
        resume.summary
      ) >= 25
    ) {

      score += 10;

    } else if (
      this.countWords(
        resume.summary
      ) >= 10
    ) {

      score += 5;

    }


    /* Experience: 15 points */

    if (
      this.countWords(
        resume.experience
      ) >= 50
    ) {

      score += 15;

    } else if (
      this.countWords(
        resume.experience
      ) >= 25
    ) {

      score += 8;

    }


    /* Action words: 15 points */

    score +=
      Math.min(
        report.quality
          .actionWords
          .length * 3,
        15
      );


    /* Keywords: 25 points */

    if (job) {

      const matched =
        report.keywords
          .matched
          .length;

      const total =
        matched +
        report.keywords
          .missing
          .length;

      if (total) {

        score +=
          Math.round(
            matched /
            total *
            25
          );

      }

    } else {

      score += 15;

    }


    report.score =
      Math.min(
        score,
        100
      );


    return report;

  },


  getGrade(score) {

    if (score >= 90) {

      return {
        grade: "A+",
        label: "Excellent"
      };

    }

    if (score >= 80) {

      return {
        grade: "A",
        label: "Strong"
      };

    }

    if (score >= 70) {

      return {
        grade: "B",
        label: "Good"
      };

    }

    if (score >= 60) {

      return {
        grade: "C",
        label: "Needs Work"
      };

    }

    return {

      grade: "D",
      label: "Major Improvements Needed"

    };

  },


  generateSummary(report) {

    const grade =
      this.getGrade(
        report.score
      );

    return {

      score:
        report.score,

      grade:
        grade.grade,

      label:
        grade.label,

      missingSections:
        report.sections.missing,

      matchedKeywords:
        report.keywords.matched,

      missingKeywords:
        report.keywords.missing,

      recommendations:
        report.recommendations

    };

  },


  checkBullet(text) {

    const value =
      this.normalize(text);

    const words =
      this.countWords(text);

    const actions =
      this.actionWords.filter(
        word =>
          value.includes(word)
      );

    const hasNumber =
      /\d+%?|\$[\d,]+|₹[\d,]+/
        .test(text);

    return {

      wordCount:
        words,

      actionWords:
        actions,

      hasMetric:
        hasNumber,

      strong:
        actions.length > 0 &&
        hasNumber

    };

  },


  improveBullet(text) {

    const result =
      this.checkBullet(text);

    let message =
      "Make this achievement more specific.";

    if (
      result.actionWords.length === 0
    ) {

      message =
        "Start with a strong action verb such as Developed, Built, Implemented or Improved.";

    } else if (
      !result.hasMetric
    ) {

      message =
        "Add a measurable result such as percentage, time saved, users, revenue or performance improvement.";

    } else if (
      result.wordCount < 8
    ) {

      message =
        "Add enough context to explain what you did and why it mattered.";

    } else {

      message =
        "This bullet has a strong structure. Keep it concise and evidence-based.";

    }

    return {

      original:
        text,

      strong:
        result.strong,

      advice:
        message

    };

  }

};


console.log(
  "JobFlow ATS Intelligence loaded."
);