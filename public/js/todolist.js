// Connexion à socket.io
const socket = io.connect('http://localhost:8080');

const todolistElement = document.getElementById('todolist');
const displayTodolist = (todolist) => {
  if(todolist === []) {
    return;
  }
  todolistElement.innerHTML = '';
  todolist.forEach((todo, index) => {
      todolistElement.insertAdjacentHTML('afterbegin',`<li><button class='delete-btn' data-index=${index} onclick=deleteTodo(${index}) >✘</button> ${todo}</li>`);
  });
}
// On demande le pseudo, on l'envoie au serveur et on l'affiche dans le titre
const pseudo = prompt('Quel est votre pseudo ?');
socket.emit('new_client', pseudo);
document.title = pseudo + ' - ' + document.title;

socket.on('updateList', function(todolist) {
  displayTodolist(todolist);
});

//Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
const todoForm = document.getElementById('todo-form');
todoForm.onsubmit = function () {
  const newTodo = document.getElementById('newtodo');
  socket.emit('addTodo', newTodo.value); // Transmet le todo aux autres
  newTodo.value = '';
  return false; // Permet de bloquer l'envoi "classique" du formulaire
};

const deleteTodo = (index) => {
  console.log(index);
  socket.emit('deleteTodo', index);
}

const historic = document.getElementById('historic');
// Quand un nouveau client se connecte, on affiche l'historique
socket.on('new_client', function(pseudo) {
  historic.insertAdjacentHTML('afterbegin', '<p><em>' + pseudo + ' a rejoint la Todolist !</em></p>');
  const deleteButtons = document.querySelectorAll('.delete-btn');
})
// Quand on reçoit un todo, on l'insère dans la liste
socket.on('newEvent', function(data) {
  displayTodolist(data.list);
  historic.insertAdjacentHTML('afterbegin',`<p><em>${data.event} de **${data.todo}** par ${data.pseudo}</em></p>`);
});
