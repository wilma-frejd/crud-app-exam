console.log("main.js is loaded")

let owner = "";
let task = "";
let todoList = [];

const ownerInput = document.getElementById("owner");
const todoInput = document.getElementById("task");
const button = document.getElementById("add");
const list = document.getElementById("todoList");
const loadingMessage = document.getElementById("loading");

const createTodo = async () => {
    if (!owner || !task) {
        alert("Enter both name and task");
        return;
    }
    
    const res = await fetch(`/hello/${owner}/`, {
        method: "POST",
        body: JSON.stringify({
            owner,
            task,
        }),
        headers: {
            "Content-Type": "application/json",
        }
    });
    
    const body = await res.json();
    const greeting = body.message; 
    document.getElementById("heading").innerHTML = greeting;
    await renderTodos();
    owner = "";
    task = "";
    ownerInput.value = "";
    todoInput.value = "";
};

const getTodos = async () => {
    const res = await fetch("/names");
    const todos = await res.json();
    todoList = todos;
};

const deleteTodos = async (event) => {
    await fetch(`/delete/${event.target.id}`, {
        method: "DELETE", 
    });
    await renderTodos();
};

const updateChecked = async (event) => {
    const res = await fetch(`/hello/checked/${event.target.id}`, {
        method: "PUT",
    });
    
    const body = await res.json();
    if (!res.ok) {
        throw new Error(body.error);
    }
    await renderTodos();
};

const createTodoListItem = (nameItem) => {
    // Create list item container
    const listItem = document.createElement("li");
    listItem.className = "name-item";
    
    // Create checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = nameItem.id;
    checkbox.checked = nameItem.checked;
    checkbox.addEventListener("click", updateChecked);
    
    // Create name text
    const nameText = document.createElement("span");
    nameText.textContent = `${nameItem.owner} ${nameItem.task}`;
    
    if (nameItem.checked) {
        nameText.style.textDecoration = "line-through";
    }
    
    // Create delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.id = nameItem.id;
    deleteBtn.innerHTML = "X";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", deleteTodos);
    
    // Append elements to list item
    listItem.appendChild(checkbox);
    listItem.appendChild(nameText);
    listItem.appendChild(deleteBtn);
    
    return listItem;
};

const renderTodos = async () => {
    await getTodos();
    list.innerHTML = "";
    
    if (!todoList.length) {
        const el = document.createElement("li");
        el.innerHTML = "No available data!";
        list.appendChild(el);
    } else {
        for (const nameItem of todoList) {
            const listElement = createTodoListItem(nameItem);
            list.appendChild(listElement);
        }
    }
};

const setNewOwner = (event) => {
    owner = event.target.value;
};

const setNewTask = (event) => {
    task = event.target.value;
};

button.addEventListener("click", createTodo);

ownerInput.addEventListener("input", setNewOwner);
todoInput.addEventListener("input", setNewTask);

ownerInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        todoInput.focus();
    }
});

todoInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        createTodo();
    }
});

document.addEventListener("DOMContentLoaded", renderTodos);
