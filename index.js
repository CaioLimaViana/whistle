/*
fluxo de codigo:

acesso ao mic

processa a stream

chama processador de palmas

chama processador de notas

chama processador de voz

cria detector de eventos para comandos(executar)

cria detector de eventos para comandos(salvar)

*/

//imports
import {Mic} from "./modules/Mic.js";
import {Analyzer} from "./modules/Analyzer.js";
import {Claps} from "./modules/Claps.js";
import {Pitches} from "./modules/Pitches.js";
import {Voice} from "./modules/Voice.js";
import {Commands} from "./modules/Commands.js";
import {Ui} from "./modules/Ui.js";
import {Configs} from "./modules/Configs.js";

let stream = await Mic.getStream();

Analyzer.startAnalyze(stream,{onClap:Claps.clap,onPitch:Pitches.pitch})

window.addEventListener("app::command",Commands.Processor);


//functions CRUD para os comandos
window.addEventListener("app::createCommand",Commands.createCommand);

window.addEventListener("app::requestCommands",Commands.requestCommands);

window.addEventListener("app::updateCommand",Commands.updateCommand);

window.addEventListener("app::deleteCommand",Commands.deleteCommand);

//tratamento do evento de renderizar a lista de comandos

window.addEventListener("app::commands-ready",Ui.renderCommandsList);

//inicio do app

Ui.setupUi();

Commands.requestCommands();

Voice.startRecorder(stream);



window.addEventListener("app::updateConfigs",Configs.updateConfigs);
window.addEventListener("app::configsAvailable",(event)=>{Configs.updateParams(event,[Analyzer.configs,Claps.configs,Pitches.configs,Voice.configs,Ui.configs])});
window.addEventListener("app::showConfigs",()=>{Ui.populateConfigs([Analyzer.configs,Claps.configs,Pitches.configs,Voice.configs,Ui.configs])});


Configs.getConfigs();