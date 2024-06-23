#!/usr/bin/env node

import fs from "fs";
import https from "https";
import { URL } from "url";
import { parse } from "yaml";
import { codegen } from "./codegen";
import { OpenAPISpec } from "./converter";

async function readSpec(input: string): Promise<object> {
  let content: string;
  if (input.startsWith("http://") || input.startsWith("https://")) {
    content = await new Promise((resolve, reject) => {
      https
        .get(new URL(input), (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => resolve(data));
        })
        .on("error", reject);
    });
  } else {
    content = fs.readFileSync(input, "utf8");
  }

  if (input.endsWith(".yaml") || input.endsWith(".yml")) {
    return parse(content);
  } else if (input.endsWith(".json")) {
    return JSON.parse(content);
  }
  throw new Error("Unsupported file format. Please provide a YAML or JSON file.");
}

async function main() {
  const args = process.argv.slice(2);
  const inputFile = args[0];
  const outputFile = args.includes("-o") ? args[args.indexOf("-o") + 1] : null;

  if (!inputFile) {
    console.error("Please provide an input file or URL.");
    process.exit(1);
  }

  try {
    const spec = await readSpec(inputFile);
    const code = codegen(spec as OpenAPISpec);

    if (outputFile) {
      fs.writeFileSync(outputFile, code);
      console.log(`Zod schema generated and saved to ${outputFile}`);
    } else {
      console.log(code);
    }
  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main();
