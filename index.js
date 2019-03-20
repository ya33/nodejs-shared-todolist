const express = require('express')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
const todolist = [];

app.use(express.static('public'));
app.get('/', function (req, res) {
  res.render('todo.ejs', {todolist: todolist});
})
.use(function(req, res, next){
  res.redirect('/');
});

io.sockets.on('connection', function (socket, pseudo) {
    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('new_client', function(pseudo) {
        socket.pseudo = ent.encode(pseudo);
        socket.emit('updateList', todolist)
        socket.broadcast.emit('new_client', socket.pseudo);
    });

    // Dès qu'on ajoute un todo, on l'ajoute à la liste, on update et on transfère les données aux autres
    socket.on('addTodo', function (todo) {
        todo = ent.encode(todo);
        todolist.push(todo);
        socket.emit('updateList', todolist);
        socket.broadcast.emit('newEvent', {pseudo: socket.pseudo, todo: todo, list: todolist, event: 'Ajout'});
    });

    // Dès qu'on supprime un todo, on le supprime de la liste, on update et on transfère les données aux autres
    socket.on('deleteTodo', function (index) {
      const todo = todolist[index];
      todolist.splice(index,1);
      socket.emit('updateList', todolist)
      socket.broadcast.emit('newEvent', {pseudo: socket.pseudo, todo: todo, list: todolist, event: 'Suppression'});

    })

  });

server.listen(8080);
