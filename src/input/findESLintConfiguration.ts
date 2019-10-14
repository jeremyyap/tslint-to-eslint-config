import * as rewire from "rewire";
import * as path from "path";
import * as fs from "fs";

import { ESLintRuleSeverity } from "../rules/types";
import { TSLintToESLintSettings } from "../types";
import { FindConfigurationDependencies } from "./findConfiguration";

export type ESLintConfiguration = {
    env: {
        [i: string]: boolean;
    };
    extends: string | string[];
    rules: ESLintConfigurationRules;
};

export type ESLintConfigurationRules = {
    [i: string]: ESLintConfigurationRuleValue;
};

export type ESLintConfigurationRuleValue =
    | 0
    | 1
    | 2
    | ESLintRuleSeverity
    | [ESLintRuleSeverity, any];

const defaultESLintConfiguration = {
    env: {},
    extends: [],
    rules: {},
};

export const findESLintConfiguration = async (
    dependencies: FindConfigurationDependencies,
    rawSettings: Pick<TSLintToESLintSettings, "config" | "eslint">,
): Promise<ESLintConfiguration | Error> => {
    const rawConfiguration = loadConfig();

    console.log(rawConfiguration);

    return rawConfiguration instanceof Error
        ? rawConfiguration
        : {
              ...defaultESLintConfiguration,
              ...rawConfiguration,
          };
};

function loadConfig() {
    const ConfigArrayFactory = rewire("eslint/lib/cli-engine/config-array-factory");
    const loadConfigFile = ConfigArrayFactory.__get__("loadConfigFile");
    const configFilenames = ConfigArrayFactory.__get__("configFilenames");

    for (const filename of configFilenames) {
        const filePath = path.join(process.cwd(), filename);

        if (fs.existsSync(filePath)) {
            let configData;

            try {
                configData = loadConfigFile(filePath);
            } catch (error) {
                return error;
            }

            if (configData) {
                return configData;
            }
        }
    }
}
