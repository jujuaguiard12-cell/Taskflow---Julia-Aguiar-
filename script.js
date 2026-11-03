
// ========================================
// TASKFLOW - GERENCIADOR DE TAREFAS
// ========================================

const STORAGE_KEY = "taskflow-tasks";

// ========================================
// TAREFAS DE EXEMPLO
// ========================================

const exampleTasks = [
    {
        id: 1,
        title: "Estudar JavaScript",
        description: "Revisar funções, arrays e objetos.",
        priority: "alta",
        deadline: "2026-11-10",
        status: "pendente"
    },
    {
        id: 2,
        title: "Organizar projetos",
        description: "Separar os arquivos das atividades.",
        priority: "media",
        deadline: "2026-11-12",
        status: "pendente"
    },
    {
        id: 3,
        title: "Ler documentação",
        description: "Estudar os conceitos de HTML.",
        priority: "baixa",
        deadline: "2026-11-15",
        status: "pendente"
    },
    {
        id: 4,
        title: "Desenvolver TaskFlow",
        description: "Criar a interface do gerenciador.",
        priority: "alta",
        deadline: "2026-11-08",
        status: "andamento"
    },
    {
        id: 5,
        title: "Estudar CSS",
        description: "Praticar layouts e responsividade.",
        priority: "media",
        deadline: "2026-11-11",
        status: "andamento"
    },
    {
        id: 6,
        title: "Praticar HTML",
        description: "Conhecer melhor as tags semânticas.",
        priority: "baixa",
        deadline: "2026-11-13",
        status: "andamento"
    },
    {
        id: 7,
        title: "Organizar ambiente",
        description: "Instalar e configurar o VS Code.",
        priority: "baixa",
        deadline: "2026-11-03",
        status: "concluida"
    },
    {
        id: 8,
        title: "Criar estrutura HTML",
        description: "Preparar os arquivos do projeto.",
        priority: "media",
        deadline: "2026-11-03",
        status: "concluida"
    }
];

// ========================================
// CARREGAR TAREFAS
// ========================================

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (savedTasks !== null) {
            const parsedTasks = JSON.parse(savedTasks);

            if (Array.isArray(parsedTasks)) {
                return parsedTasks;
            }
        }
    } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(exampleTasks)
    );

    return [...exampleTasks];
}

let tasks = loadTasks();
let editingId = null;

// ========================================
// ELEMENTOS HTML
// ========================================

const taskForm = document.getElementById("task-form");

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const priorityInput = document.getElementById("priority");
const deadlineInput = document.getElementById("deadline");

const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-edit");
const formHeading = document.getElementById("form-heading");

const pendingList = document.getElementById("pending-list");
const progressList = document.getElementById("progress-list");
const completedList = document.getElementById("completed-list");

const kanbanBoard = document.querySelector(".kanban-board");

// Elementos de pesquisa
const searchInput = document.getElementById("search");
const filterPriority = document.getElementById("filter-priority");
const filterStatus = document.getElementById("filter-status");
const clearFiltersButton = document.getElementById("clear-filters");
const filterResult = document.getElementById("filter-result");

// ========================================
// SALVAR TAREFAS
// ========================================

function saveTasks() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );
    } catch (error) {
        console.error("Erro ao salvar tarefas:", error);
        alert("Não foi possível salvar as tarefas.");
    }
}

// ========================================
// FORMATAR DATA
// ========================================

