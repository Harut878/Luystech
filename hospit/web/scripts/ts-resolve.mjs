// Node-ով .ts սկրիպտներ գործարկելիս թույլ է տալիս ներմուծել առանց ընդլայնման ("./quiz" → "./quiz.ts"),
// ինչպես անում է Next-ը։ Օգտագործում՝ node --import ./scripts/ts-resolve.mjs scripts/<file>.ts
import { register } from "node:module";

register("./ts-resolve-hooks.mjs", import.meta.url);
