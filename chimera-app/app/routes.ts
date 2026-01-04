import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from '@react-router/dev/routes'

export default [
  layout('components/layouts/layout.tsx', [
    index('./routes/index.tsx'),

    route('login', './routes/auth/login.tsx'),
    route('auth/auth0/callback', './routes/auth/auth0.callback.tsx'),
    route('auth/auth0', './routes/auth/auth0.tsx'),
    route('auth/logout', './routes/auth/logout.tsx'),

    route('account', './routes/account/index.tsx', [
      route('settings', './routes/account/settings.tsx'),
      route('general', './routes/account/general.tsx'),
      route('password', './routes/account/password.tsx'),
      route('delete', './routes/account/delete.tsx'),
      route('memo/settings', './routes/account/memo.settings.tsx'),
    ]),

    route('todos', './routes/todos/index.tsx', [
      route('task', './routes/todos/task.create.tsx'),
      route('bar', './routes/todos/todo-bar.create.tsx'),

      route(':todoId', './routes/todos/todo.tsx'),
      route(':todoId/delete', './routes/todos/todo.delete.tsx'),
    ]),

    ...prefix('memos', [
      layout('routes/memos/layout.tsx', [
        index('./routes/memos/index.tsx'),
        route(':memoId', './routes/memos/memo.tsx'),
        route(':memoId/delete', './routes/memos/memo.delete.tsx'),
      ]),
    ]),

    route('events', './routes/events/index.tsx', [
      route(':eventId', './routes/events/event.tsx'),
      route(':eventId/delete', './routes/events/event.delete.tsx'),
      route('todos/:todoId', './routes/events/todo.tsx'),
      route('memos/:memoId', './routes/events/memo.tsx'),
    ]),

    ...prefix('daily-notes', [
      layout('./routes/daily-notes/layout.tsx', [
        index('./routes/daily-notes/index.tsx'),
      ]),
    ]),

    ...prefix('reminders', [
      layout('./routes/reminders/layout.tsx', [
        index('./routes/reminders/index.tsx'),
      ]),
    ]),

    ...prefix('api', [
      ...prefix('todos', [
        route(':todoId', './routes/todos/api.todo.tsx'),
        route(':todoId/position', './routes/todos/api.todo.position.tsx'),
      ]),
      ...prefix('memos', [
        route(':memoId', './routes/memos/api.memo.tsx'),
        route(':memoId/position', './routes/memos/api.memo.position.tsx'),
      ]),
      ...prefix('events', [route(':eventId', './routes/events/api.event.tsx')]),
    ]),
  ]),
] satisfies RouteConfig
