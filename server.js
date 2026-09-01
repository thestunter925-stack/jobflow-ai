/*
=========================================================
 JOBFLOW AI - PROFESSIONAL BACKEND
 server.js
=========================================================

 FEATURES
 --------------------------------------------------------
 • 48-hour free trial
 • Email verification
 • ₹499 Premium
 • 30-day Premium
 • Normal UPI payment
 • UPI payment link
 • Transaction/reference submission
 • Owner payment verification
 • Duplicate transaction protection
 • Membership expiry
 • Owner unlimited access
 • User profile API
 • Applications API
 • Resume API
 • Interview API
 • Cover-letter API
 • JSON database
 • Optional PostgreSQL connection
 • Security headers
 • Rate limiting
 • CORS
 • Health check
 • Render compatible

 PAYMENT
 --------------------------------------------------------
 UPI ID:
 8374506945@fam

 IMPORTANT
 --------------------------------------------------------
 A normal UPI ID does NOT provide automatic server-side
 payment verification.

 Premium is activated ONLY after owner verification.

 NEVER put passwords, database credentials,
 SMTP passwords, JWT secrets, or private API credentials
 inside index.html or GitHub frontend code.
=========================================================
*/


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const nodemailer = require("nodemailer");


/* ======================================================
   OPTIONAL POSTGRES
====================================================== */

let pg = null;

try {
  pg = require("pg");
} catch (error) {
  console.log(
    "PostgreSQL package not available. JSON database will be used."
  );
}


/* ======================================================
   APP
====================================================== */

const app = express();

const PORT =
  Number(process.env.PORT) || 3000;


/* ======================================================
   CONFIG
====================================================== */

const PREMIUM_PRICE = 499;

const PREMIUM_DAYS = 30;

const TRIAL_HOURS = 48;

const VERIFICATION_MINUTES = 10;

const OWNER_EMAIL =
  String(
    process.env.OWNER_EMAIL || ""
  )
    .trim()
    .toLowerCase();

const PAYMENT_UPI_ID =
  "8374506945@fam";


/* ======================================================
   DATABASE
====================================================== */

const DATA_DIR =
  path.join(
    __dirname,
    "data"
  );

const DB_FILE =
  path.join(
    DATA_DIR,
    "jobflow.json"
  );


if (
  !fs.existsSync(DATA_DIR)
) {
  fs.mkdirSync(
    DATA_DIR,
    {
      recursive: true
    }
  );
}


function defaultDatabase() {

  return {

    users: {},

    payments: {},

    verificationCodes: {},

    applications: {},

    resumes: {},

    interviews: {},

    coverLetters: {}

  };

}


function loadDatabase() {

  try {

    if (
      !fs.existsSync(DB_FILE)
    ) {

      const database =
        defaultDatabase();

      saveDatabase(
        database
      );

      return database;

    }


    const raw =
      fs.readFileSync(
        DB_FILE,
        "utf8"
      );


    const parsed =
      JSON.parse(raw);


    return {
      ...defaultDatabase(),
      ...parsed
    };

  }

  catch (error) {

    console.error(
      "Database read error:",
      error
    );

    return defaultDatabase();

  }

}


function saveDatabase(
  database
) {

  const tempFile =
    DB_FILE + ".tmp";


  fs.writeFileSync(
    tempFile,
    JSON.stringify(
      database,
      null,
      2
    ),
    "utf8"
  );


  fs.renameSync(
    tempFile,
    DB_FILE
  );

}


const db =
  loadDatabase();


/* ======================================================
   OPTIONAL POSTGRES CONNECTION
====================================================== */

let postgresPool = null;

if (
  pg &&
  process.env.DATABASE_URL
) {

  try {

    postgresPool =
      new pg.Pool({

        connectionString:
          process.env.DATABASE_URL,

        ssl: {
          rejectUnauthorized: false
        }

      });


    postgresPool.on(
      "error",
      function(error) {

        console.error(
          "PostgreSQL pool error:",
          error
        );

      }
    );


    console.log(
      "PostgreSQL connection configured."
    );

  }

  catch (error) {

    console.error(
      "PostgreSQL setup error:",
      error
    );

  }

}


/* ======================================================
   MIDDLEWARE
====================================================== */

app.disable(
  "x-powered-by"
);


app.set(
  "trust proxy",
  1
);


