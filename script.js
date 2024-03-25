
//PREPARACIÓN DE LOS LISTENERS, VARIABLES Y CONSTANTES
document.addEventListener('DOMContentLoaded', function () {
    
    //CONSTANTES Y VARIABLES
    
    /*Relacionado con la lista de tareas*/
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const actionsDropdown = document.getElementById('actions');
    const refreshBtn = document.getElementById('refreshBtn');
    let currentFilter = 'sortByRelevance';
       
    
    /*Relacionado con los contenidos de descripción y editar descripción*/
    const descriptionModal = document.getElementById('descriptionModal');
    const taskDescription = document.getElementById('taskDescription');
    const addDescriptionModal = document.getElementById('addDescriptionModal');
    const descriptionInput = document.getElementById('descriptionInput');
    const saveDescriptionBtn = document.getElementById('saveDescriptionBtn');
   



    // Carga las tareas almacenadas en el "local storage"
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    /*Llama la función para renderizar las tareas*/
    sortByRelevance();



    actionsDropdown.addEventListener('change', function () {
        currentFilter = this.value; // CAMBIA EL VALOR DE "CURRENT FILTER"
        switch (currentFilter) {

            case 'sortByRelevance':
                sortByRelevance();
                break;
            case 'showCompletedTasks':
                showCompletedTasks();
                break;
            case 'showIncompleteTasks':
                showIncompleteTasks();
                break;
            default:
                sortByRelevance();
                break;
        }
    });


    /* Función/Listener para añadir tareas con el botón "addTaskBtn" */
    addTaskBtn.addEventListener('click', function () {
        const taskTitle = taskInput.value.trim();
        if (taskTitle === '') {
            alert('Please, enter a task title.'); 
            return; 
        }
    
        const newTask = {
            id: Date.now(),
            title: taskTitle,
            description: '',
            completed: false,
            createdAt: new Date().toISOString(),
            relevance: 'casual',
            completedAt: null 
        };

        tasks.push(newTask);
        saveTasks();
        // renderTasks();
        taskInput.value = '';
    });
    

    //THIS FUNCTION RENDERS THE TASKS IN THE PAGE
    function renderTasks(filteredTasks) {
        taskList.innerHTML = '';
        const tasksToRender = filteredTasks || tasks;
    
        console.log(currentFilter);
        // Log the current filter being applied
        const currentFilterMessage = filteredTasks ? `Rendering tasks based on filter: ${filteredTasks}` : 'Rendering all tasks';
        console.log(currentFilterMessage);
    
        tasksToRender.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item');
    
            // Check if task is completed and add completed class accordingly
            if (task.completed) {
                taskItem.classList.add('completed');
            }
    
            // Add event listener to toggle completion status when task item is clicked
            taskItem.addEventListener('click', () => toggleTaskCompletion(task.id, filteredTasks));
    
            const taskTitle = document.createElement('span');
            taskTitle.textContent = task.title;
            taskItem.appendChild(taskTitle);
    
            // Create a container for both the relevance circle and task buttons
            const taskContainer = document.createElement('div');
            taskContainer.classList.add('task-container');
    
            // Create the relevance circle
            const relevanceCircle = document.createElement('span');
            relevanceCircle.classList.add('relevance-circle');
            relevanceCircle.style.backgroundColor = getRelevanceColor(task.relevance);
            taskContainer.appendChild(relevanceCircle); // Add relevance circle to task container
    
            // Create a container for the task buttons
            const taskButtons = document.createElement('span');
            taskButtons.classList.add('task-buttons');
            // Create the "See More" button
            const seeMoreBtn = document.createElement('button');
            seeMoreBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m298-262-56-56 121-122H80v-80h283L242-642l56-56 218 218-218 218Zm222-18v-80h360v80H520Zm0-320v-80h360v80H520Zm120 160v-80h240v80H640Z"/></svg>';
            seeMoreBtn.classList.add('see-more');
            seeMoreBtn.addEventListener('click', (event) => {
                openDescriptionModal(task, event);
            });
            taskButtons.appendChild(seeMoreBtn);

            // Create the "Add Description" button
            const addDescriptionBtn = document.createElement('button');
            addDescriptionBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>';
            addDescriptionBtn.classList.add('add-description');
            addDescriptionBtn.addEventListener('click', (event) => {
                openAddDescriptionModal(task, event);
            });
            taskButtons.appendChild(addDescriptionBtn);

    
            taskContainer.appendChild(taskButtons); // Add task buttons to task container
            taskItem.appendChild(taskContainer); // Add task container to task item
            taskList.appendChild(taskItem);
        });
    }
    

