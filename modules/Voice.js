
//captura da stream

let configs = {
    wakewordSound: "",
    wakeword : "nenhum",

    offsetVoice : 0.03,
    offsetSilence : 0.00,
    maxSilenceLength : 0.3,
    AverageWindow : 5,
};

const handler = {};

let proxy = new Proxy(configs,handler);

async function startRecorder(stream)
{

    let mode = "wakeword";

    const worker = new Worker("./modules/voice-worker.js",{type:'module'});

    worker.onmessage = (e)=>{
        const { type,result } = e.data;
        console.log(result);
        if(type == "wakeword" && result == configs.wakeword)
        {
            mode = "ASR";
            let audio = new Audio();
            audio.src = configs.wakewordSound;
            if(audio.src !== "")
            {
                audio.play();
                audio.onended = ()=>{
                    workletNode.port.postMessage({lock:false});
                    console.log("fale o comando");
                };
            }
            workletNode.port.postMessage({lock:true});

        }
        else if(type == "ASR")
        {
            mode = "wakeword";
            let saida = new Array(result);
            window.dispatchEvent(new CustomEvent("app::command",{
                detail:{
                    tipo:"voice",
                    dados:saida,
                }
            }));
        }
    
    };
 
    const audioContext = new AudioContext();

    const sourceNode = audioContext.createMediaStreamSource(stream);

    await audioContext.audioWorklet.addModule("./modules/voice-worklet.js");

    const workletNode = new AudioWorkletNode(audioContext,"my-audio-processor");
    workletNode.port.postMessage({configs});

    sourceNode.connect(workletNode);
    workletNode.connect(audioContext.destination);

    workletNode.port.onmessage = async (event)=>{
        let audioData = new Float32Array(event.data);

        //conversao para 16khz
        const duration = Math.ceil((audioData.length / audioContext.sampleRate) * 16000);
        
        const offlineCtx = new OfflineAudioContext({
            numberOfChannels: 1,
            length: duration,
            sampleRate:16000
        });

        const audioBuffer = offlineCtx.createBuffer(1,audioData.length,audioContext.sampleRate);
        audioBuffer.copyToChannel(audioData,0);

        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start();

        const renderedBuffer = await offlineCtx.startRendering();
        audioData = renderedBuffer.getChannelData(0);
        
        worker.postMessage({ type: mode, audio: audioData }, [audioData.buffer]);
    };

    
    handler.set = function(target,prop,value)
        {
            target[prop] = value;
            workletNode.port.postMessage({configs:target});
            return true;
        }
    


    
}



const Voice = {
    startRecorder,
    configs:proxy,
};

export {Voice};