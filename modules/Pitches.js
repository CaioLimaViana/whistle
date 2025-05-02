import { PitchDetector } from "https://esm.sh/pitchy@4";

let configs = {

    clarity:0.97,
    maxDiff:10,
    minFreq:60.
};


let detector = null;

let notes = [];
let prev = 0;

let timerNote = null;

function pitch(timeDomain,sampleRate,length)
{
    if(detector === null) detector =  PitchDetector.forFloat32Array(length);
    let [pitch,clarity] = detector.findPitch(timeDomain,sampleRate);
    pitch = parseInt(pitch);

    if((clarity > configs.clarity) && (pitch > configs.minFreq))
    {
        if(Math.abs(pitch - prev) > configs.maxDiff)
        {
            //console.log(pitch);
            prev = pitch;
            notes.push(pitch);
        }
        if(timerNote !== null) clearTimeout(timerNote);
        timerNote = null;
    }
    else if(timerNote === null)
    {
        timerNote = setTimeout(()=>{
                //processCommands(notes,"notes");
                window.dispatchEvent(new CustomEvent("app::command",{
                    detail:{
                        tipo:"pitch",
                        dados:notes,
                    }
                }));

                notes = [];
                prev = 0;
            },1000); 
    }
}

const Pitches = {
    pitch,
    configs,
};

export {Pitches};