app.use(
  cors({

    origin:
      process.env.FRONTEND_URL ||
      true,

    credentials: true

  })
);


app.use(
  express.json({

    limit:
      "200kb"

  })
);


app.use(
  express.urlencoded({

    extended:
      false,

    limit:
      "50kb"

  })
);


/* ======================================================
   SECURITY HEADERS
====================================================== */

app.use(
  function(
    req,
    res,
    next
  ) {

    res.setHeader(
      "X-Content-Type-Options",
      "nosniff"
    );

    res.setHeader(
      "X-Frame-Options",
      "DENY"
    );

    res.setHeader(
      "Referrer-Policy",
      "strict-origin-when-cross-origin"
    );

    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );

    next();

  }
);


/* ======================================================
   RATE LIMITER
====================================================== */

const rateMap =
  new Map();


function rateLimit(
  windowMs,
  maxRequests
) {

  return function(
    req,
    res,
    next
  ) {

    const now =
      Date.now();


    const forwarded =
      req.headers[
        "x-forwarded-for"
      ];


    const ip =
      (
        forwarded
          ? String(forwarded)
              .split(",")[0]
              .trim()
          : req.ip
      ) ||
      "unknown";


    const current =
      rateMap.get(ip);


    if (
      !current ||
      now - current.start >
      windowMs
    ) {

      rateMap.set(
        ip,
        {
          start: now,
          count: 1
        }
      );

      return next();

    }


    current.count++;


    if (
      current.count >
      maxRequests
    ) {

      return res
        .status(429)
        .json({

          success: false,

          message:
            "Too many requests. Please try again later."

        });

    }


    next();

  };

}


app.use(
  rateLimit(
    60 * 1000,
    120
  )
);


/* ======================================================
   HELPERS
====================================================== */

function cleanEmail(
  email
) {

  return String(
    email || ""
  )
    .trim()
    .toLowerCase();

}


function validEmail(
  email
) {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(email);

}


function randomId(
  prefix
) {

  return (
    prefix +
    "_" +
    crypto
      .randomBytes(16)
      .toString("hex")
  );

}


function randomCode() {

  return String(
    crypto.randomInt(
      100000,
      1000000
    )
  );

}


function hash(
  value
) {

  return crypto
    .createHash("sha256")
    .update(
      String(value)
    )
    .digest("hex");

}


function safeEqual(
  a,
  b
) {

  const aBuffer =
    Buffer.from(
      String(a)
    );

  const bBuffer =
    Buffer.from(
      String(b)
    );


  if (
    aBuffer.length !==
    bBuffer.length
  ) {

    return false;

  }


  return crypto.timingSafeEqual(
    aBuffer,
    bBuffer
  );

}


function getUser(
  email
) {

  return db.users[
    cleanEmail(email)
  ];

}


function ensureUser(
  email
) {

  email =
    cleanEmail(email);


  if (
    !db.users[email]
  ) {

    db.users[email] = {

      email,

      emailVerified:
        false,

      emailVerifiedAt:
        null,

      createdAt:
        new Date()
          .toISOString(),

      trialStartedAt:
        null,

      trialExpiresAt:
        null,

      premiumExpiresAt:
        null,

      premium:
        false,

      owner:
        Boolean(
          OWNER_EMAIL &&
          email === OWNER_EMAIL
        ),

      profile: {}

    };

  }


  return db.users[email];

}


function isOwner(
  email
) {

  return Boolean(
    OWNER_EMAIL &&
    cleanEmail(email) ===
    OWNER_EMAIL
  );

}


function premiumActive(
  user
) {

  if (!user) {
    return false;
  }


  if (
    user.owner === true
  ) {
    return true;
  }


  const expiry =
    Date.parse(
      user.premiumExpiresAt ||
      ""
    );


  if (
    Number.isFinite(expiry) &&
    expiry > Date.now()
  ) {

    return true;

  }


  return false;

}


function trialActive(
  user
) {

  if (!user) {
    return false;
  }


  if (
    premiumActive(user)
  ) {
    return true;
  }


  const expiry =
    Date.parse(
      user.trialExpiresAt ||
      ""
    );


  return (
    Number.isFinite(expiry) &&
    expiry > Date.now()
  );

}


