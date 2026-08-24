/* =========================================
   JOBFLOW AI — COVER LETTER ENGINE
   ========================================= */

const CoverLetterEngine = {

  templates: {

    professional: {
      name: "Professional",
      tone: "confident"
    },

    concise: {
      name: "Concise",
      tone: "direct"
    },

    startup: {
      name: "Startup",
      tone: "energetic"
    },

    technical: {
      name: "Technical",
      tone: "technical"
    }

  },


  clean(value) {

    return String(value || "")
      .trim();

  },


  skills(value) {

    return this.clean(value)
      .split(/[,;\n]/)
      .map(
        item =>
          item.trim()
      )
      .filter(Boolean);

  },


  generate(data = {}) {

    const name =
      this.clean(
        data.name
      ) ||
      "Candidate";

    const company =
      this.clean(
        data.company
      ) ||
      "your company";

    const role =
      this.clean(
        data.role
      ) ||
      "the position";

    const skills =
      this.skills(
        data.skills
      );

    const experience =
      this.clean(
        data.experience
      );

    const achievement =
      this.clean(
        data.achievement
      );


    let letter = "";


    letter +=
      "Dear Hiring Manager,\n\n";


    letter +=
      "I am writing to express my interest in the " +
      role +
      " position at " +
      company +
      ". ";


    if (skills.length) {

      letter +=
        "My background includes practical experience with " +
        skills.slice(0,5).join(", ") +
        ", which aligns well with the requirements of this opportunity. ";

    } else {

      letter +=
        "I believe my skills and practical experience make me a strong candidate for this opportunity. ";

    }


    if (experience) {

      letter +=
        "Through my experience, I have developed the ability to solve problems, learn quickly and contribute effectively to team goals. ";

    }


    if (achievement) {

      letter +=
        "One achievement I am particularly proud of is " +
        achievement +
        ". ";

    }


    letter +=
      "\nI am especially interested in " +
      company +
      " because this role provides an opportunity to apply my skills while continuing to grow professionally. I would welcome the opportunity to discuss how I could contribute to your team.\n\n";


    letter +=
      "Thank you for considering my application. I look forward to hearing from you.\n\n";


    letter +=
      "Sincerely,\n" +
      name;


    return letter;

  },


  generateConcise(data = {}) {

    const name =
      this.clean(
        data.name
      ) ||
      "Candidate";

    const company =
      this.clean(
        data.company
      ) ||
      "your company";

    const role =
      this.clean(
        data.role
      ) ||
      "this role";

    const skills =
      this.skills(
        data.skills
      );


    let text =
      "Dear Hiring Manager,\n\n";


    text +=
      "I am interested in the " +
      role +
      " position at " +
      company +
      ". ";


    if (skills.length) {

      text +=
        "My experience with " +
        skills.slice(0,4).join(", ") +
        " matches the skills required for this opportunity. ";

    }


    text +=
      "I would appreciate the opportunity to discuss how I can contribute to your team.\n\n";


    text +=
      "Thank you for your consideration.\n\n";


    text +=
      "Sincerely,\n" +
      name;


    return text;

  },


  generateStartup(data = {}) {

    const name =
      this.clean(
        data.name
      ) ||
      "Candidate";

    const company =
      this.clean(
        data.company
      ) ||
      "your company";

    const role =
      this.clean(
        data.role
      ) ||
      "this role";

    const skills =
      this.skills(
        data.skills
      );


    return (

      "Hi Hiring Team,\n\n" +

      "I am excited to apply for the " +
      role +
      " role at " +
      company +
      ". " +

      "I enjoy building practical solutions, learning quickly and taking ownership of challenging problems. " +

      (
        skills.length
          ? "My experience with " +
            skills.slice(0,5).join(", ") +
            " would allow me to contribute from day one. "
          : ""
      ) +

      "I would love the opportunity to bring that mindset to your team and help build meaningful products.\n\n" +

      "Thanks for your time,\n" +

      name

    );

  },


  generateTechnical(data = {}) {

    const name =
      this.clean(
        data.name
      ) ||
      "Candidate";

    const company =
      this.clean(
        data.company
      ) ||
      "your company";

    const role =
      this.clean(
        data.role
      ) ||
      "this position";

    const skills =
      this.skills(
        data.skills
      );


    let text =
      "Dear Hiring Manager,\n\n";


    text +=
      "I am applying for the " +
      role +
      " position at " +
      company +
      ". ";


    if (skills.length) {

      text +=
        "My technical background includes " +
        skills.slice(0,8).join(", ") +
        ". ";

    }


    text +=
      "I focus on building reliable, maintainable and user-focused solutions. I enjoy understanding technical problems, breaking them into practical steps and delivering measurable results.\n\n";


    text +=
      "I would welcome the opportunity to discuss the technical challenges of this role and how my experience could contribute to your engineering team.\n\n";


    text +=
      "Sincerely,\n" +
      name;


    return text;

  },


  generateByTemplate(
    template,
    data
  ) {

    if (
      template ===
      "concise"
    ) {

      return this.generateConcise(
        data
      );

    }


    if (
      template ===
      "startup"
    ) {

      return this.generateStartup(
        data
      );

    }


    if (
      template ===
      "technical"
    ) {

      return this.generateTechnical(
        data
      );

    }


    return this.generate(
      data
    );

  },


  personalize(
    letter,
    jobText
  ) {

    if (
      !jobText
    ) {

      return letter;

    }


    const text =
      String(
        jobText
      )
        .toLowerCase();


    const keywords = [

      "javascript",
      "html",
      "css",
      "react",
      "python",
      "java",
      "sql",
      "api",
      "aws",
      "docker",
      "leadership",
      "communication",
      "analytics",
      "sales",
      "marketing"

    ];


    const detected =
      keywords.filter(
        word =>
          text.includes(word)
      );


    if (
      !detected.length
    ) {

      return letter;

    }


    const addition =
      "\n\nI am particularly interested in this opportunity because it aligns with my experience and interest in " +
      detected.slice(0,5)
        .join(", ") +
      ".";


    return (
      letter +
      addition
    );

  },


  getWordCount(text) {

    return this.clean(
      text
    )
      .split(/\s+/)
      .filter(Boolean)
      .length;

  },


  getQuality(text) {

    const value =
      this.clean(
        text
      );

    const words =
      this.getWordCount(
        value
      );


    let score = 0;


    if (
      words >= 120
    ) {

      score += 30;

    } else if (
      words >= 80
    ) {

      score += 25;

    } else if (
      words >= 50
    ) {

      score += 18;

    } else {

      score += 10;

    }


    const hasGreeting =
      /dear|hello|hi/i
        .test(value);


    const hasClosing =
      /sincerely|regards|thank you/i
        .test(value);


    const hasCompany =
      /company|team|organization/i
        .test(value);


    if (hasGreeting) {

      score += 20;

    }

    if (hasClosing) {

      score += 20;

    }

    if (hasCompany) {

      score += 15;

    }


    score =
      Math.min(
        score,
        100
      );


    return {

      score:
        score,

      wordCount:
        words,

      goodLength:
        words >= 80 &&
        words <= 350,

      hasGreeting:
        hasGreeting,

      hasClosing:
        hasClosing,

      hasCompanyReference:
        hasCompany

    };

  },


  getTemplates() {

    return Object.keys(
      this.templates
    )
      .map(
        id => ({

          id:
            id,

          name:
            this.templates[id]
              .name,

          tone:
            this.templates[id]
              .tone

        })
      );

  }

};


console.log(
  "JobFlow Cover Letter Engine loaded."
);