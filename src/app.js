
App = {
    loading: false,
    contracts: {},
    load: async () => {
        await App.loadWeb3();
        await App.loadAccout();
        await App.loadContract();
        await App.render();
        web3.eth.defaultAccount = web3.eth.accounts[0];
    },
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
            App.web3Provider = window.ethereum
            web3 = new Web3(window.ethereum)
        } else {
            window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(ethereum)
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccounts(accounts);
            }catch (error) {
                if (error.code === 4001) {
                    console.log("user rejected");
                    // User rejected request
                }
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
        },

    loadAccout: async () =>{
        App.account = web3.eth.accounts[0];
    },
    loadContract: async () =>{
        //create a javascript version of the smart contract
        const todoList = await $.getJSON("TodoList.json");
        App.contracts.TodoList = TruffleContract(todoList);
        App.contracts.TodoList.setProvider(App.web3Provider);
        
        //Hydrate the smart contract with values from the blockchain
        App.todoList = await App.contracts.TodoList.deployed();
    },
    render: async() => {
        if (App.loading){
            return;
        }
        App.setLoading(true);

        //render the account
        $("#account").html(App.account);
        //render the tasks
        await App.renderTasks();

        App.setLoading(false);
    },
    renderTasks:async()=>{
        const taskTemplate = $(".taskTemplate");
        taskCount = await App.todoList.taskCount();

        for(let i=1; i <= taskCount; i++ ){
            const task = await App.todoList.Tasks(i);
            const taskId = task[0].toNumber();
            const taskContent = task[1];
            const taskCompleted = task[2];
            const $newTaskTemplate = taskTemplate.clone();
            $newTaskTemplate.find('.content').html(taskContent);
            $newTaskTemplate.find('input')
                            .prop('name', taskId)
                            .prop('checked', taskCompleted)
                            .on('click', App.toggleCompleted);

            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate);
            } else {
                $('#taskList').append($newTaskTemplate);
            }
            $newTaskTemplate.show()
        }
    },
    setLoading:(boolean)=>{
        App.loading = boolean;
        const loader = $("#loader");
        const content = $("#content");
        if (boolean){
            loader.show();
            content.hide();
        }else{
            loader.hide();
            content.show();
        }
    },
    createTask: async () => {
        App.setLoading(true);
        const content = $('#newTask').val();
        await App.todoList.createTask(content);
        window.location.reload();
    },
    toggleCompleted: async (e) => {
        App.setLoading(true)
        const taskId = e.target.name
        await App.todoList.toggleCompleted(taskId)
        window.location.reload()
    }
}


$(()=>{
    $(window).load(()=>{
        App.load();
    })

})
