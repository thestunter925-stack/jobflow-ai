/* =========================================
   JOBFLOW AI — RESUME ENGINE
   ========================================= */

const ResumeEngine = {

  templates: {

    modern: {
      name: "Modern",
      description:
        "Clean professional layout for technology and business roles."
    },

    ats: {
      name: "ATS Friendly",
      description:
        "Simple structure designed for resume parsing systems."
    },

    executive: {
      name: "Executive",
      description:
        "Professional format emphasizing leadership and achievements."
    },

    minimal: {
      name: "Minimal",
      description:
        "Compact resume for candidates who want a simple presentation."
    }

  },


  clean(value) {

    return String(value || "")
      .trim();

  },


  splitSkills(value) {

    return this.clean(value)
      .split(/[,;\n]/)
      .map(
        skill =>
          skill.trim()
      )
      .filter(Boolean);

  },


  build(data) {

    const resume = {

      personal: {

        name:
          this.clean(
            data.name
          ),

        title:
          this.clean(
            data.title
          ),

        email:
          this.clean(
            data.email
          ),

        phone:
          this.clean(
            data.phone
          ),

        location:
          this.clean(
            data.location
          ),

        website:
          this.clean(
            data.website
          ),

        linkedin:
          this.clean(
            data.linkedin
          ),

        github:
          this.clean(
            data.github
          )

      },

      summary:
        this.clean(
          data.summary
        ),

      skills:
        this.splitSkills(
          data.skills
        ),

      experience:
        this.clean(
          data.experience
        ),

      education:
        this.clean(
          data.education
        ),

      projects:
        this.clean(
          data.projects
        ),

      certifications:
        this.clean(
          data.certifications
        ),

      achievements:
        this.clean(
          data.achievements
        )

    };

    return resume;

  },


  generateSummary(data) {

    const title =
      this.clean(
        data.title
      ) ||
      "Professional";

    const skills =
      this.splitSkills(
        data.skills
      );

    const firstSkills =
      skills
        .slice(0,5)
        .join(", ");

    let summary =
      "Motivated " +
      title +
      " with experience and practical knowledge";

    if (firstSkills) {

      summary +=
        " in " +
        firstSkills;

    }

    summary +=
      ". Strong problem-solving, communication and collaboration skills with a focus on delivering practical results.";

    return summary;

  },


  generateAchievement(
    action,
    technology,
    result
  ) {

    const a =
      this.clean(action);

    const t =
      this.clean(technology);

    const r =
      this.clean(result);

    if (!a) {

      return "";

    }

    let sentence =
      a.charAt(0)
        .toUpperCase() +
      a.slice(1);

    if (t) {

      sentence +=
        " using " +
        t;

    }

    if (r) {

      sentence +=
        ", resulting in " +
        r;

    }

    if (
      !sentence.endsWith(".")
    ) {

      sentence += ".";

    }

    return sentence;

  },


  createExperienceBullets(text) {

    const lines =
      this.clean(text)
        .split(/\n+/)
        .map(
          line =>
            line
              .replace(/^[-•*]\s*/, "")
              .trim()
        )
        .filter(Boolean);

    return lines.map(
      line => {

        if (
          /^[A-Z][a-z]+ed\b/
            .test(line)
        ) {

          return line;

        }

        return line;

      }
    );

  },


  createProjectSection(
    projects
  ) {

    if (!projects) {

      return [];

    }

    return projects
      .split(/\n+/)
      .map(
        project =>
          project
            .replace(
              /^[-•*]\s*/,
              ""
            )
            .trim()
      )
      .filter(Boolean);

  },


  optimizeForJob(
    resume,
    jobAnalysis
  ) {

    const result = {

      resume:
        JSON.parse(
          JSON.stringify(
            resume
          )
        ),

      suggestions: [],

      matchedSkills: [],

      missingSkills: []

    };

    if (
      !jobAnalysis
    ) {

      return result;

    }

    const resumeSkills =
      resume.skills.map(
        skill =>
          skill.toLowerCase()
      );

    const targetSkills =
      (
        jobAnalysis.skills ||
        []
      ).map(
        skill =>
          skill.toLowerCase()
      );

    result.matchedSkills =
      targetSkills.filter(
        skill =>
          resumeSkills.includes(
            skill
          )
      );

    result.missingSkills =
      targetSkills.filter(
        skill =>
          !resumeSkills.includes(
            skill
          )
      );

    if (
      result.missingSkills.length
    ) {

      result.suggestions.push(
        "Review the missing job skills and add only those you genuinely possess."
      );

    }

    if (
      resume.summary
    ) {

      result.suggestions.push(
        "Tailor your summary toward the target role."
      );

    } else {

      result.suggestions.push(
        "Add a professional summary."
      );

    }

    if (
      !resume.projects
    ) {

      result.suggestions.push(
        "Add relevant projects to demonstrate practical ability."
      );

    }

    if (
      !resume.achievements
    ) {

      result.suggestions.push(
        "Add measurable achievements where possible."
      );

    }

    return result;

  },


  renderHTML(
    resume,
    template = "ats"
  ) {

    const personal =
      resume.personal || {};

    const skills =
      resume.skills || [];

    let html = "";

    html +=
      "<div class='resume-document " +
      "resume-" +
      template +
      "'>";

    html +=
      "<header class='resume-header'>";

    html +=
      "<h1>" +
      this.escape(
        personal.name
      ) +
      "</h1>";

    if (
      personal.title
    ) {

      html +=
        "<h2>" +
        this.escape(
          personal.title
        ) +
        "</h2>";

    }

    const contact = [

      personal.email,

      personal.phone,

      personal.location,

      personal.website,

      personal.linkedin,

      personal.github

    ]
      .filter(Boolean)
      .map(
        item =>
          this.escape(item)
      )
      .join(" · ");

    if (contact) {

      html +=
        "<p class='resume-contact'>" +
        contact +
        "</p>";

    }

    html +=
      "</header>";


    if (
      resume.summary
    ) {

      html +=

        "<section>" +

        "<h3>Professional Summary</h3>" +

        "<p>" +
        this.escape(
          resume.summary
        ) +
        "</p>" +

        "</section>";

    }


    if (
      skills.length
    ) {

      html +=

        "<section>" +

        "<h3>Skills</h3>" +

        "<p>" +
        skills
          .map(
            skill =>
              this.escape(
                skill
              )
          )
          .join(" · ") +
        "</p>" +

        "</section>";

    }


    if (
      resume.experience
    ) {

      html +=

        "<section>" +

        "<h3>Experience</h3>" +

        this.formatLines(
          resume.experience
        ) +

        "</section>";

    }


    if (
      resume.projects
    ) {

      html +=

        "<section>" +

        "<h3>Projects</h3>" +

        this.formatLines(
          resume.projects
        ) +

        "</section>";

    }


    if (
      resume.education
    ) {

      html +=

        "<section>" +

        "<h3>Education</h3>" +

        this.formatLines(
          resume.education
        ) +

        "</section>";

    }


    if (
      resume.certifications
    ) {

      html +=

        "<section>" +

        "<h3>Certifications</h3>" +

        this.formatLines(
          resume.certifications
        ) +

        "</section>";

    }


    if (
      resume.achievements
    ) {

      html +=

        "<section>" +

        "<h3>Achievements</h3>" +

        this.formatLines(
          resume.achievements
        ) +

        "</section>";

    }


    html +=
      "</div>";

    return html;

  },


  formatLines(text) {

    const lines =
      this.clean(text)
        .split(/\n+/)
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

    if (!lines.length) {

      return "";

    }

    return (

      "<ul>" +

      lines
        .map(
          line =>
            "<li>" +
            this.escape(
              line
            ) +
            "</li>"
        )
        .join("") +

      "</ul>"

    );

  },


  escape(value) {

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

  },


  getTemplateList() {

    return Object.keys(
      this.templates
    ).map(
      key => ({

        id:
          key,

        name:
          this.templates[key]
            .name,

        description:
          this.templates[key]
            .description

      })
    );

  }

};


console.log(
  "JobFlow Resume Engine loaded."
);