function membershipStatus(
  user
) {

  if (!user) {

    return {

      owner: false,

      premium: false,

      trial: false,

      premiumExpiresAt:
        null,

      trialExpiresAt:
        null

    };

  }


  return {

    owner:
      user.owner === true,

    premium:
      premiumActive(user),

    trial:
      trialActive(user),

    premiumExpiresAt:
      user.premiumExpiresAt ||
      null,

    trialExpiresAt:
      user.trialExpiresAt ||
      null

  };

}


function requireUser(
  req,
  res
) {

  const email =
    cleanEmail(
      req.body.email ||
      req.query.email ||
      req.headers[
        "x-user-email"
      ]
    );


  if (
    !validEmail(email)
  ) {

    res
      .status(400)
      .json({

        success: false,

        message:
          "A valid email address is required."

      });

    return null;

  }


  const user =
    getUser(email);


  if (!user) {

    res
      .status(404)
      .json({

        success: false,

        message:
          "User account not found."

      });

    return null;

  }


  return {
    email,
    user
  };

}


/* ======================================================
   EMAIL
====================================================== */

let transporter = null;


if (
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASSWORD
) {

  transporter =
    nodemailer.createTransport({

      host:
        process.env.SMTP_HOST,

      port:
        Number(
          process.env.SMTP_PORT ||
          587
        ),

      secure:
        String(
          process.env.SMTP_SECURE ||
          "false"
        ) === "true",

      auth: {

        user:
          process.env.SMTP_USER,

        pass:
          process.env.SMTP_PASSWORD

      }

    });

}


async function sendVerificationEmail(
  email,
  code
) {

  if (!transporter) {

    console.log(
      `[JobFlow] Verification code for ${email}: ${code}`
    );

    return false;

  }


  const from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER;


  await transporter.sendMail({

    from,

    to: email,

    subject:
      "JobFlow AI - Verify your email",

    text:
      `Your JobFlow AI verification code is ${code}. It expires in 10 minutes.`,

    html:
      `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#2563eb">JobFlow AI</h2>
        <p>Use this verification code to verify your email:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px">
          ${code}
        </div>
        <p>This code expires in 10 minutes.</p>
      </div>
      `

  });


  return true;

}


/* ======================================================
   HEALTH CHECK
====================================================== */

app.get(
  "/api/health",
  async function(
    req,
    res
  ) {

    let database =
      "json";


    if (postgresPool) {

      try {

        await postgresPool.query(
          "SELECT 1"
        );

        database =
          "postgresql";

      }

      catch (error) {

        database =
          "postgresql-error";

      }

    }


    res.json({

      success:
        true,

      service:
        "JobFlow AI API",

      version:
        "2.0.0",

      time:
        new Date()
          .toISOString(),

      payment:

        "UPI manual verification",

      paymentAmount:
        PREMIUM_PRICE,

      paymentUpiId:
        PAYMENT_UPI_ID,

      database,

      emailConfigured:
        Boolean(transporter),

      ownerConfigured:
        Boolean(OWNER_EMAIL)

    });

  }
);


/* ======================================================
   START 48-HOUR TRIAL
====================================================== */

app.post(
  "/api/trial/start",

  rateLimit(
    10 * 60 * 1000,
    10
  ),

  function(
    req,
    res
  ) {

    const email =
      cleanEmail(
        req.body.email
      );


    if (
      !validEmail(email)
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Enter a valid email address."

        });

    }


    const user =
      ensureUser(email);


    if (
      user.trialStartedAt
    ) {

      return res.json({

        success: true,

        email,

        message:
          "Trial has already been started.",

        membership:
          membershipStatus(user)

      });

    }


    const start =
      Date.now();


    user.trialStartedAt =
      new Date(
        start
      ).toISOString();


    user.trialExpiresAt =
      new Date(
        start +
        TRIAL_HOURS *
        60 *
        60 *
        1000
      ).toISOString();


    saveDatabase(db);


    res.json({

      success: true,

      email,

      membership:
        membershipStatus(user)

    });

  }
);


/* ======================================================
   SEND VERIFICATION CODE
====================================================== */

