import "./config/env.js";
import app from "./app.js";
import http from "http";

const PORT = Number(process.env.PORT);

const server = http.createServer(app);

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server is listening on PORT: " + PORT);
});