function formatDate(date) {
    if (!date) {
        return "Sem prazo definido";
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
        return "Data inválida";
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ========================================
// CRIAR CARTÃO
// ========================================

function createTaskCard(task) {
    const card = document.createElement("div");

    card.className = "task-card";
    card.dataset.id = task.id;

    if (task.status === "concluida") {
        card.classList.add("completed");
    }

    const priorityNames = {
        baixa: "Baixa",
        media: "Média",
        alta: "Alta"
    };

    const priorityClasses = {
        baixa: "low",
        media: "medium",
        alta: "high"
    };

    // Prioridade
    const priority = document.createElement("span");

    priority.className =
        `priority ${priorityClasses[task.priority] || "medium"}`;

    priority.textContent =
        priorityNames[task.priority] || "Média";

    // Título
    const title = document.createElement("h4");
    title.textContent = task.title;

    // Descrição
    const description = document.createElement("p");

    description.textContent =
        task.description || "Sem descrição.";

    // Prazo
    const footer = document.createElement("div");
    footer.className = "task-footer";

    const date = document.createElement("small");
    date.textContent = `📅 ${formatDate(task.deadline)}`;

    footer.appendChild(date);

    // Botões
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");

    editButton.className = "edit-button";
    editButton.dataset.action = "edit";
    editButton.textContent = "Editar";

    const deleteButton = document.createElement("button");

    deleteButton.className = "delete-button";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "Excluir";

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    // Alteração de status
    const statusSelect = document.createElement("select");

    statusSelect.className = "status-select";
    statusSelect.dataset.action = "status";
    statusSelect.setAttribute(
        "aria-label",
        "Alterar status da tarefa"
    );

    const statuses = [
        { value: "pendente", label: "A Fazer" },
        { value: "andamento", label: "Em Andamento" },
        { value: "concluida", label: "Concluída" }
    ];

    statuses.forEach(status => {
        const option = document.createElement("option");

        option.value = status.value;
        option.textContent = status.label;

        statusSelect.appendChild(option);
    });

    statusSelect.value = task.status;

    // Montar cartão
    card.appendChild(priority);
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(footer);
    card.appendChild(actions);
    card.appendChild(statusSelect);

    return card;
}

// ========================================
// ATUALIZAR DASHBOARD
// ========================================

function updateDashboard() {
    const total = tasks.length;

    const pending = tasks.filter(
        task => task.status === "pendente"
    ).length;

    const progress = tasks.filter(
        task => task.status === "andamento"
    ).length;

    const completed = tasks.filter(
        task => task.status === "concluida"
    ).length;

    document.getElementById("total-tasks").textContent = total;
    document.getElementById("pending-tasks").textContent = pending;
    document.getElementById("progress-tasks").textContent = progress;
    document.getElementById("completed-tasks").textContent = completed;

    document.getElementById("count-pending").textContent = pending;
    document.getElementById("count-progress").textContent = progress;
    document.getElementById("count-completed").textContent = completed;
}

// ========================================
// FILTRAR TAREFAS
// ========================================

function getFilteredTasks() {
    const searchText = searchInput.value
        .trim()
        .toLowerCase();

    const selectedPriority = filterPriority.value;
    const selectedStatus = filterStatus.value;

    return tasks.filter(task => {

        const matchesTitle = task.title
            .toLowerCase()
            .includes(searchText);

        const matchesPriority =
            selectedPriority === "" ||
            task.priority === selectedPriority;

        const matchesStatus =
            selectedStatus === "" ||
            task.status === selectedStatus;

        return matchesTitle && matchesPriority && matchesStatus;
    });
}

// ========================================
// MENSAGEM DE COLUNA VAZIA
// ========================================

function showEmptyMessage(column, message) {
    if (column.children.length === 0) {
        const empty = document.createElement("p");

        empty.className = "empty-message";
        empty.textContent = message;

        column.appendChild(empty);
    }
}

// ========================================
// RENDERIZAR TAREFAS
// ========================================

function renderTasks() {
    pendingList.innerHTML = "";
    progressList.innerHTML = "";
    completedList.innerHTML = "";

    // Os indicadores usam todas as tarefas,
    // mesmo quando existem filtros ativos.
    updateDashboard();

    const filteredTasks = getFilteredTasks();

    filteredTasks.forEach(task => {
        const card = createTaskCard(task);

        if (task.status === "pendente") {
            pendingList.appendChild(card);

        } else if (task.status === "andamento") {
            progressList.appendChild(card);

        } else if (task.status === "concluida") {
            completedList.appendChild(card);
        }
    });

    showEmptyMessage(
        pendingList,
        "Nenhuma tarefa encontrada."
    );

    showEmptyMessage(
        progressList,
        "Nenhuma tarefa encontrada."
    );

    showEmptyMessage(
        completedList,
        "Nenhuma tarefa encontrada."
    );

    filterResult.textContent =
        `Exibindo ${filteredTasks.length} de ${tasks.length} tarefa(s).`;
}

// ========================================
// EVENTOS DOS FILTROS
// ========================================

searchInput.addEventListener("input", renderTasks);

filterPriority.addEventListener("change", renderTasks);

filterStatus.addEventListener("change", renderTasks);

// ========================================
// LIMPAR FILTROS
// ========================================

clearFiltersButton.addEventListener("click", function() {
    searchInput.value = "";
    filterPriority.value = "";
    filterStatus.value = "";

    renderTasks();
});

// ========================================
// LIMPAR FORMULÁRIO
// ========================================

function resetForm() {
    taskForm.reset();

    editingId = null;

    formHeading.textContent = "Nova tarefa";

    submitButton.textContent = "+ Adicionar tarefa";

    cancelButton.hidden = true;
}

// ========================================
// CADASTRAR E EDITAR
// ========================================

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const priority = priorityInput.value;
    const deadline = deadlineInput.value;

    if (!title) {
        alert("Digite o título da tarefa!");
        titleInput.focus();
        return;
    }

    if (editingId !== null) {
        const task = tasks.find(
            item => item.id === editingId
        );

        if (!task) return;

        task.title = title;
        task.description = description;
        task.priority = priority;
        task.deadline = deadline;

        alert("Tarefa editada com sucesso!");

    } else {
        const newTask = {
            id: Date.now(),
            title,
            description,
            priority,
            deadline,
            status: "pendente"
        };

        tasks.push(newTask);

        alert("Tarefa cadastrada com sucesso!");
    }

    saveTasks();
    resetForm();
    renderTasks();
});

