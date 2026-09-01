const crypto = require("crypto");

const PAYMENT_AMOUNT = 499;
const PREMIUM_DAYS = 30;

const PAYMENT_UPI_ID = "8374506945@fam";

function createPaymentId() {
  return (
    "pay_" +
    Date.now() +
    "_" +
    crypto.randomBytes(6).toString("hex")
  );
}

function createUpiLink({
  email,
  paymentId
}) {
  const params = new URLSearchParams({
    pa: PAYMENT_UPI_ID,
    pn: "JobFlow AI",
    am: PAYMENT_AMOUNT.toFixed(2),
    cu: "INR",
    tn: `JobFlow Premium ${paymentId}`
  });

  return `upi://pay?${params.toString()}`;
}

function createPaymentRequest(email) {
  const paymentId = createPaymentId();

  return {
    paymentId,
    email,
    amount: PAYMENT_AMOUNT,
    currency: "INR",
    provider: "UPI",
    upiId: PAYMENT_UPI_ID,
    paymentLink: createUpiLink({
      email,
      paymentId
    }),
    status: "pending",
    premiumDays: PREMIUM_DAYS,
    createdAt: new Date().toISOString()
  };
}

function validateReference(reference) {
  return (
    typeof reference === "string" &&
    /^[A-Za-z0-9_-]{6,100}$/.test(
      reference.trim()
    )
  );
}

module.exports = {
  PAYMENT_AMOUNT,
  PREMIUM_DAYS,
  PAYMENT_UPI_ID,
  createPaymentRequest,
  validateReference
};