// Toggle completion status of a task
function toggleTaskCompletion(taskId, filteredTasks) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        tasks[taskIndex].completedAt = tasks[taskIndex].completed ? new Date().toISOString() : null;
        saveTasks();
        if (filteredTasks) {
            renderTasks(filteredTasks); // Render filtered tasks if provided
        } else {
            renderTasks(); // Render all tasks if no filtered tasks provided
        }
    }
}


    // Save tasks to local storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
// Open description modal for a task
function openDescriptionModal(task, event) {
    event.stopPropagation(); // Stop event propagation
    taskDescription.textContent = task.description || 'No description available';
    const relevanceSelect = document.getElementById('relevance');
    relevanceSelect.value = task.relevance;
    descriptionModal.style.display = 'block';
    descriptionModal.setAttribute('data-task-id', task.id);
}

// Open add description modal
function openAddDescriptionModal(task, event) {
    event.stopPropagation(); // Stop event propagation
    descriptionInput.value = task.description || '';
    addDescriptionModal.style.display = 'block';
    addDescriptionModal.setAttribute('data-task-id', task.id);
}

// Save description
saveDescriptionBtn.addEventListener('click', function () {
    const taskId = parseInt(addDescriptionModal.getAttribute('data-task-id'));
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].description = descriptionInput.value.trim();
        saveTasks();
        // renderTasks(); // Pass the filtered tasks here
        addDescriptionModal.style.display = 'none'; // Close the modal after saving
    }
});



// Event listener for relevance dropdown change
document.getElementById('relevance').addEventListener('change', function() {
    const taskId = parseInt(addDescriptionModal.getAttribute('data-task-id')); // Change descriptionModal to addDescriptionModal
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].relevance = this.value; // Use "this.value" to get the selected value
        saveTasks();
    }
});

    // OBTIENE EL COLOR QUE INDICA RELEVANCIA
    function getRelevanceColor(relevance) {
        switch (relevance) {
            case 'casual':
                return '#FFFFFF'; // White
            case 'mild':
                return '#FFFF00'; // Yellow
            case 'urgent':
                return '#FF0000'; // Red
            default:
                return '#FFFFFF'; // White (default)
        }
    }

    // Event listener to close description modal when close button is clicked
    const closeBtn = descriptionModal.querySelector('.close');
    closeBtn.addEventListener('click', () => {
        descriptionModal.style.display = 'none'; // Hide the description modal
    });

    // Event listener to close add description modal if user clicks outside of it
    window.addEventListener('click', (event) => {
        if (event.target === addDescriptionModal) {
            addDescriptionModal.style.display = 'none'; // Hide the add description modal
        }
    });


    
    function sortByRelevance() {
        tasks.sort((a, b) => {
            const relevanceOrder = { 'casual': 3, 'mild': 2, 'urgent': 1 };
            return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
        });
        renderTasks();
    }

    
    function showCompletedTasks() {
        const completedTasks = tasks.filter(task => task.completed);
        renderTasks(completedTasks); // Update this line to call renderTasks instead of renderFilteredTasks
    }

    
    function showIncompleteTasks() {
        const incompleteTasks = tasks.filter(task => !task.completed);
        renderTasks(incompleteTasks);
    }
    

    
    refreshBtn.addEventListener('click', function () {
        switch (currentFilter) {
            case 'sortByCreationTime':
                sortByCreationTime();
                break;
            case 'sortByCompletionStatus':
                sortByCompletionStatus();
                break;
            case 'sortByRelevance':
                sortByRelevance();
                break;
            case 'showCompletedTasks':
                showCompletedTasks();
                break;
            case 'showIncompleteTasks':
                showIncompleteTasks();
                break;
            default:
                renderTasks();
                break;
        }
    });
    
    


});
