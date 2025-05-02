
async function getStream()
{
    let stream = await navigator.mediaDevices.getUserMedia({audio:true});
    return stream;
}

const Mic = {
    getStream
}

export {Mic};