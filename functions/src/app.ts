import express, { Request, Response } from "express";
import { XummSdk } from "xumm-sdk";
import cors from "cors";
import { xrplClient } from "./xrpl";
import * as crypto from "crypto";

export const app = express();

const ENCRYPTION_KEY = "abcdefghijklmnop".repeat(2);
// Must be 256 bits (32 characters)
const IV_LENGTH = 16;
// For AES, this is always 16
const encrypt = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(ENCRYPTION_KEY),
      iv,
    );
    const encrypted = cipher.update(text);

    return (
      iv.toString("hex") +
      ":" +
      Buffer.concat([encrypted, cipher.final()]).toString("hex"));
};

const xumm = new XummSdk(
  "2c39b04d-aac8-457e-b3be-4e07cd5cdaf9",
  "fa0e7515-38eb-47fe-8c46-ed73b2f9d6db"
);

app.use(cors());

app.get("/test", async (req: Request, res: Response) => {
  const apikey = encrypt("2c39b04d-aac8-457e-b3be-4e07cd5cdaf9");
  const secret = encrypt("fa0e7515-38eb-47fe-8c46-ed73b2f9d6db");

  console.log(apikey);
  console.log(secret);

  res.send({
    apikey: apikey,
    secret: secret,
  });
});

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
  "/poll/:uuid",
  async (req: Request, res: Response) => {
    console.log({ params: req.params, path: req.path });
    const { uuid } = req.params;

    const results = await xumm.payload.get(uuid);

    console.log(results);

    results?.response;
    res.send({
      ...(results?.response ?? {}),
    });
  }
);

  app.listen("5001", () => {
    console.log("server listening on port %s", "5001");
  });
