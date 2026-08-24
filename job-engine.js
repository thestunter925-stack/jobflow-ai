/* =========================================
   JOBFLOW AI — JOB INTELLIGENCE ENGINE
   ========================================= */

const JobEngine = {

  /* -----------------------------------------
     COMMON TECHNOLOGY & CAREER SKILLS
     ----------------------------------------- */

  skillDictionary: [

    "javascript",
    "typescript",
    "html",
    "css",
    "react",
    "angular",
    "vue",
    "node.js",
    "node",
    "express",
    "next.js",
    "python",
    "java",
    "c++",
    "c#",
    "php",
    "ruby",
    "go",
    "rust",

    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "redis",
    "firebase",

    "aws",
    "azure",
    "google cloud",
    "gcp",
    "docker",
    "kubernetes",
    "linux",
    "git",
    "github",
    "gitlab",

    "rest api",
    "rest",
    "graphql",
    "api",
    "microservices",

    "machine learning",
    "artificial intelligence",
    "ai",
    "data science",
    "data analysis",
    "tensorflow",
    "pytorch",

    "figma",
    "ui design",
    "ux design",

    "sales",
    "marketing",
    "seo",
    "content marketing",
    "digital marketing",
    "lead generation",

    "communication",
    "leadership",
    "teamwork",
    "problem solving",
    "project management",
    "time management"

  ],


  /* -----------------------------------------
     STOP WORDS
     ----------------------------------------- */

  stopWords: [

    "about",
    "after",
    "again",
    "also",
    "because",
    "being",
    "between",
    "could",
    "doing",
    "during",
    "from",
    "have",
    "having",
    "into",
    "more",
    "most",
    "other",
    "should",
    "their",
    "there",
    "these",
    "they",
    "this",
    "those",
    "through",
    "under",
    "using",
    "very",
    "what",
    "when",
    "where",
    "which",
    "while",
    "with",
    "would",
    "your",
    "you",

    "company",
    "role",
    "position",
    "candidate",
    "team",
    "work",
    "working",
    "experience",
    "years",
    "year",
    "job",
    "responsibilities",
    "required",
    "requirements",
    "preferred"

  ],


  normalize(text) {

    return String(text || "")
      .toLowerCase()
      .replace(
        /[^\w\s.+#-]/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  },


  words(text) {

    return this.normalize(
      text
    )
      .split(/\s+/)
      .filter(Boolean);

  },


  unique(items) {

    return [
      ...new Set(
        items
      )
    ];

  },


  /* -----------------------------------------
     EXTRACT SKILLS
     ----------------------------------------- */

  detectSkills(text) {

    const value =
      this.normalize(
        text
      );

    const found = [];


    this.skillDictionary
      .forEach(
        skill => {

          if (
            value.includes(
              skill.toLowerCase()
            )
          ) {

            found.push(
              skill
            );

          }

        }
      );


    return this.unique(
      found
    );

  },


  /* -----------------------------------------
     EXTRACT IMPORTANT WORDS
     ----------------------------------------- */

  extractKeywords(
    text,
    limit = 30
  ) {

    const words =
      this.words(
        text
      );


    const frequency = {};


    words.forEach(
      word => {

        if (
          word.length < 4
        ) {

          return;

        }


        if (
          this.stopWords
            .includes(word)
        ) {

          return;

        }


        frequency[word] =
          (
            frequency[word] ||
            0
          ) + 1;

      }
    );


    return Object.keys(
      frequency
    )
      .sort(
        (a,b) =>
          frequency[b] -
          frequency[a]
      )
      .slice(
        0,
        limit
      );

  },


  /* -----------------------------------------
     EXPERIENCE DETECTION
     ----------------------------------------- */

  detectExperience(
    text
  ) {

    const value =
      this.normalize(
        text
      );


    const matches =
      value.match(
        /(\d+)\+?\s*(?:years?|yrs?)/g
      ) || [];


    const numbers =
      matches
        .map(
          item => {

            const match =
              item.match(
                /\d+/
              );

            return match
              ? Number(
                  match[0]
                )
              : 0;

          }
        );


    return {

      mentioned:
        matches.length > 0,

      years:
        numbers.length
          ? Math.max(
              ...numbers
            )
          : 0

    };

  },


  /* -----------------------------------------
     JOB LEVEL DETECTION
     ----------------------------------------- */

  detectLevel(
    text
  ) {

    const value =
      this.normalize(
        text
      );


    if (
      /chief|cto|ceo|vp|vice president/
        .test(value)
    ) {

      return "Executive";

    }


    if (
      /director|head of|principal/
        .test(value)
    ) {

      return "Director";

    }


    if (
      /senior|sr\.|lead/
        .test(value)
    ) {

      return "Senior";

    }


    if (
      /junior|jr\.|entry level|fresher|graduate/
        .test(value)
    ) {

      return "Entry";

    }


    if (
      /manager/
        .test(value)
    ) {

      return "Manager";

    }


    return "Mid";

  },


  /* -----------------------------------------
     JOB TYPE
     ----------------------------------------- */

  detectWorkType(
    text
  ) {

    const value =
      this.normalize(
        text
      );


    const remote =
      /remote|work from home|wfh/
        .test(value);


    const hybrid =
      /hybrid/
        .test(value);


    const onsite =
      /on site|onsite|office/
        .test(value);


    if (
      remote &&
      hybrid
    ) {

      return "Remote / Hybrid";

    }


    if (remote) {

      return "Remote";

    }


    if (hybrid) {

      return "Hybrid";

    }


    if (onsite) {

      return "On-site";

    }


    return "Not specified";

  },


  /* -----------------------------------------
     JOB ANALYSIS
     ----------------------------------------- */

  analyze(
    description
  ) {

    const text =
      String(
        description || ""
      );


    const skills =
      this.detectSkills(
        text
      );


    const keywords =
      this.extractKeywords(
        text
      );


    const experience =
      this.detectExperience(
        text
      );


    const level =
      this.detectLevel(
        text
      );


    const workType =
      this.detectWorkType(
        text
      );


    const responsibilities =
      this.extractResponsibilities(
        text
      );


    return {

      text:
        text,

      skills:
        skills,

      keywords:
        keywords,

      experience:
        experience,

      level:
        level,

      workType:
        workType,

      responsibilities:
        responsibilities,

      skillCount:
        skills.length,

      keywordCount:
        keywords.length,

      analyzedAt:
        new Date()
          .toISOString()

    };

  },


  /* -----------------------------------------
     RESPONSIBILITY EXTRACTION
     ----------------------------------------- */

  extractResponsibilities(
    text
  ) {

    const lines =
      String(
        text || ""
      )
        .split(
          /\n+/
        )
        .map(
          line =>
            line
              .replace(
                /^[-•*]\s*/,
                ""
              )
              .trim()
        )
        .filter(Boolean);


    const triggerWords = [

      "develop",
      "build",
      "create",
      "design",
      "manage",
      "lead",
      "maintain",
      "implement",
      "analyze",
      "support",
      "collaborate",
      "deliver",
      "test",
      "optimize",
      "monitor"

    ];


    return lines
      .filter(
        line => {

          const value =
            line.toLowerCase();

          return triggerWords
            .some(
              word =>
                value.includes(
                  word
                )
            );

        }
      )
      .slice(
        0,
        20
      );

  },


  /* -----------------------------------------
     RESUME MATCHING
     ----------------------------------------- */

  matchResume(
    resume,
    job
  ) {

    const resumeText = [

      resume.name,
      resume.title,
      resume.summary,
      resume.skills,
      resume.experience,
      resume.education,
      resume.projects,
      resume.certifications

    ]
      .join(" ");


    const resumeSkills =
      this.detectSkills(
        resumeText
      );


    const jobSkills =
      job.skills ||
      this.detectSkills(
        job.text
      );


    const matched =
      jobSkills.filter(
        skill =>
          resumeSkills.includes(
            skill
          )
      );


    const missing =
      jobSkills.filter(
        skill =>
          !resumeSkills.includes(
            skill
          )
      );


    const skillScore =
      jobSkills.length
        ? Math.round(
            matched.length /
            jobSkills.length *
            100
          )
        : 0;


    const keywordMatches =
      (
        job.keywords ||
        []
      ).filter(
        keyword =>
          this.normalize(
            resumeText
          ).includes(
            keyword
          )
      );


    const keywordScore =
      job.keywords &&
      job.keywords.length
        ? Math.round(
            keywordMatches.length /
            job.keywords.length *
            100
          )
        : 0;


    const finalScore =
      Math.round(
        skillScore * 0.65 +
        keywordScore * 0.35
      );


    return {

      score:
        finalScore,

      skillScore:
        skillScore,

      keywordScore:
        keywordScore,

      matchedSkills:
        matched,

      missingSkills:
        missing,

      matchedKeywords:
        keywordMatches

    };

  },


  /* -----------------------------------------
     JOB QUALITY SCORE
     ----------------------------------------- */

  qualityScore(
    job
  ) {

    let score = 0;


    if (
      job.skills &&
      job.skills.length >= 3
    ) {

      score += 25;

    } else if (
      job.skills &&
      job.skills.length
    ) {

      score += 15;

    }


    if (
      job.experience &&
      job.experience.mentioned
    ) {

      score += 20;

    }


    if (
      job.responsibilities &&
      job.responsibilities.length >= 3
    ) {

      score += 25;

    } else if (
      job.responsibilities &&
      job.responsibilities.length
    ) {

      score += 15;

    }


    if (
      job.workType !==
      "Not specified"
    ) {

      score += 10;

    }


    if (
      job.keywords &&
      job.keywords.length >= 10
    ) {

      score += 20;

    }


    return Math.min(
      score,
      100
    );

  },


  /* -----------------------------------------
     RECOMMENDATIONS
     ----------------------------------------- */

  recommendations(
    match
  ) {

    const suggestions = [];


    if (
      match.score >= 85
    ) {

      suggestions.push(
        "Excellent match. Prioritize this application."
      );

    } else if (
      match.score >= 70
    ) {

      suggestions.push(
        "Strong match. Tailor your resume before applying."
      );

    } else if (
      match.score >= 50
    ) {

      suggestions.push(
        "Moderate match. Improve alignment with the job requirements."
      );

    } else {

      suggestions.push(
        "Low match. Consider whether this role fits your current skills."
      );

    }


    if (
      match.missingSkills.length
    ) {

      suggestions.push(
        "Review the missing skills and add only skills you genuinely have."
      );

    }


    if (
      match.keywordScore < 60
    ) {

      suggestions.push(
        "Use relevant terminology from the job description where it accurately reflects your experience."
      );

    }


    return suggestions;

  },


  /* -----------------------------------------
     FULL MATCH REPORT
     ----------------------------------------- */

  createMatchReport(
    resume,
    description
  ) {

    const job =
      this.analyze(
        description
      );


    const match =
      this.matchResume(
        resume,
        job
      );


    return {

      job:
        job,

      match:
        match,

      quality:
        this.qualityScore(
          job
        ),

      recommendations:
        this.recommendations(
          match
        ),

      createdAt:
        new Date()
          .toISOString()

    };

  },


  /* -----------------------------------------
     QUICK JOB SUMMARY
     ----------------------------------------- */

  summary(
    description
  ) {

    const job =
      this.analyze(
        description
      );


    return {

      skills:
        job.skills,

      experience:
        job.experience,

      level:
        job.level,

      workType:
        job.workType,

      responsibilities:
        job.responsibilities,

      keywords:
        job.keywords,

      quality:
        this.qualityScore(
          job
        )

    };

  }

};


console.log(
  "JobFlow Job Intelligence Engine loaded."
);