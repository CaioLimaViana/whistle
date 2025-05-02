let tamanho = 0;

let analyzer = null;

function startAnalyze(stream,{onClap,onPitch})
{

    const audioContext = new AudioContext();

    const audioSource = audioContext.createMediaStreamSource(stream);

    analyzer = audioContext.createAnalyser();

    analyzer.fftSize = 1024;
    analyzer.minDecibels = -127;
    analyzer.maxDecibels = 0;
    analyzer.smoothingTimeConstant = 0.4;

    audioSource.connect(analyzer);

    const fft = new Uint8Array(analyzer.frequencyBinCount);

    let historico = [];

    const media = new Uint8Array(analyzer.frequencyBinCount);
    const derivada = new Int16Array(analyzer.frequencyBinCount);
    const timeDomain = new Float32Array(analyzer.fftSize);

    tamanho = timeDomain.length;

    setInterval(()=>{
        //salva a fft atual no array fft
        analyzer.getByteFrequencyData(fft);
        analyzer.getFloatTimeDomainData(timeDomain);

        //salva a fft atual no historico
        historico.push(fft.slice());
        if(historico.length > 100) historico.shift();


        //calcula o array com as medias de volumes de cada bin

        for(let i = 0; i < analyzer.frequencyBinCount ;i++) //for relativo ao bin
        {
            let acumulador = 0;

            for(let j = 0; j < historico.length;j++) //for relativo ao historico
            {
                acumulador += historico[j][i]
            }

            media[i] = Math.round(acumulador/historico.length);
        }

        
        //calcula a derivada da fft
        if(historico.length)
        {
            for(let i =0; i < fft.length; i++) derivada[i] = fft[i] - media[i];//derivada[i] = fft[i] - historico[historico.length -1][i];
        }
                    
        
        onClap?.(derivada.slice());
        onPitch?.(timeDomain,audioContext.sampleRate,timeDomain.length);

    },10);
}


const proxy = new Proxy({
        fftSize : 1024,
        minDecibels : -127,
        maxDecibels : 0,
        smoothingTimeConstant : 0.4,
    },{
    get(target,prop)
    {
        if(analyzer)  return analyzer?.[prop];
        else return target[prop];
    },
    set(target,prop,value)
    {
        if(analyzer)
        {
            analyzer[prop] = value;
            target[prop] = value;
            return true;
        }
        return false;
    }
});

const Analyzer = {
    startAnalyze,
    tamanho,
    configs : proxy,
};

export {Analyzer};