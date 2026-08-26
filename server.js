/*
=========================================================
 JOBFLOW AI - SECURE BACKEND
 server.js

 FEATURES
 --------------------------------------------------------
 • Email verification
 • 48-hour trial
 • ₹499 Premium membership
 • 30-day Premium access
 • Razorpay order creation
 • Server-side payment verification
 • Payment status verification
 • Duplicate payment protection
 • Membership expiry
 • Owner account support
 • User profile API
 • Application API
 • Resume API
 • Interview API
 • Cover-letter API
 • Secure environment variables
 • Health check
 • CORS
 • Rate limiting
 • Security headers

 IMPORTANT
 --------------------------------------------------------
 NEVER put:
   RAZORPAY_KEY_SECRET
   EMAIL_PASSWORD
   JWT_SECRET
   DATABASE_PASSWORD

 inside index.html or GitHub frontend code.

=========================================================
*/


require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const Razorpay = require("razorpay");
const nodemailer = require("nodemailer");


/* ======================================================
   APP
====================================================== */

const app = express();

const PORT =
  Number(process.env.PORT) || 3000;


/* ======================================================
   CONFIG
====================================================== */

const PREMIUM_PRICE =
  499;

const PREMIUM_DAYS =
  30;

const TRIAL_HOURS =
  48;

const OWNER_EMAIL =
  String(
    process.env.OWNER_EMAIL || ""
  )
  .trim()
  .toLowerCase();


/* ======================================================
   DATABASE FILE
   Simple JSON database for development.

   For a large production application,
   replace this with PostgreSQL/Supabase/Firebase/etc.
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


if(
  !fs.existsSync(
    DATA_DIR
  )
){

  fs.mkdirSync(
    DATA_DIR,
    {
      recursive:true
    }
  );

}


function defaultDatabase(){

  return {

    users: {},

    payments: {},

    orders: {},

    verificationCodes: {},

    applications: {},

    resumes: {},

    interviews: {},

    coverLetters: {}

  };

}


function loadDatabase(){

  try{

    if(
      !fs.existsSync(
        DB_FILE
      )
    ){

      const db =
        defaultDatabase();

      saveDatabase(
        db
      );

      return db;

    }


    const raw =
      fs.readFileSync(
        DB_FILE,
        "utf8"
      );


    return {
      ...defaultDatabase(),
      ...JSON.parse(
        raw
      )
    };

  }

  catch(error){

    console.error(
      "Database read error:",
      error
    );

    return defaultDatabase();

  }

}


function saveDatabase(
  db
){

  const temporaryFile =
    DB_FILE +
    ".tmp";


  fs.writeFileSync(
    temporaryFile,
    JSON.stringify(
      db,
      null,
      2
    ),
    "utf8"
  );


  fs.renameSync(
    temporaryFile,
    DB_FILE
  );

}


const db =
  loadDatabase();


/* ======================================================
   MIDDLEWARE
====================================================== */

app.disable(
  "x-powered-by"
);


app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      true,
    credentials:true
  })
);


/*
 IMPORTANT:
 The webhook endpoint later uses raw body.
 Therefore the webhook route is defined before
 express.json().
*/

app.use(
  express.json({
    limit:"200kb"
  })
);


app.use(
  express.urlencoded({
    extended:false,
    limit:"50kb"
  })
);


/* ======================================================
   BASIC SECURITY HEADERS
====================================================== */

app.use(
  function(
    req,
    res,
    next
  ){

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

    next();

  }
);


/* ======================================================
   SIMPLE RATE LIMITER
====================================================== */

const rateMap =
  new Map();


