class TodoApp {
  constructor() {
    this.tasks = [];
    this.selectedTaskId = null;
    this.initializeElements();
    this.attachEventListeners();
    this.loadTasks();
  }

  initializeElements() {
    this.taskList = document.getElementById('taskList');
    this.taskDetails = document.getElementById('taskDetails');
    this.modal = document.getElementById('newTaskModal');
    this.addTaskBtn = document.getElementById('addTaskBtn');
    this.saveTaskBtn = document.getElementById('saveTask');
    this.cancelTaskBtn = document.getElementById('cancelTask');
    this.newTaskName = document.getElementById('newTaskName');
    this.newTaskDescription = document.getElementById('newTaskDescription');
    this.colorOptions = document.querySelectorAll('.color-option');
  }

  attachEventListeners() {
    this.addTaskBtn.addEventListener('click', () => this.openModal());
    this.saveTaskBtn.addEventListener('click', () => this.saveTask());
    this.cancelTaskBtn.addEventListener('click', () => this.closeModal());
    this.colorOptions.forEach(option => {
      option.style.backgroundColor = option.dataset.color;
      option.addEventListener('click', () => this.selectColor(option));
    });
  }

  loadTasks() {
    fetch('https://todo-app-backend-3vg4.onrender.com/api/tasks')
      .then(response => response.json())
      .then(data => {
        this.tasks = data;
        this.renderTasks();
      })
      .catch(error => console.error('Error loading tasks:', error));
  }

  saveTask() {
    const name = this.newTaskName.value.trim();
    const description = this.newTaskDescription.value.trim();
    const selectedColor = document.querySelector('.color-option.selected');

    if(!name || !selectedColor) {
      alert('Please fill in the task name and select a color');
      return
    }

    const task = {
      description: name,
      completed: false
    };

    fetch('https://todo-app-backend-3vg4.onrender.com/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    })
    .then(response => response.json())
    .then(createdTask => {
      this.tasks.push(createdTask);
      this.renderTasks();
      this.closeModal();
    })
    .catch(error => console.error('Error saving task:', error));
  }
  

  openModal() {
    this.modal.classList.add('active');
    this.newTaskName.value = '';
    this.newTaskDescription.value = '';
    this.colorOptions.forEach(option => option.classList.remove('selected'));
  }

  closeModal() {
    this.modal.classList.remove('active');
  }

  selectColor(option) {
    this.colorOptions.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');
  }

  saveTask() {
    const name = this.newTaskName.value.trim();
    const description = this.newTaskDescription.value.trim();
    const selectedColor = document.querySelector('.color-option.selected');

    if (!name || !selectedColor) {
      alert('Please fill in the task name and select a color');
      return;
    }

    const task = {
      id: Date.now(),
      name,
      description,
      color: selectedColor.dataset.color,
      completed: false
    };

    this.tasks.push(task);
    this.saveTasks();
    this.renderTasks();
    this.closeModal();
  }

  renderTasks() {
    this.taskList.innerHTML = '';
    this.tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.className = `task-item ${task.completed ? 'task-completed' : ''} ${
        task.id === this.selectedTaskId ? 'selected' : ''
      }`;
      taskElement.innerHTML = `
        <div class="task-color" style="background-color: ${task.color}"></div>
        <span class="task-name">${task.name}</span>
      `;
      taskElement.addEventListener('click', () => this.selectTask(task));
      this.taskList.appendChild(taskElement);
    });
  }

  selectTask(task) {
    this.selectedTaskId = task.id;
    this.renderTasks();
    this.renderTaskDetails(task);
  }

  renderTaskDetails(task) {
    this.taskDetails.innerHTML = `
      <div class="task-details">
        <h2 style="border-color: ${task.color}">${task.name}</h2>
        <div class="description">
          <p>${task.description || 'No description provided'}</p>
        </div>
        <button onclick="todoApp.toggleTaskStatus(${task.id})">
          ${task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
        </button>
      </div>
    `;
  }

  toggleTaskStatus(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if(task) {
      const updatedStatus = {completed: !task.completed};

      fetch('https://todo-app-backend-3vg4.onrender.com/api/tasks/${taskId}/status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedStatus)
      })
      .then(response => response.json())
      .then(updatedTask => {
          task.completed = updatedTask.completed;
          this.saveTasks(); // Optionally save locally if needed
          this.renderTasks();
          this.renderTaskDetails(task);
      })
      .catch(error => console.error('Error updating task status:', error));
    }
  }

  deleteTask(taskId) {
    fetch('https://todo-app-backend-3vg4.onrender.com/api/tasks/${taskId}', {
        method: 'DELETE'
    })
    .then(() => {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    })
    .catch(error => console.error('Error deleting task:', error));
  }
}

// Initialize the app
window.todoApp = new TodoApp();