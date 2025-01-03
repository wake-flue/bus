const todoService = require("../services/todoService");
const BaseController = require("./baseController");

class TodoController extends BaseController {
    constructor() {
        super(todoService);
    }
}

module.exports = new TodoController();
