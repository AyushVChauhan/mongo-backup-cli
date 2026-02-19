![Node](https://img.shields.io/badge/node-18+-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
## mongo-backup-cli

> A TypeScript-based CLI tool for backing up and restoring MongoDB databases using `mongodump` and `mongorestore`.

---

### ✨ Features

* Archive-based backups (`--archive`)
* Gzip compression
* Database rename during restore
* Structured logging (Winston)
* TypeScript support
* Safe `spawn()` execution
* Clean CLI workflow

---

### 📦 Installation

```bash
git clone https://github.com/yourname/mongo-backup-cli.git
cd mongo-backup-cli
npm install
```

---

### 🚀 Usage

```bash
npm start
```


---

### 🧠 Requirements

* Node.js 18+
* MongoDB Database Tools installed
* `mongodump` and `mongorestore` available in PATH
* Mongo connection strings inside `.env` file in form of `MONGO_<NAME>=<CONNECTION_STRING>`

---

### 🔄 Backup

Creates a compressed archive file:

```
backups/mydb-2026-02-19.archive.gz
```

---

### 🔁 Restore

Supports restoring to same or different database using namespace mapping.

