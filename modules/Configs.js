function getConfigs()
{
    let configs = localStorage.getItem("configs");
    try
    {
        configs = JSON.parse(configs);
        if(configs) window.dispatchEvent(new CustomEvent("app::configsAvailable",{detail:configs}));
    }
    catch(error)
    {
        console.error("configuracoes possivelmente corrompidas, reincializando configuracoes");
        localStorage.setItem("configs",JSON.stringify({}));
    }

}


function updateConfigs(event)
{
    const configs = event.detail;

    try
    {
        let parsed_configs = JSON.stringify(configs);
        localStorage.setItem("configs",parsed_configs);
        window.dispatchEvent(new CustomEvent("app::configsAvailable",{detail:configs}));      
    }
    catch(error)
    {
        console.error("erro de sintaxe nas configs novas:", error);
        return;
    }
}

function updateParams(event,configs_list)
{
    
    let configs = event.detail;
    configs_list.forEach((configObject)=>{
        Object.entries(configs).forEach(([key,value])=>{
            if(key in configObject) configObject[key] = value;
        });
    });

}

const Configs = {
    getConfigs,
    updateConfigs,
    updateParams,
}

export {Configs};