function rateLimit(
  windowMs,
  maxRequests
){

  return function(
    req,
    res,
    next
  ){

    const now =
      Date.now();


    const ip =
      req.ip ||
      req.headers[
        "x-forwarded-for"
      ] ||
      "unknown";


    const current =
      rateMap.get(
        ip
      );


    if(
      !current ||
      now -
      current.start >
      windowMs
    ){

      rateMap.set(
        ip,
        {
          start:now,
          count:1
        }
      );

      return next();

    }


    current.count++;


    if(
      current.count >
      maxRequests
    ){

      return res
        .status(429)
        .json({
          success:false,
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
){

  return String(
    email || ""
  )
  .trim()
  .toLowerCase();

}


function validEmail(
  email
){

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(
      email
    );

}


function randomId(
  prefix
){

  return (
    prefix +
    "_" +
    crypto
      .randomBytes(
        16
      )
      .toString("hex")
  );

}


function randomCode(){

  return String(
    crypto.randomInt(
      100000,
      1000000
    )
  );

}


function hash(
  value
){

  return crypto
    .createHash(
      "sha256"
    )
    .update(
      String(value)
    )
    .digest("hex");

}


function safeEqual(
  a,
  b
){

  const aBuffer =
    Buffer.from(
      String(a)
    );

  const bBuffer =
    Buffer.from(
      String(b)
    );


  if(
    aBuffer.length !==
    bBuffer.length
  ){

    return false;

  }


  return crypto.timingSafeEqual(
    aBuffer,
    bBuffer
  );

}


function getUser(
  email
){

  return db.users[
    cleanEmail(
      email
    )
  ];

}


function ensureUser(
  email
){

  email =
    cleanEmail(
      email
    );


  if(
    !db.users[email]
  ){

    db.users[email] = {

      email,

      emailVerified:false,

      createdAt:
        new Date()
          .toISOString(),

      trialStartedAt:null,

      trialExpiresAt:null,

      premiumExpiresAt:null,

      premium:false,

      owner:
        OWNER_EMAIL &&
        email ===
        OWNER_EMAIL

    };

  }


  return db.users[email];

}


function isOwner(
  email
){

  return (
    OWNER_EMAIL &&
    cleanEmail(
      email
    ) ===
    OWNER_EMAIL
  );

}


function premiumActive(
  user
){

  if(
    !user
  ){

    return false;

  }


  if(
    user.owner === true
  ){

    return true;

  }


  const expiry =
    Number(
      user.premiumExpiresAt ||
      0
    );


  return (
    expiry >
    Date.now()
  );

}


function trialActive(
  user
){

  if(
    !user
  ){

    return false;

  }


  const expiry =
    Number(
      user.trialExpiresAt ||
      0
    );


  return (
    expiry >
    Date.now()
  );

}


function membershipStatus(
  user
){

  if(
    !user
  ){

    return {

      owner:false,

      premium:false,

      trial:false,

      premiumExpiresAt:null,

      trialExpiresAt:null

    };

  }


  return {

    owner:
      user.owner === true,

    premium:
      premiumActive(
        user
      ),

    trial:
      trialActive(
        user
      ),

    premiumExpiresAt:
      user.premiumExpiresAt ||
      null,

    trialExpiresAt:
      user.trialExpiresAt ||
      null

  };

}


/* ======================================================
   RAZORPAY
====================================================== */

let razorpay = null;


if(
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
){

  razorpay =
    new Razorpay({

      key_id:
        process.env.RAZORPAY_KEY_ID,

      key_secret:
        process.env.RAZORPAY_KEY_SECRET

    });

}
else{

  console.warn(
    "WARNING: Razorpay credentials are not configured."
  );

}


/* ======================================================
   EMAIL
====================================================== */

let transporter = null;


if(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASSWORD
){

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

      auth:{

        user:
          process.env.SMTP_USER,

        pass:
          process.env.SMTP_PASSWORD

      }

    });

}
else{

  console.warn(
    "WARNING: SMTP credentials are not configured."
  );

}


/* ======================================================
   SEND EMAIL
====================================================== */

async function sendVerificationEmail(
  email,
  code
){

  if(
    !transporter
  ){

    console.log(
      "EMAIL VERIFICATION CODE:",
      email,
      code
    );

    return false;

  }


  const from =
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER;


  await transporter.sendMail({

    from,

    to:email,

    subject:
      "JobFlow AI - Verify your email",

    text:
      "Your JobFlow AI verification code is " +
      code +
      ". It expires in 10 minutes.",

    html:

      "<div style=\"font-family:Arial,sans-serif;max-width:500px;margin:auto\">" +

      "<h2 style=\"color:#2563eb\">JobFlow AI</h2>" +

      "<p>Use this verification code to verify your email:</p>" +

      "<div style=\"font-size:30px;font-weight:bold;letter-spacing:8px\">" +

      code +

      "</div>" +

      "<p>This code expires in 10 minutes.</p>" +

      "<p>If you did not request this code, you can ignore this email.</p>" +

      "</div>"

  });


  return true;

}


/* ======================================================
   HEALTH CHECK
====================================================== */

app.get(
  "/api/health",
  function(
    req,
    res
  ){

    res.json({

      success:true,

      service:
        "JobFlow AI API",

      time:
        new Date()
          .toISOString(),

      paymentConfigured:
        Boolean(
          razorpay
        ),

      emailConfigured:
        Boolean(
          transporter
        )

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
  ){

    const email =
      cleanEmail(
        req.body.email
      );


    if(
      !validEmail(
        email
      )
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Enter a valid email address."

        });

    }


    const user =
      ensureUser(
        email
      );


    if(
      !user.trialStartedAt
    ){

      const start =
        Date.now();


      user.trialStartedAt =
        new Date(
          start
        )
        .toISOString();


      user.trialExpiresAt =
        new Date(
          start +
          TRIAL_HOURS *
          60 *
          60 *
          1000
        )
        .toISOString();


      saveDatabase(
        db
      );

    }


    res.json({

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
   SEND EMAIL VERIFICATION
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
  ){

    try{

      const email =
        cleanEmail(
          req.body.email
        );


      if(
        !validEmail(
          email
        )
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Enter a valid email address."

          });

      }


      const user =
        ensureUser(
          email
        );


      const code =
        randomCode();


      db.verificationCodes[
        email
      ] = {

        hash:
          hash(
            code
          ),

        expiresAt:
          Date.now() +
          10 *
          60 *
          1000,

        attempts:0

      };


      saveDatabase(
        db
      );


      await sendVerificationEmail(
        email,
        code
      );


      res.json({

        success:true,

        message:
          "Verification code sent."

      });

    }

    catch(error){

      console.error(
        "Send verification error:",
        error
      );


      res
        .status(500)
        .json({

          success:false,

          message:
            "Could not send verification email."

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
  ){

    const email =
      cleanEmail(
        req.body.email
      );


    const code =
      String(
        req.body.code ||
        ""
      )
      .trim();


    if(
      !validEmail(
        email
      ) ||
      !/^\d{6}$/.test(
        code
      )
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Invalid email or verification code."

        });

    }


    const record =
      db.verificationCodes[
        email
      ];


    if(
      !record
    ){

      return res
        .status(400)
        .json({

          success:false,

          message:
            "Verification code not found. Request a new code."

        });

    }


    if(
      Date.now() >
      record.expiresAt
    ){

      delete db.verificationCodes[
        email
      ];


      saveDatabase(
        db
      );


      return res
        .400
        .json({

          success:false,

          message:
            "Verification code expired."

        });

    }


    record.attempts++;


    if(
      record.attempts >
      5
    ){

      delete db.verificationCodes[
        email
      ];


      saveDatabase(
        db
      );


      return res
        .status(429)
        .json({

          success:false,

          message:
            "Too many verification attempts."

        });

    }


    const valid =
      safeEqual(
        hash(code),
        record.hash
      );


    if(
      !valid
    ){

      saveDatabase(
        db
      );


      return res
        .status(400)
        .json({

          success:false,

          message:
            "Incorrect verification code."

        });

    }


    const user =
      ensureUser(
        email
      );


    user.emailVerified =
      true;


    user.emailVerifiedAt =
      new Date()
        .toISOString();


    delete db.verificationCodes[
      email
    ];


    saveDatabase(
      db
    );


    res.json({

      success:true,

      message:
        "Email verified successfully.",

      membership:
        membershipStatus(
          user
        )

    });

  }
);


/* ======================================================
   CREATE PREMIUM ORDER
====================================================== */

app.post(
  "/api/payment/create-order",

  rateLimit(
    60 * 1000,
    10
  ),

  async function(
    req,
    res
  ){

    try{

      if(
        !razorpay
      ){

        return res
          .status(503)
          .json({

            success:false,

            message:
              "Payment gateway is not configured."

          });

      }


      const email =
        cleanEmail(
          req.body.email
        );


      if(
        !validEmail(
          email
        )
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "A valid email is required."

          });

      }


      const user =
        ensureUser(
          email
        );


      if(
        !user.emailVerified
      ){

        return res
          .status(403)
          .json({

            success:false,

            message:
              "Verify your email before purchasing Premium."

          });

      }


      if(
        premiumActive(
          user
        )
      ){

        return res.json({

          success:true,

          alreadyPremium:true,

          membership:
            membershipStatus(
              user
            )

        });

      }


      const receipt =
        "jf_" +
        Date.now() +
        "_" +
        crypto
          .randomBytes(
            4
          )
          .toString("hex");


      const order =
        await razorpay.orders.create({

          amount:
            PREMIUM_PRICE *
            100,

          currency:
            "INR",

          receipt,

          notes:{

            email,

            product:
              "JobFlow AI Premium",

            duration:
              "30 days"

          }

        });


      db.orders[
        order.id
      ] = {

        orderId:
          order.id,

        email,

        amount:
          PREMIUM_PRICE *
          100,

        currency:
          "INR",

        status:
          "created",

        createdAt:
          new Date()
            .toISOString()

      };


      saveDatabase(
        db
      );


      res.json({

        success:true,

        keyId:
          process.env
            .RAZORPAY_KEY_ID,

        orderId:
          order.id,

        amount:
          order.amount,

        currency:
          order.currency,

        email,

        name:
          "JobFlow AI Premium"

      });

    }

    catch(error){

      console.error(
        "Create order error:",
        error
      );


      res
        .status(500)
        .json({

          success:false,

          message:
            "Could not create payment order."

        });

    }

  }
);


/* ======================================================
   VERIFY PAYMENT
====================================================== */

app.post(
  "/api/payment/verify",

  rateLimit(
    60 * 1000,
    20
  ),

  async function(
    req,
    res
  ){

    try{

      if(
        !razorpay ||
        !process.env.RAZORPAY_KEY_SECRET
      ){

        return res
          .status(503)
          .json({

            success:false,

            message:
              "Payment gateway is not configured."

          });

      }


      const {

        email,

        razorpay_order_id,

        razorpay_payment_id,

        razorpay_signature

      } =
        req.body;


      const clean =
        cleanEmail(
          email
        );


      if(
        !validEmail(
          clean
        )
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
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Incomplete payment details."

          });

      }


      const orderRecord =
        db.orders[
          razorpay_order_id
        ];


            /*
       IMPORTANT:
       Do not trust the order/email supplied
       by the browser.
      */

      if(
        !orderRecord ||
        cleanEmail(orderRecord.email) !== clean
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Payment order does not match the account."

          });

      }


      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
          )
          .update(
            razorpay_order_id +
            "|" +
            razorpay_payment_id
          )
          .digest("hex");


      if(
        !safeEqual(
          generatedSignature,
          razorpay_signature
        )
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Payment verification failed."

          });

      }


      /*
       Verify the payment directly with Razorpay.
      */

      const payment =
        await razorpay.payments.fetch(
          razorpay_payment_id
        );


      if(
        payment.order_id !==
        razorpay_order_id
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Payment and order do not match."

          });

      }


      if(
        Number(payment.amount) !==
        PREMIUM_PRICE * 100
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Incorrect payment amount."

          });

      }


      if(
        payment.currency !== "INR"
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Incorrect payment currency."

          });

      }


      if(
        payment.status !== "captured"
      ){

        return res
          .status(400)
          .json({

            success:false,

            message:
              "Payment has not been captured yet."

          });

      }


      /*
       Prevent the same payment from
       activating Premium twice.
      */

      if(
        db.payments[
          razorpay_payment_id
        ]
      ){

        const existingUser =
          getUser(clean);


        return res.json({

          success:true,

          alreadyProcessed:true,

          message:
            "This payment was already processed.",

          membership:
            membershipStatus(
              existingUser
            )

        });

      }


      const user =
        ensureUser(clean);


      /*
       Extend an existing membership instead
       of losing remaining membership days.
      */

      const currentExpiry =
        Number(
          user.premiumExpiresAt || 0
        );


      const membershipStart =
        Math.max(
          Date.now(),
          currentExpiry
        );


      const membershipExpiry =
        membershipStart +
        PREMIUM_DAYS *
        24 *
        60 *
        60 *
        1000;


      user.premium = true;


      user.premiumExpiresAt =
        new Date(
          membershipExpiry
        ).toISOString();


      user.lastPaymentId =
        razorpay_payment_id;


      user.lastOrderId =
        razorpay_order_id;


      user.premiumActivatedAt =
        new Date()
          .toISOString();


      db.payments[
        razorpay_payment_id
      ] = {

        paymentId:
          razorpay_payment_id,

        orderId:
          razorpay_order_id,

        email:
          clean,

        amount:
          payment.amount,

        currency:
          payment.currency,

        status:
          payment.status,

        verifiedAt:
          new Date()
            .toISOString()

      };


      orderRecord.status =
        "paid";


      orderRecord.paymentId =
        razorpay_payment_id;


      orderRecord.paidAt =
        new Date()
          .toISOString();


      saveDatabase(db);


      return res.json({

        success:true,

        message:
          "Payment verified successfully. Premium is now active.",

        membership:
          membershipStatus(
            user
          )

      });

    }

    catch(error){

      console.error(
        "Payment verification error:",
        error
      );


      return res
        .status(500)
        .json({

          success:false,

          message:
            "Payment verification could not be completed."

        });

    }

  }
);


