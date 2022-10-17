/**
 * Requisitos
 * - Obtener lista pokedex y guardar en variable ✅
 * - Obtener el listado de todos los pokemons ✅
 * - Obtener todos los pokemons individuales uno por uno ✅
 * - Para obtener todos los pokemons, me dice el ejercicio que debo iterar uno por uno. ✅
 * - Añadir al DOM los pokemons, dentro del div pokedex.
 */

const pokedex$$ = document.querySelector("#pokedex");
const VIRTUAL_COLLECTION = [];
let ALL_POKEMONS_INFO = []; // Cuando una variable se declara en scope global para ser usada por otros, se hace en mayúsculas.
let requestInCourse = false;

const getAllPokemon = (offset = 0, limit = 150) =>
  fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`)
    .then((response) => response.json())
    .then((response) => response.results)
    .catch((err) => console.log("Error obteniendo todos los pokemons", err));

const getOnePokemon = async (url) =>
  fetch(url)
    .then((response) => response.json())
    .then((response) => {
      return response;
    })
    .catch((err) => console.log("Error obteniendo pokemon individual", err));

let audioDiv = document.createElement("div");
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
    const h4$$ = document.createElement("h4");
    h4$$.classList.add("idPokemon");
    +p$$.classList.add("card-title");
    p$$.textContent = poke.name;
    h4$$.textContent = "ID: " + poke.id;

    const div$$ = document.createElement("div");
    div$$.classList.add("card-subtitle");

    if (poke.types.length === 2) div$$.textContent = poke.types[0].type.name + " / " + poke.types[1].type.name;
    else div$$.textContent = poke.types[0].type.name;
    li$$.appendChild(h4$$);
    li$$.appendChild(img$$);
    li$$.appendChild(p$$);
    li$$.appendChild(div$$);

    //Añadir fondo a los pokemon según su tipo
    li$$.classList.add(poke.types[0].type.name);

    //Añade los gritos de los pokemon
    const cries =
      "https://play.pokemonshowdown.com/audio/cries/src/" + poke.name + ".wav";

    img$$.addEventListener("click", () => {
      audioDiv.innerHTML = `<audio autoplay="autoplay">
        <source src=${cries} type="audio/x-wav">
      </audio>`;
      document.body.appendChild(audioDiv);
    });

    //función para girar las tarjetas

    const cardBack = () => {
      setTimeout(() => {
        //li$$.classList.remove("card");
        li$$.classList.add("card-back");
        console.log("Evento funcionando");
      }, 2000);
    };

    li$$.addEventListener("click", cardBack);

    pokedex$$.appendChild(li$$);
  });
};

const pokeFinder = () => {
  const divFinder$$ = document.createElement("div");
  divFinder$$.classList.add("divFinder");
  const finderDesc$$ = document.createElement("p");
  const finder$$ = document.createElement("input");
  finder$$.setAttribute("type", "text");
  finderDesc$$.textContent = "PokeBuscador";

  finder$$.addEventListener("input", (e) => {
    const value = e.target.value;

    //buscar si hay resultados que coincidan por su nombre en el arrau ALL pokemons
    //Si hay resuiltados, borro el contenido del div pokedex y los sustituyo por los del filtro
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

const johto = document.querySelector(".johto");
const hoenn = document.querySelector(".hoenn");

const fetchPokemonRegion =  async (region) => {
  if(requestInCourse) return;

  const {limit, offset} = regions[region];
  ALL_POKEMONS_INFO = [];
  
  requestInCourse = true;
  const allPokemon = await getAllPokemon(offset, limit);

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
