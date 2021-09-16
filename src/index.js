const express = require('express')
const cors = require('cors')

const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function findTodoById(todos, id) {
  const todo = todos.find(todo => todo.id === id)

  return todo
}

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  user = users.find(user => user.username === username)

  if (!user) {
    response.status(404).json({ error: 'User not found' })
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  existentUser = users.find(user => user.username === username)

  if (existentUser) {
    return response.status(400).json({ error: 'User already exists' })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(200).json(newUser)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.status(200).json(user.todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  todo = findTodoById(user.todos, id)

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  todo.title = title
  todo.deadline = new Date(deadline)

  return response.status(200).json(todo)
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  todo = findTodoById(user.todos, id)

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  todo.done = true

  return response.status(200).json(todo)
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = findTodoById(user.todos, id)

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  // splice
  user.todos.splice(todoIndex, 1)

  return response.status(204).send()
})

module.exports = app