app.post(
  "/api/auth/send-code",

  rateLimit(
    10 * 60 * 1000,
    5
  ),

  async function(
    req,
    res
  ) {

    try {

      const email =
        cleanEmail(
          req.body.email
        );


      if (
        !validEmail(email)
      ) {

        return res
          .status(400)
          .json({

            success: false,

            message:
              "Enter a valid email address."

          });

      }


      const user =
        ensureUser(email);


      const code =
        randomCode();


      db.verificationCodes[
        email
      ] = {

        hash:
          hash(code),

        expiresAt:
          Date.now() +
          VERIFICATION_MINUTES *
          60 *
          1000,

        attempts:
          0

      };


      saveDatabase(db);


      const sent =
        await sendVerificationEmail(
          email,
          code
        );


      res.json({

        success: true,

        message:
          sent
            ? "Verification code sent."
            : "Verification code generated. Configure SMTP to send emails."

      });

    }

    catch (error) {

      console.error(
        "Verification error:",
        error
      );


      res
        .status(500)
        .json({

          success: false,

          message:
            "Could not send verification code."

        });

    }

  }
);


/* ======================================================
   VERIFY EMAIL
====================================================== */

app.post(
  "/api/auth/verify-code",

  rateLimit(
    10 * 60 * 1000,
    20
  ),

  function(
    req,
    res
  ) {

    const email =
      cleanEmail(
        req.body.email
      );


    const code =
      String(
        req.body.code ||
        ""
      ).trim();


    if (
      !validEmail(email) ||
      !/^\d{6}$/.test(code)
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Invalid email or verification code."

        });

    }


    const record =
      db.verificationCodes[
        email
      ];


    if (!record) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Verification code not found. Request a new code."

        });

    }


    if (
      Date.now() >
      record.expiresAt
    ) {

      delete db.verificationCodes[
        email
      ];

      saveDatabase(db);


      return res
        .status(400)
        .json({

          success: false,

          message:
            "Verification code expired."

        });

    }


    record.attempts++;


    if (
      record.attempts >
      5
    ) {

      delete db.verificationCodes[
        email
      ];

      saveDatabase(db);


      return res
        .status(429)
        .json({

          success: false,

          message:
            "Too many verification attempts."

        });

    }


    if (
      !safeEqual(
        hash(code),
        record.hash
      )
    ) {

      saveDatabase(db);


      return res
        .status(400)
        .json({

          success: false,

          message:
            "Incorrect verification code."

        });

    }


    const user =
      ensureUser(email);


    user.emailVerified =
      true;


    user.emailVerifiedAt =
      new Date()
        .toISOString();


    delete db.verificationCodes[
      email
    ];


    saveDatabase(db);


    res.json({

      success: true,

      message:
        "Email verified successfully.",

      membership:
        membershipStatus(user)

    });

  }
);


/* ======================================================
   GET USER / MEMBERSHIP
====================================================== */

app.get(
  "/api/auth/status",
  function(
    req,
    res
  ) {

    const email =
      cleanEmail(
        req.query.email
      );


    if (
      !validEmail(email)
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "Invalid email address."

        });

    }


    const user =
      getUser(email);


    if (!user) {

      return res.json({

        success: true,

        exists: false,

        email,

        membership:
          membershipStatus(null)

      });

    }


    res.json({

      success: true,

      exists: true,

      email,

      emailVerified:
        Boolean(
          user.emailVerified
        ),

      membership:
        membershipStatus(user),

      profile:
        user.profile || {}

    });

  }
);


/* ======================================================
   UPI CREATE PAYMENT
====================================================== */

