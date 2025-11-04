import "./config/env.js";
import app from "./app.js";
import http from "http";

const PORT = process.env.PORT;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log("Server is listening on PORT: " + PORT);
});
