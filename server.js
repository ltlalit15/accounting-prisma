import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import mainAppRouters from "./app.js"; // Your routes
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import fileUpload from "express-fileupload";




// Load environment variables
dotenv.config();

// Load Swagger JSON
const swaggerFile = JSON.parse(
  fs.readFileSync(new URL('./swagger-output.json', import.meta.url), 'utf8')
);

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 50 * 1024 * 1024 } // optional 50MB limit
  })
);

// Enable CORS for React frontend
// app.use(cors({
//   origin: 'http://localhost:5173', // React dev server
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true // if you need cookies/auth
// }));


app.use(cors({
  origin: [
    'http://localhost:5173',          // React local dev
    'https://zirak-book.netlify.app', // Deployed frontend
    'https://erp-accounting-new.netlify.app',
    'https://invoice360-software.netlify.app',
    'https://accounting-erp.netlify.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// Logger
app.use(morgan('dev'));

// Root route
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});

// Swagger API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Main API routes
app.use("/api/v1", mainAppRouters);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