app.post(
  "/api/payment/create",

  rateLimit(
    60 * 1000,
    10
  ),

  function(
    req,
    res
  ) {

    const email =
      cleanEmail(
        req.body.email
      );


    if (
      !validEmail(email)
    ) {

      return res
        .status(400)
        .json({

          success: false,

          message:
            "A valid email is required."

        });

    }


    const user =
      ensureUser(email);


    if (
      !user.emailVerified
    ) {

      return res
        .status(403)
        .json({

          success: false,

          message:
            "Verify your email before purchasing Premium."

        });

    }


    if (
      premiumActive(user)
    ) {

      return res.json({

        success: true,

        alreadyPremium:
          true,

        membership:
          membershipStatus(user)

      });

    }


    const paymentId =
      randomId("pay");


    const params =
      new URLSearchParams({

        pa:
          PAYMENT_UPI_ID,

        pn:
          "JobFlow AI",

        am:
          PREMIUM_PRICE.toFixed(2),

        cu:
          "INR",

        tn:
          `JobFlow Premium ${paymentId}`

      });


       const paymentLink =
      `upi://pay?${params.toString()}`;


    /* ==================================================
       SAVE PAYMENT REQUEST
    ================================================== */

    db.payments[paymentId] = {

      paymentId,

      email,

      amount:
        PREMIUM_PRICE,

      currency:
        "INR",

      provider:
        "UPI",

      upiId:
        PAYMENT_UPI_ID,

      status:
        "pending",

      reference:
        null,

      createdAt:
        new Date().toISOString(),

      submittedAt:
        null,

      verifiedAt:
        null,

      premiumDays:
        PREMIUM_DAYS

    };


    saveDatabase(db);


    /* ==================================================
       RESPONSE
    ================================================== */

    return res.json({

      success: true,

      paymentId,

      email,

      amount:
        PREMIUM_PRICE,

      currency:
        "INR",

      provider:
        "UPI",

      upiId:
        PAYMENT_UPI_ID,

      paymentLink,

      status:
        "pending",

      premiumDays:
        PREMIUM_DAYS,

      message:
        "Payment request created. Complete the ₹499 UPI payment and submit the transaction reference for verification."

    });

  }

  catch(error){

    console.error(
      "Create UPI payment error:",
      error
    );


    return res
      .status(500)
      .json({

        success:false,

        message:
          "Could not create payment request."

      });

  }

});


/* ======================================================
   SUBMIT PAYMENT REFERENCE
====================================================== */

app.post(
  "/api/payment/submit-reference",

  rateLimit(
    60 * 1000,
    10
  ),

  function(
    req,
    res
  ){

    try{

      const email =
        cleanEmail(
          req.body.email
        );

      const paymentId =
        String(
          req.body.paymentId ||
          ""
        ).trim();

      const reference =
        String(
          req.body.reference ||
          ""
        ).trim();


      if(
        !validEmail(email)
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Invalid email address."

          });

      }


      if(
        !paymentId
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Payment ID is required."

          });

      }


      if(
        !validatePaymentReference(
          reference
        )
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Enter a valid transaction reference."

          });

      }


      const payment =
        db.payments[
          paymentId
        ];


      if(
        !payment
      ){

        return res
          .status(404)
          .json({

            success:false,

            message:
              "Payment request not found."

          });

      }


      if(
        payment.email !==
        email
      ){

        return res
          .status(403)
          .json({

            success:false,

            message:
              "Payment does not belong to this account."

          });

      }


      if(
        payment.status ===
        "verified"
      ){

        return res.json({

          success:true,

          alreadyVerified:true,

          message:
            "This payment has already been verified."

        });

      }


      /*
       Prevent the same reference from being
       submitted for multiple payment requests.
      */

      for(
        const existingId
        of Object.keys(
          db.payments
        )
      ){

        const existing =
          db.payments[
            existingId
          ];


        if(
          existing.paymentId !==
            paymentId &&

          existing.reference &&
          existing.reference
            .toLowerCase() ===
            reference.toLowerCase()
        ){

          return res
            .status(409)
            .json({

              success:false,

              message:
                "This transaction reference has already been submitted."

            });

        }

      }


      payment.reference =
        reference;

      payment.status =
        "submitted";

      payment.submittedAt =
        new Date()
          .toISOString();


      saveDatabase(db);


      return res.json({

        success:true,

        paymentId,

        status:
          payment.status,

        message:
          "Payment reference submitted. Premium will be activated only after payment verification."

      });

    }

    catch(error){

      console.error(
        "Submit payment reference error:",
        error
      );


      return res
        .status(500)
        .json({

          success:false,

          message:
            "Could not submit payment reference."

        });

    }

  }

);


/* ======================================================
   PAYMENT STATUS
====================================================== */

app.get(
  "/api/payment/status",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.query.email
      );

    const paymentId =
      String(
        req.query.paymentId ||
        ""
      ).trim();


    if(
      !validEmail(email)
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid email."

        });

    }


    if(
      paymentId
    ){

      const payment =
        db.payments[
          paymentId
        ];


      if(
        !payment ||
        payment.email !==
        email
      ){

        return res
          .status(404)
          .json({

            success:false,

            message:
              "Payment not found."

          });

      }


      return res.json({

        success:true,

        payment:{

          paymentId:
            payment.paymentId,

          amount:
            payment.amount,

          currency:
            payment.currency,

          provider:
            payment.provider,

          status:
            payment.status,

          reference:
            payment.reference,

          createdAt:
            payment.createdAt,

          submittedAt:
            payment.submittedAt,

          verifiedAt:
            payment.verifiedAt

        }

      });

    }


    const payments =
      Object.values(
        db.payments
      )
      .filter(
        payment =>
          payment.email ===
          email
      )
      .sort(
        (
          a,
          b
        ) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );


    return res.json({

      success:true,

      payments

    });

  }

);


