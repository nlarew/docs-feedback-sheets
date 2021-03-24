import * as dotenv from "dotenv";
import { main } from "./main";

const dotenvPath = __dirname + "/../.env";
dotenv.config({ path: dotenvPath });

main()
  .catch((err) => {
    console.error(`ERROR! ${err.message}`);
  })
  .finally(() => {
    console.log("done!");
  });