/* ======================================================
   MEMBERSHIP STATUS
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
            "Valid email required."

        });

    }


    const user =
      getUser(email);


    return res.json({

      success:true,

      email,

      membership:
        membershipStatus(user)

    });

  }
);


/* ======================================================
   PROFILE
====================================================== */

app.get(
  "/api/profile",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.query.email
      );


    const user =
      getUser(email);


    if(!user){

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

      profile:{

        email:
          user.email,

        emailVerified:
          user.emailVerified,

        owner:
          user.owner === true,

        membership:
          membershipStatus(user)

      }

    });

  }
);


/* ======================================================
   APPLICATIONS
====================================================== */

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
            "Valid email required."

        });

    }


    if(
      !db.applications[email]
    ){

      db.applications[email] = [];

    }


    const application = {

      id:
        randomId("app"),

      company:
        String(
          req.body.company || ""
        ).slice(0,200),

      role:
        String(
          req.body.role || ""
        ).slice(0,200),

      status:
        String(
          req.body.status ||
          "Applied"
        ).slice(0,50),

      date:
        String(
          req.body.date ||
          new Date()
            .toISOString()
            .slice(0,10)
        ).slice(0,30),

      createdAt:
        new Date()
          .toISOString()

    };


    db.applications[email].push(
      application
    );


    saveDatabase(db);


    return res.json({

      success:true,

      application

    });

  }
);


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


    return res.json({

      success:true,

      applications:
        db.applications[email] || []

    });

  }
);


