const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});


/* =====================================
   CREATE ₹299 PREMIUM ORDER
===================================== */

app.post("/api/create-order", async (req, res) => {

  try {

    const order = await razorpay.orders.create({

      amount: 29900,

      currency: "INR",

      receipt:
        "jobflow_" +
        Date.now(),

      notes: {
        product: "JobFlow Premium",
        plan: "Monthly"
      }

    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to create payment order."
    });

  }

});


/* =====================================
   VERIFY PAYMENT
===================================== */

app.post("/api/verify-payment", async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {

      return res.status(400).json({
        success: false,
        message: "Incomplete payment information."
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


    const valid =
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      );


    if(!valid){

      return res.status(400).json({
        success:false,
        message:"Payment verification failed."
      });

    }


    /*
      IMPORTANT:

      Payment is genuine after
      signature verification.

      Later we will connect this
      to a real user database and
      activate Premium there.
    */

    res.json({

      success:true,

      premium:true,

      message:
        "Payment verified successfully."

    });


  } catch(error) {

    console.error(error);

    res.status(500).json({

      success:false,

      message:
        "Payment verification error."

    });

  }

});


/* =====================================
   HEALTH CHECK
===================================== */

app.get("/api/health", (req,res) => {

  res.json({
    success:true,
    service:"JobFlow Payment Server",
    status:"running"
  });

});


/* =====================================
   START SERVER
===================================== */

const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    "JobFlow payment server running on port " +
    PORT
  );

});