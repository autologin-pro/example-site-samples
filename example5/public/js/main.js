// public/js/main.js
$(document).ready(function () {
  // Load todos when page loads
  loadTodos();

  // Add new todo
  $("#todoForm").submit(function (e) {
    e.preventDefault();
    const todo = {
      title: $("#title").val(),
      description: $("#description").val(),
    };

    $.ajax({
      url: "/todos",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(todo),
      success: function (response) {
        loadTodos();
        $("#todoForm")[0].reset();
      },
      error: function (xhr, status, error) {
        alert("Error adding todo: " + error);
      },
    });
  });

  // Load todos function
  function loadTodos() {
    $.ajax({
      url: "/todos",
      method: "GET",
      success: function (todos) {
        $("#todoList").empty();
        todos.forEach(function (todo) {
          $("#todoList").append(`
                        <div class="list-group-item d-flex justify-content-between align-items-center ${todo.completed ? "bg-light" : ""}">
                            <div>
                                <h5 class="mb-1 ${todo.completed ? "text-muted" : ""}">${todo.title}</h5>
                                <p class="mb-1">${todo.description || ""}</p>
                                <small class="text-muted">Created: ${new Date(todo.created_at).toLocaleString()}</small>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-primary edit-todo" data-id="${todo.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger delete-todo" data-id="${todo.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `);
        });
      },
      error: function (xhr, status, error) {
        alert("Error loading todos: " + error);
      },
    });
  }

  // Edit todo
  $(document).on("click", ".edit-todo", function () {
    const todoId = $(this).data("id");
    $.ajax({
      url: `/todos/${todoId}`,
      method: "GET",
      success: function (todo) {
        $("#editId").val(todo.id);
        $("#editTitle").val(todo.title);
        $("#editDescription").val(todo.description);
        $("#editCompleted").prop("checked", todo.completed);
        $("#editModal").modal("show");
      },
    });
  });

  // Save edited todo
  $("#saveEdit").click(function () {
    const todoId = $("#editId").val();
    const todo = {
      title: $("#editTitle").val(),
      description: $("#editDescription").val(),
      completed: $("#editCompleted").is(":checked"),
    };

    $.ajax({
      url: `/todos/${todoId}`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(todo),
      success: function (response) {
        $("#editModal").modal("hide");
        loadTodos();
      },
      error: function (xhr, status, error) {
        alert("Error updating todo: " + error);
      },
    });
  });

  // Delete todo
  $(document).on("click", ".delete-todo", function () {
    if (confirm("Are you sure you want to delete this todo?")) {
      const todoId = $(this).data("id");
      $.ajax({
        url: `/todos/${todoId}`,
        method: "DELETE",
        success: function () {
          loadTodos();
        },
        error: function (xhr, status, error) {
          alert("Error deleting todo: " + error);
        },
      });
    }
  });
});
