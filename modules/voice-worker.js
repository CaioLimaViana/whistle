import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.0';

const pipeWakeWord = await pipeline('audio-classification', 'Xenova/ast-finetuned-speech-commands-v2');
const pipeASR = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');

self.onmessage = async (e)=>{
    const { audio,type } = e.data;
    //console.log("audio recebido:",e.data);
    try
    {
        if(type === "wakeword")
        {
            const output = await pipeWakeWord(audio);
            if(output[0]?.score > 0.2)self.postMessage({type:'wakeword',result:output[0]?.label});

        }
        else if(type === "ASR")
        {
            const output = await pipeASR(audio,{ language: 'portuguese', task: 'transcribe' });
            self.postMessage({type:"ASR",result:output?.text});
        }
    }
    catch(err)
    {
        console.warn(err.message);
    }

};