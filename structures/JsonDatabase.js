const fs = require("fs");

module.exports = class JsonDatabase {
    constructor(filePath, bckupdirPath) {
        this.ready = false;

        this.file = filePath;
        this.fileName = this.file.split("/").pop();
        this.name = this.fileName.split(".").slice(0, -1).join(".");

        this.backupsDir = bckupdirPath;

        this.data = JSON.parse(fs.readFileSync(this.file));
    }

    editElement(query, key, value) {
        const parent = this.runQuery(query);
        parent[key] = value;

        this.pushEdits();

        return this;
    }

    createBackup() {
        this.pushEdits();

        const date = new Date();
        const filename = this.backupsDir + "/" + date.getTime() + "-" + this.fileName;

        const backupFile = fs.createWriteStream(filename);
        backupFile.write(JSON.stringify(this.data, null, 2));
        backupFile.end();

        return;
    }

    loadLastBackup() {
        const backups = fs.readdirSync(this.backupsDir);
        const dbName = this.fileName;

        const lastBackup = backups.reverse().find(backup => backup.split("-").slice(1).join("-") == dbName);
        const lastBackupPath = this.backupsDir + "/" + lastBackup;

        this.loadBackup(lastBackupPath);

        return;
    }

    loadBackup(filePath) {
        const newData = JSON.parse(fs.readFileSync(filePath));

        this.data = newData;

        this.pushEdits();
    }

    runQuery(query) {
        var parentElement = this.data

        query.forEach(queryHop => {
            if(!parentElement[queryHop]) parentElement[queryHop] = {};
            parentElement = parentElement[queryHop];
        });

        return parentElement;
    }

    pushEdits() {
        fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
    }
}