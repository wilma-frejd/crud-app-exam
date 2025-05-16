import express from "express";
import path from "node:path";
import fs from "node:fs";
import { v4 as uuidv4 } from "uuid";
import bodyParser from "body-parser";

const app = express();



const fileName = path.resolve("data", "name.json");

app.use("/static", express.static("public"));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(path.resolve("views", "index.html"));
});

function writeToJsonFile(data) {
    fs.writeFileSync(fileName, JSON.stringify(data));
}

function readJsonFile() {
    try {
        const file = fs.readFileSync(fileName, {
            encoding: "utf-8",
            flag: "r",
        });
        return JSON.parse(file);
    } catch (error) {
        console.error("Error reading JSON file:", error);
        return [];
    }
}

app.post("/hello/:owner", (req, res) => {
    try {
        const data = readJsonFile();
        
        data.push({ 
            id: uuidv4(),
            checked: false, 
            owner: req.params.owner, 
            task: req.body.task 
        });

        writeToJsonFile(data);
        res.json({ message: `Hello, ${req.params.owner}` });
    } catch (error) {
        console.error("Error in POST /hello/:owner:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/names", (req, res) => {
    try {
        res.json(readJsonFile());
    } catch (error) {
        console.error("Error in GET /names:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.put("/hello/checked/:id", (req, res) => {
    try {
        const data = readJsonFile().map((item) => {
            if (item.id === req.params.id) {
                item.checked = !item.checked;
            }
            return item;
        });

        writeToJsonFile(data);
        const updatedItem = data.find(item => item.id === req.params.id);
        
        if (updatedItem) {
            res.json([updatedItem]);
        } else {
            res.status(404).json({ error: "Item not found" });
        }
    } catch (error) {
        console.error("Error in PUT /hello/checked/:id:", error);
        res.status(500).json({ error: "Unable to update. Try again later..." });
    }
});

app.delete("/delete/:id", (req, res) => {
    try {
        const data = readJsonFile();
        const newData = data.filter((item) => item.id !== req.params.id);
        writeToJsonFile(newData);
        res.json(newData);
    } catch (error) {
        console.error("Error in DELETE /delete/:id:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(3000, () => {
    console.log("server started");
});
