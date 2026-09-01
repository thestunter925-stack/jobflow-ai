/*
=========================================================
 JOBFLOW AI
 paymentService.js

 UPI PAYMENT SERVICE
 --------------------------------------------------------
 • ₹499 Premium
 • 30-day Premium
 • UPI payment link
 • Unique payment ID
 • Transaction reference validation
 • Manual verification workflow

 IMPORTANT
 --------------------------------------------------------
 This uses a normal UPI ID.

 It does NOT claim automatic payment verification.
 Premium must only be activated after the payment
 has actually been verified.
=========================================================
*/

const crypto = require("crypto");


/* ======================================================
   PAYMENT CONFIG
====================================================== */

const PAYMENT_AMOUNT = 499;

const PREMIUM_DAYS = 30;

const PAYMENT_UPI_ID =
  "8374506945@fam";


/* ======================================================
   CREATE UNIQUE PAYMENT ID
====================================================== */

function createPaymentId() {

  return (
    "pay_" +
    Date.now() +
    "_" +
    crypto
      .randomBytes(6)
      .toString("hex")
  );

}


/* ======================================================
   CREATE UPI PAYMENT LINK
====================================================== */

function createUpiLink({
  email,
  paymentId
}) {

  const params =
    new URLSearchParams({

      pa:
        PAYMENT_UPI_ID,

      pn:
        "JobFlow AI",

      am:
        PAYMENT_AMOUNT.toFixed(2),

      cu:
        "INR",

      tn:
        `JobFlow Premium ${paymentId}`

    });


  return (
    "upi://pay?" +
    params.toString()
  );

}


/* ======================================================
   CREATE PAYMENT REQUEST
====================================================== */

function createPaymentRequest(
  email
) {

  const paymentId =
    createPaymentId();


  return {

    paymentId,

    email,

    amount:
      PAYMENT_AMOUNT,

    currency:
      "INR",

    provider:
      "UPI",

    upiId:
      PAYMENT_UPI_ID,

    paymentLink:
      createUpiLink({

        email,

        paymentId

      }),

    status:
      "pending",

    premiumDays:
      PREMIUM_DAYS,

    reference:
      null,

    createdAt:
      new Date()
        .toISOString(),

    submittedAt:
      null,

    verifiedAt:
      null

  };

}


/* ======================================================
   VALIDATE TRANSACTION REFERENCE
====================================================== */

function validateReference(
  reference
) {

  if (
    typeof reference !==
    "string"
  ) {

    return false;

  }


  const value =
    reference.trim();


  if (
    value.length <
    6
  ) {

    return false;

  }


  if (
    value.length >
    100
  ) {

    return false;

  }


  return /^[A-Za-z0-9_-]+$/
    .test(
      value
    );

}


/* ======================================================
   EXPORT
====================================================== */

module.exports = {

  PAYMENT_AMOUNT,

  PREMIUM_DAYS,

  PAYMENT_UPI_ID,

  createPaymentRequest,

  validateReference

};