// pages/api/tally/latest.js
import { _latestTally } from "./save";

export default function handler(_req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(_latestTally());
}