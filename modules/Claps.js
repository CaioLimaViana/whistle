//função de detecção de palmas

let configs = {
    
    MIN_BIN_INCREMENT : 50,
    MIN_PERCENT_TRIGGER : 0.85,
};



let claps = 0;
let clapBorder = 0;
let timerClap = null;

function clap(derivada)
{
    let acumulador = 0;
    for(let i = 0;i < derivada.length;i++)
    {
        if(derivada[i] > configs.MIN_BIN_INCREMENT) acumulador++;
    }
    let percentual = acumulador / derivada.length;
    if(percentual > configs.MIN_PERCENT_TRIGGER)
    {
        clapBorder = 1;
    }
    else if(clapBorder === 1)
    {
        claps++;
        clapBorder = 0;

        if(timerClap !== null) clearTimeout(timerClap);
        timerClap = setTimeout(()=>{
            
            let saida = new Array(claps);
            saida.fill("clap");
            
            window.dispatchEvent(new CustomEvent("app::command",{
                detail:{
                    tipo:"claps",
                    dados:saida,
                }
            }));
            claps = 0;
        },500);
    }
}

const Claps = {
    clap,
    configs,
};

export {Claps};
