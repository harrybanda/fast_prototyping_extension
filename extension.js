const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function generateCode(data) {
  const folderPath = vscode.workspace.workspaceFolders[0].uri
    .toString()
    .split(":")[1];

  let object = JSON.parse(data);
  const htmlContent = object.generated_webpage_html;
  const cssContent = object.generated_webpage_css;

  var finalPath = folderPath.replace("/c%3A", ""); // temprary fix
  fs.writeFile(path.join(finalPath, "index.html"), htmlContent, (err) => {
    if (err) return vscode.window.showErrorMessage("Failed to create files");
    fs.writeFile(path.join(finalPath, "index.css"), cssContent, (err) => {
      if (err) return vscode.window.showErrorMessage("Failed to create files");
      vscode.window.showInformationMessage("Files Created");
    });
  });
}

function createWebview(context) {
  const panel = vscode.window.createWebviewPanel(
    "fastPrototyping",
    "Import Code",
    vscode.ViewColumn.One,
    { enableScripts: true }
  );
  panel.webview.html = view();
  panel.webview.onDidReceiveMessage(
    (message) => {
      switch (message.command) {
        case "import":
          generateCode(message.data);
          return;
        case "open":
          vscode.env.openExternal(
            vscode.Uri.parse("file:///C:/Users/Harry/Desktop/Test/index.html") // Temporary path
          );
          return;
      }
    },
    undefined,
    context.subscriptions
  );
}

function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "extension.fastPrototyping",
    function () {
      try {
        createWebview(context);
      } catch (error) {
        console.error(error);
      }
    }
  );
  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

function view() {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Import Code</title>
      <style>
        .container {
          padding-top: 20px;
          width: 300px;
          font-family: Tahoma, Geneva, sans-serif;
        }
        #codeInput {
          width: 100%;
          padding: 15px;
          border: 1px solid #dddddd;
          margin-bottom: 15px;
          box-sizing: border-box;
        }
        #btnImport {
          width: 100%;
          padding: 15px;
          background-color: #23bb2a;
          border: 0;
          box-sizing: border-box;
          cursor: pointer;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 15px;
        }
        #btnOpen {
          width: 100%;
          padding: 15px;
          background-color: #209cee;
          border: 0;
          box-sizing: border-box;
          cursor: pointer;
          font-weight: bold;
          color: #ffffff;
          margin-bottom: 15px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <input
          id="codeInput"
          type="text"
          name="code"
          placeholder="Enter 6 digit code from app"
          required
        />
        <span id="loading"></span>
        <button id="btnImport" type="button" onclick="importCode()">
          Import Code
        </button>
        <span id="loaded"></span>
      </div>
      <script>
        const vscode = acquireVsCodeApi();

        var HttpClient = function () {
          this.get = function (aUrl, aCallback) {
            var anHttpRequest = new XMLHttpRequest();
            anHttpRequest.onreadystatechange = function () {
              if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
            };
            anHttpRequest.open("GET", aUrl, true);
            anHttpRequest.send(null);
          };
        };

        var client = new HttpClient();

        function importCode() {
          var code = document.getElementById("codeInput").value;
          document.getElementById("loading").innerHTML = "<p>Loading...</p>";
          client.get(
            "https://t5pckgftce.execute-api.us-east-1.amazonaws.com/dev/prototype/" +
              code,
            function (response) {
              document.getElementById("loading").innerHTML = "";
              document.getElementById("loaded").innerHTML =
                "<button id='btnOpen' type='button' onclick='openPage()'>Open Page</button>";
              vscode.postMessage({
                command: "import",
                data: response,
              });
            }
          );
        }
        function openPage() {
          vscode.postMessage({
            command: "open",
          });
        }
      </script>
    </body>
  </html>
`;
}