/* ======================================================
   PREMIUM RESUME
====================================================== */

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


    const user =
      getUser(email);


    if(
      !premiumActive(user)
    ){

      return res
        .status(403)
        .json({

          success:false,

          message:
            "Premium membership required."

        });

    }


    db.resumes[email] = {

      ...req.body,

      email,

      updatedAt:
        new Date()
          .toISOString()

    };


    saveDatabase(db);


    return res.json({

      success:true,

      message:
        "Resume saved successfully."

    });

  }
);


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


    const user =
      getUser(email);


    if(
      !premiumActive(user)
    ){

      return res
        .status(403)
        .json({

          success:false,

          message:
            "Premium membership required."

        });

    }


    return res.json({

      success:true,

      resume:
        db.resumes[email] || null

    });

  }
);


/* ======================================================
   PREMIUM INTERVIEW
====================================================== */

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


    const user =
      getUser(email);


    if(
      !premiumActive(user)
    ){

      return res
        .status(403)
        .json({

          success:false,

          message:
            "Premium membership required."

        });

    }


    if(
      !db.interviews[email]
    ){

      db.interviews[email] = [];

    }


    db.interviews[email].push({

      id:
        randomId("int"),

      question:
        String(
          req.body.question || ""
        ).slice(0,500),

      answer:
        String(
          req.body.answer || ""
        ).slice(0,5000),

      date:
        new Date()
          .toISOString()

    });


    saveDatabase(db);


    return res.json({

      success:true,

      message:
        "Interview saved successfully."

    });

  }
);


