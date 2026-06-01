import express,{Express} from "express";
import dotenv from "dotenv";
import * as database from "./config/database"
import mainRoutes from "./routes/index.routes";
import cors from "cors"
dotenv.config();

// kết nối với database
database.connect()

const app:Express = express();


const port:string | number = process.env.PORT || 8080;

// CORS: cho phép Vercel domain (set CORS_ORIGIN trong .env, vd "https://itss-findjob.vercel.app")
// Khi không set → cho phép tất cả (dev mode)
const corsOrigin = process.env.CORS_ORIGIN;
app.use(
  cors({
    origin: corsOrigin
      ? corsOrigin.split(",").map((s) => s.trim())
      : true,
    credentials: true,
  })
);
app.use(express.json());
//kết nối với routes
mainRoutes(app);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });