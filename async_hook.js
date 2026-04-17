export class AsyncLocalStorage {
  getStore() {}
  run(_, callback) { return callback() }
}