/* ======================================================
   PREMIUM COVER LETTER
====================================================== */

app.post(
  "/api/cover-letter",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.body.email
      );


    const user =
      getUser(email);


    if(
      !premiumActive(user)
    ){

      return res
        .status(403)
        .json({

          success:false,

          message:
            "Premium membership required."

        });

    }


    db.coverLetters[email] = {

      company:
        String(
          req.body.company || ""
        ).slice(0,200),

      role:
        String(
          req.body.role || ""
        ).slice(0,200),

      content:
        String(
          req.body.content || ""
        ).slice(0,10000),

      updatedAt:
        new Date()
          .toISOString()

    };


    saveDatabase(db);


    return res.json({

      success:true,

      message:
        "Cover letter saved successfully."

    });

  }
);


/* ======================================================
   ADMIN / OWNER STATUS
====================================================== */

app.get(
  "/api/owner-status",

  function(
    req,
    res
  ){

    const email =
      cleanEmail(
        req.query.email
      );


    if(
      !isOwner(email)
    ){

      return res
        .status(403)
        .json({

          success:false,

          message:
            "Owner access denied."

        });

    }


    const users =
      Object.values(
        db.users
      );


    const paidUsers =
      users.filter(
        user =>
          premiumActive(user) &&
          !user.owner
      );


    return res.json({

      success:true,

      owner:true,

      totalUsers:
        users.length,

      activePremiumUsers:
        paidUsers.length,

      premiumPrice:
        PREMIUM_PRICE,

      premiumDays:
        PREMIUM_DAYS

    });

  }
);