/* ======================================================
   ADMIN / OWNER VERIFY PAYMENT
====================================================== */

app.post(
  "/api/admin/payment/verify",

  rateLimit(
    60 * 1000,
    20
  ),

  function(
    req,
    res
  ){

    try{

      const ownerEmail =
        cleanEmail(
          req.body.ownerEmail
        );

      const paymentId =
        String(
          req.body.paymentId ||
          ""
        ).trim();


      /*
       Owner verification is controlled by the
       OWNER_EMAIL environment variable.
      */

      if(
        !isOwner(
          ownerEmail
        )
      ){

        return res
          .status(403)
          .json({

            success:false,

            message:
              "Owner authorization required."

          });

      }


      if(
        !paymentId
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Payment ID is required."

          });

      }


      const payment =
        db.payments[
          paymentId
        ];


      if(
        !payment
      ){

        return res
          .status(404)
          .json({

            success:false,

            message:
              "Payment not found."

          });

      }


      if(
        payment.status ===
        "verified"
      ){

        const existingUser =
          ensureUser(
            payment.email
          );


        return res.json({

          success:true,

          alreadyVerified:true,

          membership:
            membershipStatus(
              existingUser
            )

        });

      }


      if(
        !payment.reference
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Payment reference has not been submitted."

          });

      }


      /*
       IMPORTANT:

       This endpoint must only be used by the
       account owner AFTER checking the actual
       PhonePe/UPI transaction.

       The server does not fake payment confirmation.
      */


      const user =
        ensureUser(
          payment.email
        );


      const now =
        Date.now();


      const currentExpiry =
        Number(
          user.premiumExpiresAt ||
          0
        );


      const baseTime =
        currentExpiry >
        now
          ? currentExpiry
          : now;


      user.premiumExpiresAt =
        new Date(
          baseTime +
          PREMIUM_DAYS *
          24 *
          60 *
          60 *
          1000
        ).toISOString();


      user.premium =
        true;


      payment.status =
        "verified";

      payment.verifiedAt =
        new Date()
          .toISOString();

      payment.verifiedBy =
        ownerEmail;


      saveDatabase(db);


      return res.json({

        success:true,

        message:
          "Payment verified and Premium activated.",

        email:
          payment.email,

        paymentId,

        membership:
          membershipStatus(
            user
          )

      });

    }

    catch(error){

      console.error(
        "Admin payment verification error:",
        error
      );


      return res
        .status(500)
        .json({

          success:false,

          message:
            "Could not verify payment."

        });

    }

  }

);


/* ======================================================
   GET MEMBERSHIP
====================================================== */

app.get(
  "/api/membership",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.query.email
      );


    if(
      !validEmail(email)
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid email."

        });

    }


    const user =
      getUser(
        email
      );


    if(
      !user
    ){

      return res.json({

        success:true,

        email,

        membership:{

          owner:false,

          premium:false,

          trial:false,

          premiumExpiresAt:null,

          trialExpiresAt:null

        }

      });

    }


    /*
     Automatically reflect expiry.
    */

    if(
      user.premium &&
      !premiumActive(user)
    ){

      user.premium =
        false;

      saveDatabase(db);

    }


    return res.json({

      success:true,

      email,

      membership:
        membershipStatus(
          user
        )

    });

  }

);


/* ======================================================
   USER PROFILE
====================================================== */

app.get(
  "/api/user/profile",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.query.email
      );


    if(
      !validEmail(email)
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid email."

        });

    }


    const user =
      getUser(
        email
      );


    if(
      !user
    ){

      return res
        .status(404)
        .json({

          success:false,

          message:
            "User not found."

        });

    }


    return res.json({

      success:true,

      user:{

        email:
          user.email,

        emailVerified:
          user.emailVerified,

        createdAt:
          user.createdAt,

        membership:
          membershipStatus(
            user
          )

      }

    });

  }

);


/* ======================================================
   APPLICATION API
====================================================== */

