import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

let logs = [];

/* LOG SYSTEM */
app.post("/log",(req,res)=>{
logs.push({
data:req.body,
time:new Date().toISOString()
});
res.json({ok:true});
});

/* TELEGRAM */
async function telegram(msg){
await fetch("https://api.telegram.org/botTOKEN/sendMessage",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
chat_id:"CHAT_ID",
text:msg
})
});
}

/* UPDATE NOTIFY */
app.post("/notify",async (req,res)=>{

await telegram(`ORDER UPDATE: ${JSON.stringify(req.body)}`);

res.json({ok:true});
});

app.listen(3000,()=>console.log("V5 running"));
