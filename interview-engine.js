/* =========================================
   JOBFLOW AI — INTERVIEW INTELLIGENCE
   ========================================= */

const InterviewEngine = {

  categories: {

    hr: [
      "Tell me about yourself.",
      "Why do you want this job?",
      "Why should we hire you?",
      "What are your greatest strengths?",
      "What is one weakness you are working on?",
      "Where do you see yourself in five years?",
      "Why are you leaving your current role?",
      "Tell me about a difficult situation you handled.",
      "How do you handle pressure?",
      "How do you prioritize multiple tasks?"
    ],

    behavioral: [
      "Tell me about a time you solved a difficult problem.",
      "Tell me about a time you made a mistake.",
      "Describe a time you disagreed with a teammate.",
      "Tell me about a time you showed leadership.",
      "Describe a project that did not go as planned.",
      "Tell me about a time you worked under a tight deadline.",
      "Describe a time you received difficult feedback.",
      "Tell me about a time you learned something quickly."
    ],

    technical: [],

    company: [
      "What do you know about our company?",
      "Why do you want to work with our team?",
      "What interests you about this position?",
      "How would you contribute during your first 90 days?",
      "What questions do you have for us?"
    ]

  },


  normalize(text) {

    return String(text || "")
      .toLowerCase()
      .trim();

  },


  generateTechnicalQuestions(
    skills
  ) {

    const questions = [];

    skills
      .slice(0,12)
      .forEach(
        skill => {

          questions.push({

            category:
              "technical",

            question:
              "Explain your practical experience with " +
              skill +
              ".",

            difficulty:
              "medium",

            skill:
              skill

          });


          questions.push({

            category:
              "technical",

            question:
              "What are the most important concepts of " +
              skill +
              " that a developer should understand?",

            difficulty:
              "medium",

            skill:
              skill

          });


          questions.push({

            category:
              "technical",

            question:
              "Describe a project where you used " +
              skill +
              " and explain the result.",

            difficulty:
              "hard",

            skill:
              skill

          });

        }
      );

    return questions;

  },


  generateQuestions(
    skills = [],
    jobText = ""
  ) {

    const questions = [];


    this.categories.hr
      .forEach(
        question => {

          questions.push({

            category:
              "HR",

            difficulty:
              "easy",

            question:
              question

          });

        }
      );


    this.categories.behavioral
      .forEach(
        question => {

          questions.push({

            category:
              "Behavioral",

            difficulty:
              "medium",

            question:
              question

          });

        }
      );


    this.generateTechnicalQuestions(
      skills
    )
      .forEach(
        question =>
          questions.push(
            question
          )
      );


    this.categories.company
      .forEach(
        question => {

          questions.push({

            category:
              "Company",

            difficulty:
              "medium",

            question:
              question

          });

        }
      );


    return questions;

  },


  getSTARScore(answer) {

    const text =
      this.normalize(answer);

    const words =
      text
        .split(/\s+/)
        .filter(Boolean);

    const indicators = {

      situation: [
        "when",
        "while",
        "during",
        "situation",
        "context"
      ],

      task: [
        "task",
        "goal",
        "needed",
        "required",
        "responsible"
      ],

      action: [
        "i",
        "built",
        "created",
        "developed",
        "implemented",
        "led",
        "solved",
        "designed",
        "improved"
      ],

      result: [
        "result",
        "increased",
        "reduced",
        "improved",
        "achieved",
        "delivered",
        "saved",
        "percent",
        "%"
      ]

    };


    const scores = {};


    Object.keys(
      indicators
    ).forEach(
      section => {

        scores[section] =
          indicators[section]
            .some(
              word =>
                text.includes(word)
            );

      }
    );


    const completed =
      Object.values(
        scores
      )
        .filter(Boolean)
        .length;


    let score =
      Math.round(
        completed /
        4 *
        100
      );


    if (
      words.length < 25
    ) {

      score -= 10;

    }


    score =
      Math.max(
        0,
        Math.min(
          score,
          100
        )
      );


    const missing = [];

    Object.keys(
      scores
    ).forEach(
      section => {

        if (
          !scores[section]
        ) {

          missing.push(
            section
          );

        }

      }
    );


    return {

      score:
        score,

      sections:
        scores,

      missing:
        missing,

      wordCount:
        words.length

    };

  },


  evaluateAnswer(
    question,
    answer,
    category = "general"
  ) {

    const text =
      this.normalize(answer);

    const words =
      text
        .split(/\s+/)
        .filter(Boolean);


    let score = 0;


    if (
      words.length >= 20
    ) {

      score += 20;

    }

    if (
      words.length >= 50
    ) {

      score += 15;

    }

    if (
      words.length >= 100
    ) {

      score += 10;

    }


    const strongWords = [

      "built",
      "developed",
      "implemented",
      "improved",
      "created",
      "solved",
      "led",
      "delivered",
      "achieved",
      "optimized",
      "designed"

    ];


    const strongCount =
      strongWords.filter(
        word =>
          text.includes(word)
      ).length;


    score +=
      Math.min(
        strongCount * 5,
        20
      );


    if (
      category
        .toLowerCase()
        .includes(
          "behavior"
        )
    ) {

      const star =
        this.getSTARScore(
          answer
        );

      score =
        Math.round(
          score * 0.6 +
          star.score * 0.4
        );

    } else {

      score =
        Math.min(
          score + 30,
          100
        );

    }


    const suggestions = [];


    if (
      words.length < 30
    ) {

      suggestions.push(
        "Give a more detailed answer."
      );

    }


    if (
      strongCount === 0
    ) {

      suggestions.push(
        "Use specific action verbs."
      );

    }


    if (
      category
        .toLowerCase()
        .includes(
          "behavior"
        )
    ) {

      const star =
        this.getSTARScore(
          answer
        );

      if (
        star.missing
          .includes(
            "result"
          )
      ) {

        suggestions.push(
          "Finish with the measurable result or outcome."
        );

      }

      if (
        star.missing
          .includes(
            "action"
          )
      ) {

        suggestions.push(
          "Explain exactly what you personally did."
        );

      }

    }


    return {

      score:
        Math.min(
          score,
          100
        ),

      wordCount:
        words.length,

      suggestions:
        suggestions

    };

  },


  generateFollowUp(
    question,
    answer
  ) {

    const text =
      this.normalize(answer);


    if (
      text.length < 40
    ) {

      return "Can you give me a specific example?";

    }


    if (
      !/\d|%|percent|result|improved|increased|reduced/
        .test(text)
    ) {

      return "What was the measurable result of your work?";

    }


    return "What did you learn from that experience?";

  },


  getDifficultyScore(
    questions
  ) {

    if (!questions.length) {

      return 0;

    }

    let points = 0;

    questions.forEach(
      question => {

        if (
          question.difficulty ===
          "easy"
        ) {

          points += 1;

        }

        if (
          question.difficulty ===
          "medium"
        ) {

          points += 2;

        }

        if (
          question.difficulty ===
          "hard"
        ) {

          points += 3;

        }

      }
    );

    return Math.round(
      points /
      questions.length
    );

  },


  createSession(
    skills,
    jobText
  ) {

    const questions =
      this.generateQuestions(
        skills,
        jobText
      );


    return {

      id:
        Date.now(),

      created:
        new Date()
          .toISOString(),

      questions:
        questions,

      total:
        questions.length,

      completed:
        0,

      answers: []

    };

  },


  recordAnswer(
    session,
    questionId,
    answer
  ) {

    const question =
      session.questions[
        questionId
      ];


    if (!question) {

      return null;

    }


    const evaluation =
      this.evaluateAnswer(
        question.question,
        answer,
        question.category
      );


    session.answers.push({

      question:
        question.question,

      answer:
        answer,

      evaluation:
        evaluation,

      answeredAt:
        new Date()
          .toISOString()

    });


    session.completed =
      session.answers.length;


    return evaluation;

  },


  getSessionScore(
    session
  ) {

    if (
      !session.answers ||
      !session.answers.length
    ) {

      return 0;

    }


    const total =
      session.answers.reduce(
        (sum, item) =>
          sum +
          item.evaluation.score,
        0
      );


    return Math.round(
      total /
      session.answers.length
    );

  },


  getReadiness(score) {

    if (score >= 85) {

      return {

        level:
          "Interview Ready",

        message:
          "Your answers are strong. Focus on confidence and consistency."

      };

    }


    if (score >= 70) {

      return {

        level:
          "Almost Ready",

        message:
          "Your fundamentals are good. Practice your weaker answers."

      };

    }


    if (score >= 50) {

      return {

        level:
          "Needs Practice",

        message:
          "Practice structured answers and add more specific examples."

      };

    }


    return {

      level:
        "Start Practicing",

      message:
        "Build your answer bank and practice the basic interview questions."

    };

  }

};


console.log(
  "JobFlow Interview Intelligence loaded."
);