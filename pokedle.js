let cpuPkmn;
async function fetchData(userInput){
    //get player pokemon info
    try{
        const playerChoice = document.getElementById(userInput).value.toLowerCase().replaceAll(" ","-");
        const ping = await fetch(`https://pokeapi.co/api/v2/pokemon/${playerChoice}`);
        if(!ping.ok){
            throw new Error("Could not load player choice");
        }

        const data = await ping.json();
        
        console.log("player choice = "+data.name);
        console.log(data);

        return data;

    }catch(error){
        console.error(error);
    }
}

async function randomPick(){
    try{
        //pick name from pokemonNames.json
        const fromFile = await fetch(`pokemonNames.json`);
        if(!fromFile.ok){
            throw new Error("Could not load pokemonNames.json");
        }
        const pokemonFromFile = await fromFile.json();
        const index = Math.floor(Math.random()*pokemonFromFile.length);
        const pokemonChosen = pokemonFromFile[index].replaceAll(" ","-");

        //fetch pokemon from api
        const ping = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonChosen}`);
        if(!ping.ok){
            randomPick();
            throw new Error("Could not load random choice");
        }
        const randomPokemon = await ping.json();

        console.log("Random pokemon = "+randomPokemon.name);
        console.log(randomPokemon);

        cpuPkmn = randomPokemon;

    }catch(error){
        console.error(error);
    }
}


async function getGeneration(pokemon){
    try{
        const ping = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}/`);
        if(!ping.ok){
            throw new Error("Could not load generation of "+pokemon);
        }
        const json = await ping.json();
        console.log("Generation of "+pokemon+" =");
        console.log(json);

        const map = {
            "generation-i": 1,
            "generation-ii": 2,
            "generation-iii": 3,
            "generation-iv": 4,
            "generation-v": 5,
            "generation-vi": 6,
            "generation-vii": 7,
            "generation-viii": 8,
            "generation-ix": 9,
        };

        return map[json.generation.name];


    }catch(error){
        console.error(error);
    }
}

function getType(pokemon){
    const pokemonTypes = pokemon.types.map(t => t.type.name);
    return pokemonTypes;
}

async function getRegion(pokemon){
    try{
        const ping = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}/`);
        if(!ping.ok){
            throw new Error("Could not load region");
        }
        const species = await ping.json();
        const regionUrl = await fetch(species.generation.url);
        const region = await regionUrl.json();


        return region.main_region.name;
        
    }catch(error){
        console.error(error);
    }
}

function generateSprite(){
    const imgElement = document.getElementById("pokemonSprite");
    const pokemonSprite = cpuPkmn.sprites.front_default;
    imgElement.src = pokemonSprite;
    imgElement.style.display = "block";

}

async function compare(userInput){
    const result = document.getElementById("result");
    const input = document.getElementById(userInput);
    const userPkmn = await fetchData(userInput);
    let correct = false;

    //compare name
    if(cpuPkmn.name == userPkmn.name){
        result.textContent="Correct! You Win!";
        correct = true;

    }else{
        result.textContent="Wrong! Try Again";
    }

    //show sprite if correct
    if(correct){
        generateSprite(cpuPkmn);
    }

    //compare height
    let heightText;
    if (cpuPkmn.height > userPkmn.height) {
        heightText = `Height: Taller than ${userPkmn.height / 10}m`;
    } else if (cpuPkmn.height < userPkmn.height) {
        heightText = `Height: Shorter than ${userPkmn.height / 10}m`;
    } else {
        heightText = `Height: Correct ${userPkmn.height / 10}m`;
    }

    //compare type
    let cpuType = await getType(cpuPkmn);
    let userType = await getType(userPkmn);
    let typeText;
    if (cpuType[0] === userType[0] && cpuType[1] === userType[1]) {
        typeText = `Type: ${userType.join(" / ")}`;
    } else if (cpuType.includes(userType[0]) || cpuType.includes(userType[1])) {
        typeText = `Type: (partial match) ${userType.join(" / ")}`;
    } else {
        typeText = `Type: Not ${userType.join(" or ")}`;
    }

    //compare generation
    let cpuGen = await getGeneration(cpuPkmn.name);
    let userGen = await getGeneration(userPkmn.name);
    let genText;
    if (cpuGen === userGen) {
        genText = `Generation: ${userGen}`;
    } else if (cpuGen < userGen) {
        genText = `Generation: (too high) ${userGen}`;
    } else {
        genText = `Generation: (too low) ${userGen}`;
    }

    //compare region
    let userRegion = await getRegion(userPkmn.name);
    let cupRegion = await getRegion(cpuPkmn.name);
    let regionText;
    if (userRegion === cupRegion) {
        regionText = `Region: (correct) ${userRegion}`;
    } else {
        regionText = `Region: (wrong) ${userRegion}`;
    }


    //save history of previous attempts
    const history = document.getElementById("history");
    const row = document.createElement("div");
    row.className = "guess";
    row.innerHTML = `
        <img src="${userPkmn.sprites.front_default}" alt="${userPkmn.name} sprite" style="width: 100px; height: 100px;">
        <p>${heightText}</p>
        <p>${typeText}</p>
        <p>${genText}</p>
        <p>${regionText}</p>
        <hr>
    `;

    history.prepend(row);

    input.value = "";
    input.focus();




}