/* ======================================================
   CLEAN EXPIRED MEMBERSHIPS
====================================================== */

function cleanExpiredMemberships(){

  let changed = false;


  Object.values(
    db.users
  )
  .forEach(
    user => {

      if(
        user.owner === true
      ){

        return;

      }


      if(
        user.premium &&
        Number(
          user.premiumExpiresAt || 0
        ) <= Date.now()
      ){

        user.premium = false;

        changed = true;

      }

    }
  );


  if(changed){

    saveDatabase(db);

  }

}


setInterval(
  cleanExpiredMemberships,
  60 * 60 * 1000
);


/* ======================================================
   404 API
====================================================== */

app.use(
  function(
    req,
    res
  ){

    res
      .status(404)
      .json({

        success:false,

        message:
          "Endpoint not found."

      });

  }
);


/* ======================================================
   ERROR HANDLER
====================================================== */

app.use(
  function(
    error,
    req,
    res,
    next
  ){

    console.error(
      "Server error:",
      error
    );


    if(
      res.headersSent
    ){

      return next(error);

    }


    return res
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
  function(){

    console.log("");
    console.log(
      "======================================"
    );

    console.log(
      "       JOBFLOW AI SERVER"
    );

    console.log(
      "======================================"
    );

    console.log(
      "Port:",
      PORT
    );

    console.log(
      "Premium:",
      "₹" +
      PREMIUM_PRICE +
      " / " +
      PREMIUM_DAYS +
      " days"
    );

    console.log(
      "Razorpay:",
      razorpay
        ? "READY"
        : "NOT CONFIGURED"
    );

    console.log(
      "Email:",
      transporter
        ? "READY"
        : "NOT CONFIGURED"
    );

    console.log(
      "Owner:",
      OWNER_EMAIL
        ? "CONFIGURED"
        : "NOT CONFIGURED"
    );

    console.log(
      "======================================"
    );

    console.log("");

  }
);