// ========================================
// EDITAR TAREFA
// ========================================

function editTask(id) {
    const task = tasks.find(
        item => item.id === id
    );

    if (!task) return;

    editingId = id;

    titleInput.value = task.title;
    descriptionInput.value = task.description;
    priorityInput.value = task.priority;
    deadlineInput.value = task.deadline || "";

    formHeading.textContent = "Editar tarefa";

    submitButton.textContent = "Salvar alterações";

    cancelButton.hidden = false;

    document.getElementById("tarefas").scrollIntoView({
        behavior: "smooth"
    });

    titleInput.focus();
}

// ========================================
// CANCELAR EDIÇÃO
// ========================================

cancelButton.addEventListener("click", resetForm);

// ========================================
// EXCLUIR TAREFA
// ========================================

function deleteTask(id) {
    const confirmed = confirm(
        "Tem certeza que deseja excluir esta tarefa?"
    );

    if (!confirmed) return;

    tasks = tasks.filter(
        task => task.id !== id
    );

    if (editingId === id) {
        resetForm();
    }

    saveTasks();
    renderTasks();
}

// ========================================
// EVENTOS DOS CARTÕES
// ========================================

kanbanBoard.addEventListener("click", function(event) {
    const button = event.target.closest(
        "button[data-action]"
    );

    if (!button) return;

    const card = button.closest(".task-card");

    if (!card) return;

    const id = Number(card.dataset.id);

    const action = button.dataset.action;

    if (action === "edit") {
        editTask(id);
    }

    if (action === "delete") {
        deleteTask(id);
    }
});

// ========================================
// ALTERAR STATUS
// ========================================

kanbanBoard.addEventListener("change", function(event) {
    if (event.target.dataset.action !== "status") {
        return;
    }

    const card = event.target.closest(".task-card");

    if (!card) return;

    const id = Number(card.dataset.id);

    const task = tasks.find(
        item => item.id === id
    );

    if (!task) return;

    task.status = event.target.value;

    saveTasks();
    renderTasks();
});

// ========================================
// INICIALIZAR A APLICAÇÃO
// ========================================

renderTasks();

console.log("TaskFlow iniciado com sucesso!");
