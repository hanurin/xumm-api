import { XrplClient } from "xrpl-client";

const MAIN_NET = [
  "wss://xrplcluster.com",
  "wss://xrpl.link",
  "wss://s2.ripple.com",
];

export const xrplClient = new XrplClient(MAIN_NET[0]);
