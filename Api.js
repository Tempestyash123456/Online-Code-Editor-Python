const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const compiler = require("compilex");
const options = { stats: true };

compiler.init(options);

app.use(bodyParser.json());
app.use(
  "/codemirror-5.65.18",
  express.static(
    "/home/tempest/Documents/Online-Code-Editor/codemirror-5.65.18"
  )
);

app.get("/", (req, res) => {
  compiler.flush(() => {
    console.log("All temporary files flushed!");
  });
  res.sendFile("/home/tempest/Documents/Online-Code-Editor/index.html");
});

app.post("/compile", (req, res) => {
  const { code, input, lang } = req.body;
  let responseSent = false; // Flag to ensure we only send one response

  if (!code || !lang) {
    return res.status(400).send({ output: "Error", error: "Code and language are required." });
  }

  const envData = { OS: "linux", options: { timeout: 10000 } };

  const sendResponse = (data) => {
    if (!responseSent) {
      responseSent = true; // Mark response as sent
      if (data.output) {
        res.send(data);
      } else {
        res.send({ output: "Error", error: data.error || "An unknown error occurred." });
      }
    }
  };

  try {
    switch (lang) {
      // case "Java":
      //   if (!input) {
      //     compiler.compileJava(envData, code, sendResponse);
      //   } else {
      //     compiler.compileJavaWithInput(envData, code, input, sendResponse);
      //   }
      //   break;
      // case "C++":
      //   envData.cmd = "g++";
      //   if (!input) {
      //     compiler.compileCPP(envData, code, sendResponse);
      //   } else {
      //     compiler.compileCPPWithInput(envData, code, input, sendResponse);
      //   }
      //   break;
      case "Python":
        if (!input) {
          compiler.compilePython(envData, code, sendResponse);
        } else {
          compiler.compilePythonWithInput(envData, code, input, sendResponse);
        }
        break;
      default:
        if (!responseSent) { // Ensure response is only sent once
          responseSent = true;
          res.status(400).send({ output: "Error", error: "Unsupported language." });
        }
    }
  } catch (error) {
    console.error("Compilation Error:", error);
    if (!responseSent) {
      res.status(500).send({ output: "Error", error: "Server error occurred." });
    }
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
