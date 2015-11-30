module.exports = function(grunt) {

    var fsModule = require("fs");

    function isDiff(content, srcPath) {
        var relativePath = srcPath.replace(/actuals\//, "");
        var extractedRelativePath = "extracted/package/" + relativePath;
        grunt.log.fail(extractedRelativePath);
        try {
            if (fsModule.statSync(extractedRelativePath)) {
                return false;
            }
        } catch (ex) {
            if (content.match(/\s*\/\/@private.*/)) {
                return false;
            }
            return content;
        }
        
        return false;
    }

    grunt.initConfig({
//        pkg: grunt.file.readJSON('package.json'),
        copy: {
            package: {
                src: "../../bin/dist/tns-core-modules*.tgz",
                dest: "./tns-core-modules.tgz"
            },
            actualDeclaraions: {
                expand: true,
                src: [
                    "**/*.d.ts",
                    "!bin/**/*.*",
                    "!.git/**/*.*",
                    "!node_modules/**/*.*",
                    "!apps/**/*.*",
                    "!node-tests/**/*.*",
                    "!**/*.android.d.ts",
                    "!**/*.ios.d.ts",
                    "!build/**/*.*"
                ],
                dest: "./actuals",
                cwd: "../../"
            },
            differentNoPrivateFiles: {
                expand: true,
                src: "./**/*.*",
                dest: "./diffs/",
                cwd: "./actuals",
                options: {
                    process: isDiff
                }
            }
        },
        shell: {
            unpackPackage: {
                command: "tar -zxvf tns-core-modules.tgz -C ./extracted"
            },
            createExtractedDir: {
                command: "mkdir ./extracted"
            },
            createActualsDir: {
                command: "mkdir ./actuals"
            },
            createDiffsDir: {
                command: "mkdir ./diffs"
            }
        },
        clean: {
            package: {
                src: "./tns-core-modules.tgz"
            },
            extractedDir: {
                src: "./extracted"
            },
            actualsDir: {
                src: "./actuals"
            },
            diffsDir: {
                src: ["./diffs/**/*.*", "./diffs"]
            },
            extractedNonDeclarations: {
                src: ["./extracted/**/*.*", "!./extracted/**/*.d.ts"]
            }
        }
    });

    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-clean");

    grunt.registerTask("default", [
        "clean:extractedDir",
        "clean:actualsDir",
        "clean:diffsDir",
        "clean:package",
        "copy:package",
        "shell:createExtractedDir",
        "shell:unpackPackage",
        "clean:package",
        "clean:extractedNonDeclarations",
        "shell:createActualsDir",
        "copy:actualDeclaraions",
        "shell:createDiffsDir",
        "copy:differentNoPrivateFiles",
        "clean:extractedDir",
        "clean:actualsDir"
    ]);
}