import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import session from "express-session";
import fs from "fs";
import { createServer } from "http";
import passport from "passport";
import path from "path";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import YAML from "yaml";
import { DB_NAME } from "./constants.js";
import { dbInstance } from "./db/index.js";
import { initializeSocketIO } from "./socket/index.js";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const file = fs.readFileSync(path.resolve(__dirname, "./swagger.yaml"), "utf8");
const swaggerDocument = YAML.parse(file);

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    // origin: 'http://localhost:5173',
    origin: 'https://devewalletreact.netlify.app',
    // origin: 'http://localhost:3000',
    // origin: 'http:// 192.168.21.14:5173',
    // origin: 'http://192.168.21.11:5173',
    credentials: true,
  },
});

app.set("io", io); // using set method to mount the `io` instance on the app to avoid usage of `global`

// global middlewares
app.use(
  cors({
    // origin: 'https://devewalletreact.netlify.app',
    origin: 'http://localhost:4200',
    // origin: 'http://192.168.21.16:3000',
    // origin: 'http://192.168.21.11:5173',
    credentials: true,
  })
);

// Rate limiter to avoid misuse of the service and avoid cost spikes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public")); // configure static file to save images locally
app.use(cookieParser());

// required for passport
app.use(
  session({
    secret: '7fdOMCFRSLD9cv1k-5n3Dz5n3DmVmVHVIg9GG_OGTUkBfLNdgZAwKDNtoCJ0X0cyqaM0ogR80-zh9kx0Mkx',
    resave: true,
    saveUninitialized: true,
  })
); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// routing _______________
import { errorHandler } from "./middlewares/error.middlewares.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import admin from "./routes/admin.routes.js";
import addTask from './routes/addTask.router.js'
import assignProject from './routes/assignProject.router.js'

 

initializeSocketIO(io);
// * api calling
// app.use('/.netlify/functions/api', router);

app.get('/.netlify/functions/',async(req,res)=>{
   
  let apiUrl = req.hostname;
  const data = {
    status:200,
    message:'Running',
     contact:8505948801,
     apiURL:apiUrl
  }
  return res
  .status(200)
  .json(new ApiResponse(200, data, "Api is running now"));
})
app.get('/api/myaccount',async (req,res)=>{
  const data = {
    status:200,
    message:'Running',
     contact:8505948801
  }
  return res
  .status(200)
  .json(new ApiResponse(200, data, "Api is running now"));
})

// Define route for /api/home
app.get('/api/home', (req, res) => {
  // Send the index page as the response
  res.sendFile(__dirname + '/index.html');
});

app.use("/api/health", healthcheckRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", admin);
app.use("/api/addTask", addTask);
app.use("/api/assignProject", assignProject);
// common error handling middleware

// ! 🚫 Danger Zone
app.delete("/api/v1/reset-db", async (req, res) => {
  if (dbInstance) {
    // Drop the whole DB
    await dbInstance.connection.db.dropDatabase({
      dbName: DB_NAME,
    });

    const directory = "./public/images";

    // Remove all product images from the file system
    fs.readdir(directory, (err, files) => {
      if (err) {
        // fail silently
        console.log("Error while removing the images: ", err);
      } else {
        for (const file of files) {
          if (file === ".gitkeep") continue;
          fs.unlink(path.join(directory, file), (err) => {
            if (err) throw err;
          });
        }
      }
    });
    // remove the seeded users if exist
    fs.unlink("./public/temp/seed-credentials.json", (err) => {
      // fail silently
      if (err) console.log("Seed credentials are missing.");
    });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Database dropped successfully"));
  }
  throw new ApiError(500, "Something went wrong while dropping the database");
});

// * API DOCS
// ? Keeping swagger code at the end so that we can load swagger on "/" route
app.use(
  "/swagger",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    swaggerOptions: {
      docExpansion: "none", // keep all the sections collapsed by default
    },
    customSiteTitle: "FreeAPI docs",
  })
);


app.use(errorHandler);

export { httpServer };
