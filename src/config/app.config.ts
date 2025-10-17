import dotenv from "dotenv";

dotenv.config();

interface IAppConfig {
  host: string;
  port: number;
  nodeEnv: string;
}

const appConfig: IAppConfig = {
  host: process.env.APP_HOST as string,
  port: Number(process.env.APP_PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
};

export default appConfig;
