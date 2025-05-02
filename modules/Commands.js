function Processor(event)
{    
    //comandos é um array de objetos, cada objeto com um nome (string), comando(array),url(string) e args(objeto) 
    console.log(event.detail);

    let { tipo,dados } = event.detail;

    let commands = [];
    const saved = localStorage.getItem("commands");
    
    if(saved)
    {
        try
        {
            commands = JSON.parse(saved);
        }
        catch(e)
        {
            console.warn("Erro ao ler comandos do localStorage");
        }
    }

    if(commands.length == 0) return;

    //url da lampada do quarto: http://rk322x-box.local:1880/udp?command=8592304set28=T

    for(let i of commands)
    {
        
        let { comando,url,args } = i;
        if(!Array.isArray(comando)) break;

        if(tipo === "claps" && comando.includes("clap") && JSON.stringify(comando) === JSON.stringify(dados))
        {                   
            fetch(url,args);   
        }
        else if(tipo === "pitch" && comando.length === dados.length)
        {
            
            let match = comando.every((t,i)=>{ return Math.abs(t - dados[i]) < 10 });
            if(match == true) fetch(url,args);                        
        }
        else if(tipo === "voice" && comando.length === dados.length)
        {
            if(comando[0] === dados[0]) fetch(url,args);
        }
    }
}

//aqui iniciam as functions CRUD dos comandos

//CREATE
function createCommand(event)
{
    let {comando,url} = event.detail;

    //procura nos comandos se ja existe esse comando,
    let commands = [];
    const stored = localStorage.getItem("commands");

    if(stored)
    {
        try
        {
            commands = JSON.parse(stored);
        }
        catch(e)
        {
            console.warn("Erro ao ler os comandos salvos,", e);
            commands = [];
        }
    }

    const jaExiste = commands.some((i)=>{
       return i.comando === comando && i.url == url;
    });

    if(jaExiste)
    {
        console.warn("comando ja existe, nao sera adicionado novamente.");
        window.alert("comando ja existe, nao sera adicionado novamente.");
        return;
    }

    //se nao existe, adiciona esse comando nos comandos salvos

    commands.push(event.detail);
    localStorage.setItem("commands",JSON.stringify(commands));

    console.log("comando adicionado com sucesso");

    requestCommands();
}

//REQUEST
function requestCommands()
{
    const commands = JSON.parse(localStorage.getItem("commands")) || [];
    window.dispatchEvent(new CustomEvent("app::commands-ready",{detail:{commands}}));
    console.log("comandos atualizados");
    return commands;
}

//UPDATE
function updateCommand(event)
{

    let updatedCommand = event.detail;
    let { uuid } = updatedCommand;

    let commands = JSON.parse(localStorage.getItem("commands"));
    if(!commands) return "sem comandos salvos";
    
    commands = commands.map(command => {
        return command.uuid === uuid? updatedCommand : command;
    });
    
    localStorage.setItem("commands",JSON.stringify(commands));

    console.log("comando atualizado com sucesso");

    requestCommands();
}

//DELETE
function deleteCommand(event)
{

    let { uuid } = event.detail;
    
    let commands = JSON.parse(localStorage.getItem("commands"));
    if(!commands)
    {
        console.warn("sem comandos salvos");
        return;
    }
    commands = commands.filter(command => command.uuid !== uuid);

    localStorage.setItem("commands",JSON.stringify(commands));

    console.log("comando deletado com sucesso");

    requestCommands();
}

const Commands = {
    Processor,
    createCommand,
    requestCommands,
    updateCommand,
    deleteCommand,
};

export {Commands};