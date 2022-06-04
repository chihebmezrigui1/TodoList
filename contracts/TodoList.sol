// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

contract TodoList {
    uint public taskCount = 0;
    struct Task {
        uint id;
        string content;
        bool done;
    }
    mapping(uint => Task) public Tasks;

    event TaskCreated(
        uint id,
        string content,
        bool completed
    );

    event TaskCompleted(
        uint id,
        bool completed
    );

    constructor () public{
        createTask("Blockchain project");
    }

    function createTask(string memory content)public {
        taskCount ++;
        Tasks[taskCount] = Task(taskCount,content,false);
        emit TaskCreated(taskCount, content, false);
    }

    function toggleCompleted(uint id) public {
        Task memory task = Tasks[id];
        task.done = !task.done;
        Tasks[id] = task;
        emit TaskCompleted(id, task.done);
    }

}