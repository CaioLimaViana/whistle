class MyAudioProcessor extends AudioWorkletProcessor
{
    constructor(options)
    {
        super();
        this._samples = []; //armazenar amostras de audio
        this._mediaMovel = []; //armazenar samples para calculo de media movel
        this.rms = 0;
        this.lock = false;
        this.average = 0;
        this.state = "silence";
        this.silenceCounter = 0;
        
        
        console.log(sampleRate,"hz");
        
        this.port.onmessage = (event)=>{
            this.lock = event.data?.lock;
            if(event.data?.configs) Object.assign(this,event.data?.configs);
        };
    }

    

    VAD(chunk)
    {
        chunk = Array.from(chunk);

        let rms2seg = Math.floor(sampleRate/chunk.length);

        this.rms = Math.sqrt(chunk.reduce((sum,sample)=>sum + sample **2,0)/chunk.length);
        this._mediaMovel.push(this.rms);
        if(this._mediaMovel.length > (this.AverageWindow * rms2seg)) this._mediaMovel.shift();
        this.average = this._mediaMovel.reduce((counter,value)=>counter + value,0)/this._mediaMovel.length;    
        
        //identificar inicio/fim de fala

        if((this.rms > (this.average + this.offsetVoice)) && (this.state === "silence"))
        {
            this.state = "speech";
            //console.log("start speech");
            this.silenceCounter = 0;
        }

        else if((this.rms < (this.average - (this.offsetSilence)))&&(this.state === "speech"))
        {
            this.silenceCounter++;
            if(this.silenceCounter > this.maxSilenceLength * rms2seg)
            {
                this.state = "silence";
                //console.log("stop speech");
                //converte o audio em 16khz
                this.port.postMessage(this._samples);
                this._samples = [];
            }


        }
    }

    process(inputs,outputs,parameters)
    {
        if(this.lock) return true;

        const input = inputs[0][0];
        this.VAD(input);
        
        if(this.state === "speech") this._samples.push(...input);

        return true;
    }

    
}

registerProcessor("my-audio-processor",MyAudioProcessor);