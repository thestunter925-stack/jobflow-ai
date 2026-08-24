/* =========================================
   JOBFLOW AI — CAREER INTELLIGENCE ENGINE
   ========================================= */

const CareerEngine = {

  roles: {

    frontend: {
      name: "Frontend Developer",
      skills: [
        "html",
        "css",
        "javascript",
        "react",
        "typescript",
        "git"
      ]
    },

    backend: {
      name: "Backend Developer",
      skills: [
        "node",
        "node.js",
        "python",
        "java",
        "sql",
        "api",
        "rest",
        "git"
      ]
    },

    fullstack: {
      name: "Full Stack Developer",
      skills: [
        "html",
        "css",
        "javascript",
        "react",
        "node",
        "sql",
        "api",
        "git"
      ]
    },

    data: {
      name: "Data Analyst",
      skills: [
        "python",
        "sql",
        "excel",
        "power bi"
      ]
    },

    ai: {
      name: "AI / ML Engineer",
      skills: [
        "python",
        "machine learning",
        "artificial intelligence",
        "sql"
      ]
    },

    mobile: {
      name: "Mobile Developer",
      skills: [
        "flutter",
        "android",
        "ios",
        "kotlin",
        "swift"
      ]
    },

    cloud: {
      name: "Cloud / DevOps Engineer",
      skills: [
        "aws",
        "azure",
        "docker",
        "kubernetes",
        "git"
      ]
    },

    product: {
      name: "Product / Technical Product Specialist",
      skills: [
        "communication",
        "analytics",
        "api",
        "sql",
        "figma"
      ]
    }

  },


  normalize(text) {

    return String(text || "")
      .toLowerCase()
      .replace(/[^\w\s.+#-]/g, " ");

  },


  detectSkills(text) {

    const value =
      this.normalize(text);

    const allSkills = [

      "html",
      "css",
      "javascript",
      "typescript",
      "react",
      "vue",
      "angular",
      "node",
      "node.js",
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

    return [
      ...new Set(
        allSkills.filter(
          skill =>
            value.includes(
              skill
            )
        )
      )
    ];

  },


  detectSeniority(text) {

    const value =
      this.normalize(text);

    if (
      /senior|lead|principal|staff/
        .test(value)
    ) {

      return "Senior";

    }

    if (
      /mid|intermediate|2\+ years|3\+ years/
        .test(value)
    ) {

      return "Mid-Level";

    }

    if (
      /junior|entry|fresher|graduate|0-1 year/
        .test(value)
    ) {

      return "Entry-Level";

    }

    return "Not specified";

  },


  detectWorkMode(text) {

    const value =
      this.normalize(text);

    if (
      value.includes("remote")
    ) {

      return "Remote";

    }

    if (
      value.includes("hybrid")
    ) {

      return "Hybrid";

    }

    if (
      value.includes("on-site") ||
      value.includes("onsite")
    ) {

      return "On-site";

    }

    return "Not specified";

  },


  recommendRoles(skills) {

    const input =
      skills.map(
        skill =>
          this.normalize(skill)
      );

    const results = [];

    Object.keys(
      this.roles
    ).forEach(key => {

      const role =
        this.roles[key];

      const matched =
        role.skills.filter(
          skill =>
            input.includes(
              this.normalize(skill)
            )
        );

      const score =
        Math.round(
          matched.length /
          role.skills.length *
          100
        );

      results.push({

        key: key,

        role: role.name,

        score: score,

        matched: matched,

        missing:
          role.skills.filter(
            skill =>
              !matched.includes(skill)
          )

      });

    });

    return results.sort(
      (a,b) =>
        b.score-a.score
    );

  },


  skillGap(skills, roleKey) {

    const role =
      this.roles[roleKey];

    if (!role) {

      return null;

    }

    const input =
      skills.map(
        skill =>
          this.normalize(skill)
      );

    const matched =
      role.skills.filter(
        skill =>
          input.includes(
            this.normalize(skill)
          )
      );

    const missing =
      role.skills.filter(
        skill =>
          !input.includes(
            this.normalize(skill)
          )
      );

    return {

      role:
        role.name,

      score:
        Math.round(
          matched.length /
          role.skills.length *
          100
        ),

      matched:
        matched,

      missing:
        missing

    };

  },


  buildRoadmap(missingSkills) {

    const roadmap = [];

    missingSkills
      .slice(0,8)
      .forEach(
        (skill,index) => {

          roadmap.push({

            step:
              index+1,

            skill:
              skill,

            action:
              "Learn the fundamentals",

            practice:
              "Build one small practical project",

            proof:
              "Add the project to your portfolio"

          });

        }
      );

    return roadmap;

  },


  generateQuestions(skills) {

    const questions = [

      "Tell me about yourself.",

      "Why are you interested in this role?",

      "Why should we hire you?",

      "Describe a difficult problem you solved.",

      "Tell me about your strongest project.",

      "How do you learn new technology?",

      "How do you handle deadlines?",

      "What are your biggest strengths?",

      "What is one skill you are currently improving?"

    ];

    skills
      .slice(0,8)
      .forEach(
        skill => {

          questions.push(
            "Explain your practical experience with " +
            skill +
            "."
          );

          questions.push(
            "What are the important concepts of " +
            skill +
            " that a developer should understand?"
          );

        }
      );

    return questions;

  },


  analyzeJob(text) {

    const skills =
      this.detectSkills(text);

    const seniority =
      this.detectSeniority(text);

    const workMode =
      this.detectWorkMode(text);

    const roles =
      this.recommendRoles(
        skills
      );

    return {

      skills:
        skills,

      seniority:
        seniority,

      workMode:
        workMode,

      recommendedRoles:
        roles.slice(0,5)

    };

  },


  careerProfile(skills) {

    const recommendations =
      this.recommendRoles(
        skills
      );

    const top =
      recommendations[0];

    if (!top) {

      return {

        title:
          "Career direction unavailable",

        score:
          0,

        reason:
          "Add more skills to your profile."

      };

    }

    return {

      title:
        top.role,

      score:
        top.score,

      reason:
        "Your current skills have the strongest alignment with this career path.",

      missing:
        top.missing

    };

  },


  readiness(score) {

    if (score >= 90) {

      return {
        level: "Excellent",
        message:
          "Your profile is highly aligned."
      };

    }

    if (score >= 75) {

      return {
        level: "Strong",
        message:
          "You are well positioned for this opportunity."
      };

    }

    if (score >= 60) {

      return {
        level: "Developing",
        message:
          "Strengthen the missing skills before applying."
      };

    }

    return {

      level:
        "Needs Improvement",

      message:
        "Build more relevant skills and projects."

    };

  },


  getStats(skills) {

    const recommendations =
      this.recommendRoles(
        skills
      );

    const scores =
      recommendations.map(
        x =>
          x.score
      );

    const average =
      scores.length
        ? Math.round(
            scores.reduce(
              (a,b) =>
                a+b,
              0
            ) /
            scores.length
          )
        : 0;

    return {

      detectedSkills:
        skills.length,

      careerPaths:
        recommendations.length,

      strongestMatch:
        recommendations[0]
          ? recommendations[0].role
          : "—",

      strongestScore:
        recommendations[0]
          ? recommendations[0].score
          : 0,

      averageScore:
        average

    };

  }

};


/* =========================================
   OPTIONAL GLOBAL HELPERS
   ========================================= */

function analyzeCareer(text) {

  return CareerEngine.analyzeJob(
    text
  );

}


function recommendCareers(skills) {

  return CareerEngine.recommendRoles(
    skills
  );

}


function getCareerProfile(skills) {

  return CareerEngine.careerProfile(
    skills
  );

}


console.log(
  "JobFlow Career Intelligence loaded."
);