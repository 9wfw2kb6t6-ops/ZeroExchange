import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Telegram Config
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN";
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID";

// 📩 Telegram Notifier
async function sendTelegram(msg){
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: msg
    })
  });
}

// 📊 Log system
let logs = [];

function addLog(action, data){
  const log = {
    action,
    data,
    time: new Date().toISOString()
  };

  logs.push(log);

  sendTelegram(`📢 ${action}\n${JSON.stringify(data)}`);
}

// 🚀 Update order status API
app.post("/update-order", async (req,res)=>{
  const { orderId, status } = req.body;

  addLog("ORDER_UPDATE", {orderId, status});

  res.json({success:true});
});

// 📜 Logs API
app.get("/logs",(req,res)=>{
  res.json(logs);
});

app.listen(3000, ()=>{
  console.log("Backend running on port 3000");
});