app.get(
  "/api/applications",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.query.email
      );


    if(
      !validEmail(email)
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid email."

        });

    }


    return res.json({

      success:true,

      applications:
        db.applications[email] ||
        []

    });

  }

);


app.post(
  "/api/applications",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.body.email
      );


    if(
      !validEmail(email)
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid email."

        });

    }


    if(
      !db.applications[email]
    ){

      db.applications[email] =
        [];

    }


    const application = {

      id:
        randomId(
          "app"
        ),

      data:
        req.body.data ||
        {},

      createdAt:
        new Date()
          .toISOString()

    };


    db.applications[email]
      .push(
        application
      );


    saveDatabase(db);


    return res.json({

      success:true,

      application

    });

  }

);


/* ======================================================
   RESUME API
====================================================== */

app.get(
  "/api/resume",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.query.email
      );


    if(
      !validEmail(email)
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid email."

        });

    }


    return res.json({

      success:true,

      resume:
        db.resumes[email] ||
        null

    });

  }

);


app.post(
  "/api/resume",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.body.email
      );


    if(
      !validEmail(email)
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid email."

        });

    }


    db.resumes[email] = {

      data:
        req.body.data ||
        {},

      updatedAt:
        new Date()
          .toISOString()

    };


    saveDatabase(db);


    return res.json({

      success:true,

      resume:
        db.resumes[email]

    });

  }

);


/* ======================================================
   INTERVIEW API
====================================================== */

app.get(
  "/api/interviews",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.query.email
      );


    if(
      !validEmail(email)
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid email."

        });

    }


    return res.json({

      success:true,

      interviews:
        db.interviews[email] ||
        []

    });

  }

);


app.post(
  "/api/interviews",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.body.email
      );


    if(
      !validEmail(email)
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid email."

        });

    }


    if(
      !db.interviews[email]
    ){

      db.interviews[email] =
        [];

    }


    const interview = {

      id:
        randomId(
          "int"
        ),

      data:
        req.body.data ||
        {},

      createdAt:
        new Date()
          .toISOString()

    };


    db.interviews[email]
      .push(
        interview
      );


    saveDatabase(db);


    return res.json({

      success:true,

      interview

    });

  }

);


/* ======================================================
   COVER LETTER API
====================================================== */

app.get(
  "/api/cover-letters",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.query.email
      );


    if(
      !validEmail(email)
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid email."

        });

    }


    return res.json({

      success:true,

      coverLetters:
        db.coverLetters[email] ||
        []

    });

  }

);


app.post(
  "/api/cover-letters",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.body.email
      );


    if(
      !validEmail(email)
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid email."

        });

    }


    if(
      !db.coverLetters[email]
    ){

      db.coverLetters[email] =
        [];

    }


    const coverLetter = {

      id:
        randomId(
          "cl"
        ),

      data:
        req.body.data ||
        {},

      createdAt:
        new Date()
          .toISOString()

    };


    db.coverLetters[email]
      .push(
        coverLetter
      );


    saveDatabase(db);


    return res.json({

      success:true,

      coverLetter

    });

  }

);


/* ======================================================
   404 API HANDLER
====================================================== */

app.use(
  "/api",
  function(
    req,
    res
  ){

    res
      .status(404)
      .json({

        success:false,

        message:
          "API endpoint not found."

      });

  }
);


/* ======================================================
   GENERAL ERROR HANDLER
====================================================== */

app.use(
  function(
    error,
    req,
    res,
    next
  ){

    console.error(
      "Unhandled server error:",
      error
    );


    res
      .status(500)
      .json({

        success:false,

        message:
          "Internal server error."

      });

  }
);


/* ======================================================
   START SERVER
====================================================== */

app.listen(
  PORT,
  "0.0.0.0",
  function(){

    console.log(
      "========================================"
    );

    console.log(
      "JOBFLOW AI BACKEND"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Server running on port ${PORT}`
    );

    console.log(
      `Premium: ₹${PREMIUM_PRICE}`
    );

    console.log(
      `Premium duration: ${PREMIUM_DAYS} days`
    );

    console.log(
      `UPI ID: ${PAYMENT_UPI_ID}`
    );

    console.log(
      `Owner: ${OWNER_EMAIL || "NOT CONFIGURED"}`
    );

    console.log(
      "========================================"
    );

  }
);