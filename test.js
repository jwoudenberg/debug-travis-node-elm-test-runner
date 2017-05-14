var binstall = require("binstall");
var path = require("path");
var fs = require("fs");
var packageInfo = require(path.join(__dirname, "package.json"));
var spawn = require("cross-spawn");

// Use major.minor.patch from version string - e.g. "1.2.3" from "1.2.3-alpha"
var binVersion = '0.18.3'


// 'arm', 'ia32', or 'x64'.
var arch = process.arch;

// 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
var operatingSystem = process.platform;

var filename = operatingSystem + "-" + arch + ".tar.gz";
var url = "https://dl.bintray.com/elmlang/elm-test/"
  + binVersion + "/" + filename;
console.log('DOWNLOADING', url);

var binariesDir = __dirname;
var binaryExtension = process.platform === "win32" ? ".exe" : "";
var executablePaths = [path.join(binariesDir, "elm-interface-to-json" + binaryExtension)];
var errorMessage = "Unfortunately, there are no elm-test " + binVersion + " binaries available on your operating system and architecture.\n\nIf you would like to build Elm from source, there are instructions at https://github.com/elm-lang/elm-platform#build-from-source\n";

binstall(url, {path: binariesDir},
  {verbose: true, verify: executablePaths, errorMessage: errorMessage}
).then(function(successMessage) {
    var readElmiPath = path.join(__dirname, "elm-interface-to-json") + binaryExtension;
    var elmPackageJsonPath = path.join(__dirname, 'tests');
    var child = spawn(readElmiPath, ["--path", elmPackageJsonPath]);
    var jsonStr = "";
    var stderrStr = "";

    child.stdout.on('data', function(data) {
      jsonStr += data;
    });

    child.stderr.on('data', function(data) {
      stderrStr += data;
    });

    child.on('close', function(code) {
      if (stderrStr !== "") {
        console.log(stderrStr);
        process.exit(1);
      } else if (code !== 0) {
        console.log("Finding test interfaces failed, exiting with code " + code);
        process.exit(1);
      }
      console.log('SUCCESS!');
      console.log(jsonStr);
    });
  }, function(errorMessage) {
    console.error(errorMessage);
    process.exit(1);
  });
