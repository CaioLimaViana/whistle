let configs = {
    backgroundImage : "https://media.istockphoto.com/id/1279840008/vector/pixel-art-cyberpunk-metropolis-background.jpg?s=612x612&w=0&k=20&c=ngUv_uxrbqZgh29IROKv2oUYetEx7ONeb7pefdCkKVg=",
};

let proxy = new Proxy(configs,{
    get(target,prop)
    {
        return configs?.[prop];
    },
    set(target,prop,value)
    {
        configs[prop] = value;
        applyConfigs();
        return true;
    }
});

function renderCommandsList(event)
{
    let lista = document.querySelector("#modal-lista");

    const commands = event.detail?.commands;
    
    if(commands.length == 0) lista.innerHTML = " ops, nenhum comando cadastrado.";
    else lista.innerHTML = "";
    
    commands.forEach(command => {
        let comando = document.createElement("span");
        
        comando.innerText = command?.nome;
        comando.addEventListener("click",()=>{
            document.querySelectorAll("dialog").forEach(i=>i.close());
            document.querySelector("#modal-form").show();
            document.querySelector("#modal-form").dataset.mode = "update";
            document.querySelector("#modal-form legend").innerHTML = "Editar comando";
            
            document.getElementById("form-yes").innerHTML = "update";
            document.getElementById("form-no").innerHTML = "delete";
            
            Array.from(document.querySelector("form").elements).forEach((element)=>{
                if(typeof(command[element.name]) !== "object") element.value = command[element.name];
                else element.value = JSON.stringify(command[element.name]);
            });
        });
        lista.appendChild(comando);
    });
}

function setup_menu(){
    document.querySelectorAll("nav > ul > li > button").forEach(button =>{
        button.addEventListener("click",(event)=>{
            
            //oculta todos os modais
            //document.querySelectorAll("dialog").forEach(element=>element.style.display = "none");
            document.querySelectorAll("dialog").forEach(element=>element.close());
            //exibe o modal correspondente\
            let modal_id = event.target.id;
            modal_id = "modal-" + modal_id.split("button-")[1];
            
            let modal = document.getElementById(modal_id);
            
            modal.show();

            if(modal.className !== "hologramFadeIn")modal.className = "hardGlitch";
            modal.addEventListener("animationend",()=>{modal.className = "softGlitch"});  
           
            modal.dataset.mode = "create";
            document.querySelector("#modal-form legend").innerHTML = "Criar comando";
            let form = modal.querySelector("form");
            if(form) 
            {
                Array.from(form.elements).forEach(element=>element.value = "");
                document.querySelector('textarea[name="args"]').style.color = "rgb(176, 255, 251)";
            }
            window.dispatchEvent(new CustomEvent("app::showConfigs"));

            document.getElementById("form-yes").innerHTML = "create";
            document.getElementById("form-no").innerHTML = "cancel";
            
        })
    });
};

function setup_command_rec()
{

    let button = document.querySelector("label > button");
    let textarea = document.querySelector("#identified");
    let modeSelector = document.querySelector("#modeSelector");

    function command_rec(event)
    {
        console.log(modeSelector.value,event.detail.tipo);      
        if(modeSelector.value !== event.detail.tipo) return;

        console.log("gravando comando:",event.detail);
        textarea.value = JSON.stringify(event.detail.dados);
        window.removeEventListener("app::command",command_rec);
    }


    button.addEventListener("click",()=>{
        
        textarea.value = "";
        textarea.placeholder = "aguardando comando...";

        window.addEventListener("app::command",command_rec);
    }); 
}

function setup_args_validation()
{
    let fetch_options = document.querySelector('textarea[name="args"]');

    fetch_options.placeholder = JSON.stringify({
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body: { username: "example" },
    },null,1);

    fetch_options.addEventListener("keyup",()=>{
        
        try
        {
            JSON.parse(fetch_options.value);
            fetch_options.style.color = "green";
        }
        catch(e)
        {
            fetch_options.style.color = "red";
        }

        if(!fetch_options.value.length) fetch_options.style.color = "rgb(176, 255, 251)";
    });
}

function setup_form_buttons()
{
    document.querySelectorAll("form > fieldset > div > button").forEach((button)=>{
        button.addEventListener("click",(event)=>{
            //cancel button
            if(event.target.innerHTML === "cancel")
            {
                //limpa o form
                Array.from(document.querySelector("form").elements).forEach(i=>i.value = "");
                //fecha os modais
                document.querySelectorAll("dialog").forEach(i=>i.close());
                return;
            }

            let obj = {};

            let form = document.querySelector("form");
            Array.from(form.elements).forEach((element)=>{
                //console.log(element);

                if(element.type !== "button") obj[element.name] = element.value;
            });

            //validate form
            if(!obj.nome ||!obj.url || !obj.comando )
            {
                if(!obj.nome) window.alert("nome nescessario");
                if(!obj.url) window.alert("url necessaria");
                if(!obj.comando) window.alert("comando necessario");
                return;
            }


            if(!obj?.uuid)obj.uuid = crypto.randomUUID();

            if(!obj?.args) obj.args = {};
            else obj.args = JSON.parse(obj?.args); 
                
            obj.comando = JSON.parse(obj?.comando);

            let dialog = event.target.closest("dialog");
            let mode = dialog.dataset.mode;

            console.log(mode);
            
            if(event.target.id == "form-no")
            {
                if(mode == "update")
                    window.dispatchEvent(new CustomEvent("app::deleteCommand",{detail:obj}));
                else if(mode == "create")
                    dialog.close();
                    document.getElementById("button-lista").click();
            }
            else if(event.target.id == "form-yes")
            {
                if(mode == "update")
                    window.dispatchEvent(new CustomEvent("app::updateCommand",{detail:obj}));
                else if(mode == "create")
                    window.dispatchEvent(new CustomEvent("app::createCommand",{detail:obj}));
            }

            //limpa o form
            Array.from(dialog.querySelector("form").elements).forEach(i=>i.value = "");
            //fecha os modais
            document.querySelectorAll("dialog").forEach(i=>i.close());
        });
    });
}

function applyConfigs()
{
    if(configs.backgroundImage) document.body.style.backgroundImage = `url("${configs.backgroundImage}")`;
}

function setup_form_configs()
{
    let form = document.querySelector("#modal-configs form");
    
    Array.from(form.elements).forEach((element)=>{
        if(element.tagName === "FIELDSET") return;
        element.addEventListener("change",(event)=>{
            const configs = {};
            Array.from(form.elements).forEach((element)=>{
                if(element.tagName === "FIELDSET") return;
                configs[element.name] = element.value;
            });
            window.dispatchEvent(new CustomEvent("app::updateConfigs",{detail:configs}));

        });
    });
}


function setupUi()
{
    applyConfigs();
    setup_menu();
    setup_command_rec();
    setup_args_validation();
    setup_form_buttons();
    setup_form_configs();

    document.getElementById("modal-lista").className = "hologramFadeIn";
    document.getElementById("button-lista").click();
}

function populateConfigs(configs_list)
{
    let configs_form = document.querySelector("#modal-configs > form");
    let configs = Object.assign({},...configs_list);
    
    Array.from(configs_form.elements).forEach((element)=>{
        if(element.name in configs) 
            {
                element.value = configs[element.name];
            }
    })
}

const Ui = {
    setupUi,
    renderCommandsList,
    populateConfigs,
    configs:proxy,
};

export {Ui};