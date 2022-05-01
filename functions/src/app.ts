import express, { Request, Response } from "express";
import { XummSdk } from "xumm-sdk";
import cors from "cors";
import { xrplClient } from "./xrpl";

export const app = express();

const xumm = new XummSdk(
  "2c39b04d-aac8-457e-b3be-4e07cd5cdaf9",
  "fa0e7515-38eb-47fe-8c46-ed73b2f9d6db"
);

app.use(cors());

app.get("/sign-in", async (req: Request, res: Response) => {
  await xumm.ping();

  const subscription = await xumm.payload.create({
    txjson: {
      TransactionType: "SignIn",
    },
  });

  console.log("sign-in", subscription);

  res.send({
    uuid: subscription?.uuid,
    qr_png: subscription?.refs.qr_png,
    websocket_status: subscription?.refs.websocket_status,
    link: subscription?.next.always,
  });
});

app.get(
  "/account_info/:account",
  async (req: Request, res: Response) => {
    console.log({ params: req.params, path: req.path });
    const { account } = req.params;

    const results = await xrplClient.send({
        "command": "account_info",
        "account": account,
        "strict": true,
        "ledger_index": "current",
        "queue": true,
      });

    console.log(results);
    results?.response;
    res.send({uuid: results?.account_data?.Account});
  }
);

app.get(
  "/getMessage",
  (req: Request, res: Response) => {
    if (Math.random() < 0.5) {
          res.send("World!");
      } else {
          res.send("Hello!");
      }
  });

  app.listen("5001", () => {
    console.log("server listening on port %s", "5001");
  });
