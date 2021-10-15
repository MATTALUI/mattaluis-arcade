(()=>{
  function displayGames () {
    const registry = JSON.parse(this.responseText);
    const templateSource = document.querySelector('#game-card').innerHTML;
    const template = Handlebars.compile(templateSource);
    document.querySelector('#games').innerHTML = '';
    for (let key in registry){
      const game = registry[key];
      const html = template({ key, ...game});
      document.querySelector('#games').innerHTML += html;
    }
  }

  const req = new XMLHttpRequest();
  req.addEventListener("load", displayGames);
  req.open("GET", "/registry.json");
  req.send();
})();
