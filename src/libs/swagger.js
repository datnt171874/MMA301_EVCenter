import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read YAML file
const yamlPath = path.join(__dirname, "../docs/swagger.yaml");
const yamlContent = fs.readFileSync(yamlPath, "utf8");

// Parse YAML to JSON
import yaml from "js-yaml";
const swaggerSpec = yaml.load(yamlContent);

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerSpec, { explorer: true });


