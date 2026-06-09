import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   DB CONNECT
========================= */
mongoose.connect("mongodb+srv://USER:PASS@cluster.mongodb.net/zero");

/* =========================
   MODELS
========================= */
const Wallet = mongoose.model("Wallet", {
  userId: String,
  balances: Object
});

const Transaction = mongoose.model("Transaction", {
  userId: String,
  type: String,
  data: Object,
  date: { type: Date, default: Date.now }
});

/* =========================
   INIT USER (demo)
========================= */
const DEMO_USER = "user1";

async function getWallet() {
  let wallet = await Wallet.findOne({ userId: DEMO_USER });

  if (!wallet) {
    wallet = await Wallet.create({
      userId: DEMO_USER,
      balances: {
        USDT: 5000,
        BTC: 0.4,
        ETH: 3,
        TON: 1000
      }
    });
  }

  return wallet;
}

/* =========================
   WALLET API
========================= */
app.get("/api/wallet", async (req, res) => {
  const wallet = await getWallet();
  res.json(wallet.balances);
});

/* =========================
   DEPOSIT ADDRESS
========================= */
app.get("/api/deposit-address", (req, res) => {
  const coin = req.query.coin;

  const addresses = {
    USDT: "DEMO_USDT_ADDRESS",
    BTC: "DEMO_BTC_ADDRESS",
    ETH: "DEMO_ETH_ADDRESS",
    TON: "DEMO_TON_ADDRESS"
  };

  res.json({
    address: addresses[coin] || "NOT_FOUND"
  });
});

/* =========================
   IRAN PAYMENT (MOCK)
========================= */
app.post("/api/iran-payment", async (req, res) => {
  const { amount } = req.body;

  await Transaction.create({
    userId: DEMO_USER,
    type: "IRAN_PAYMENT",
    data: { amount }
  });

  res.json({
    paymentUrl: "https://example.com/iran-payment"
  });
});

/* =========================
   TURKEY PAYMENT (MOCK)
========================= */
app.post("/api/turkey-payment", async (req, res) => {
  const { amount } = req.body;

  await Transaction.create({
    userId: DEMO_USER,
    type: "TURKEY_PAYMENT",
    data: { amount }
  });

  res.json({
    paymentUrl: "https://example.com/turkey-payment"
  });
});

/* =========================
   TRANSFER (TRADING CORE)
========================= */
app.post("/api/wallet/transfer", async (req, res) => {
  const { from, to, amount } = req.body;

  const wallet = await getWallet();

  if (!wallet.balances[from] || wallet.balances[from] < amount) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  const rates = {
    BTC: 60000,
    ETH: 3000,
    TON: 5,
    USDT: 1
  };

  const usd = amount * (rates[from] || 1);
  const received = usd / (rates[to] || 1);

  wallet.balances[from] -= amount;
  wallet.balances[to] = (wallet.balances[to] || 0) + received;

  await wallet.save();

  await Transaction.create({
    userId: DEMO_USER,
    type: "TRANSFER",
    data: { from, to, amount, received }
  });

  res.json({
    success: true,
    from,
    to,
    sent: amount,
    received
  });
});

/* =========================
   START SERVER
========================= */
app.listen(3000, () => {
  console.log("ZERO EXCHANGE API RUNNING");
});
