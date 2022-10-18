/**
 * Requisitos
 * - Obtener lista pokedex y guardar en variable ✅
 * - Obtener el listado de todos los pokemons ✅
 * - Obtener todos los pokemons individuales uno por uno ✅
 * - Para obtener todos los pokemons, me dice el ejercicio que debo iterar uno por uno. ✅
 * - Añadir al DOM los pokemons, dentro del div pokedex.
 */

//Constantes y variables globales
const pokedex$$ = document.querySelector("#pokedex");
const VIRTUAL_COLLECTION = [];
let ALL_POKEMONS_INFO = []; 
let requestInCourse = false;
let audioDiv = document.createElement("div");

//Función para hacer fetch a todos los pokemon parametrizando su offset y su limit.
const getAllPokemon = (offset = 0, limit = 150) =>
  fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
    .then((response) => response.json())
    .then((response) => response.results)
    .catch((err) => console.log("Error obteniendo todos los pokemons", err));

//Función para recuperar los datos de cada pokemon individualmente
const getOnePokemon = async (url) =>
  fetch(url)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.log("Error obteniendo pokemon individual", err));

//Función que "pintará" los pokemon.
const renderPokemons = (pokemons) => {
  pokedex$$.innerHTML = "";
  console.log(pokemons);

  pokemons.forEach((poke) => {
    const li$$ = document.createElement("li");
    li$$.classList.add("card");

    const img$$ = document.createElement("img");
    img$$.classList.add("card-image");
    img$$.src = poke.sprites.front_default;
    img$$.alt = poke.name;

    const p$$ = document.createElement("p");
    p$$.classList.add("card-title");
    p$$.textContent = poke.name;

    const h4$$ = document.createElement("h4");
    h4$$.classList.add("idPokemon");
    h4$$.textContent = "ID: " + poke.id;

    const button$$ = document.createElement("button");
    button$$.classList.add("flip-button");
    button$$.textContent = "flip!";

    const div$$ = document.createElement("div");
    div$$.classList.add("card-subtitle");

    if (poke.types.length === 2){
      div$$.textContent = poke.types[0].type.name + " / " + poke.types[1].type.name;
    } else div$$.textContent = poke.types[0].type.name;
     
    li$$.appendChild(h4$$);
    li$$.appendChild(img$$);
    li$$.appendChild(p$$);
    li$$.appendChild(div$$);
    li$$.appendChild(button$$);

    //Añadir la parte de atrás a las cartas con imagen shiny, ataques y descripción
    //Implementar un botón que gire las cartas
    //TODO
    button$$.addEventListener("click", () =>{
      console.log("Funciona");
    });

    //Añadir fondo a los pokemon según su tipo
    li$$.classList.add(poke.types[0].type.name);

    //Añade los gritos de los pokemon
    const cries = "https://play.pokemonshowdown.com/audio/cries/src/" + poke.name + ".wav";

    img$$.addEventListener("click", () => {
      audioDiv.innerHTML = `<audio autoplay="autoplay">
        <source src=${cries} type="audio/x-wav">
      </audio>`;
      document.body.appendChild(audioDiv);
    });

    pokedex$$.appendChild(li$$);
  });
};

//Buscador "live" por nombre //TODO añadir busqueda por ID
const pokeFinder = () => {

  const divFinder$$ = document.createElement("div");
  divFinder$$.classList.add("divFinder");

  const finderDesc$$ = document.createElement("p");
  const finder$$ = document.createElement("input");

  finder$$.setAttribute("type", "text");
  finderDesc$$.textContent = "PokeBuscador";

  finder$$.addEventListener("input", (e) => {
    const value = e.target.value;

    const filtered = ALL_POKEMONS_INFO.filter((pokemon) =>
      pokemon.name.includes(value)
    );

    renderPokemons(filtered);
  });

  divFinder$$.appendChild(finderDesc$$);
  divFinder$$.appendChild(finder$$);
  const header$$ = document.querySelector(".header");
  const logo$$ = document.querySelector(".header__logo");
  header$$.insertBefore(divFinder$$, logo$$);
};

//Función para recuperar pokemon según su región
const fetchPokemonRegion =  async (region) => {
  if(requestInCourse) return;

  const {limit, offset} = regions[region];
  ALL_POKEMONS_INFO = [];
  
  requestInCourse = true;
  const allPokemon = await getAllPokemon(offset, limit);

  //Virtualizamos nuestra colección de pokemon para que solo haga Fetch la primera vez
  //Posteriormente, esos resultados se guardan en el array VIRTUAL_COLLECTION.
  for (const pokemon of allPokemon) {
    const id = pokemon.url.split('/').slice(-2)[0];
    const exist = VIRTUAL_COLLECTION.find(pokemon => pokemon.id === id);
    const pokemonInfo = exist ? exist : await getOnePokemon(pokemon.url);
    if(!exist) VIRTUAL_COLLECTION.push(pokemonInfo);
    ALL_POKEMONS_INFO.push(pokemonInfo);
  }

  requestInCourse = false;
  renderPokemons(ALL_POKEMONS_INFO);
}

//Creamos botones de forma dinámica por cada región añadida en el archivo "helpers"
//Asignamos la funcionalidad anterior a los botones
const addRegionButtons = (regions) => {
  const regionContainer$$ = document.createElement("div");
  regionContainer$$.classList.add("regions-container")
  regions.forEach(region => {
    const button$$ = document.createElement("button");
    button$$.textContent = region;
    button$$.classList.add("regionBtn");
    button$$.addEventListener("click", () => fetchPokemonRegion(region));
    regionContainer$$.appendChild(button$$);

    const header = document.querySelector(".header");
    header.appendChild(regionContainer$$);
  });
}

const run = async () => {
  fetchPokemonRegion('kanto');
  pokeFinder();
  addRegionButtons(Object.keys(regions));
}

window.onload = run;
