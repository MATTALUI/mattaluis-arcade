(()=>{
  const displayGames = registry => {
    const templateSource = document.querySelector('#game-card').innerHTML;
    const template = Handlebars.compile(templateSource);
    document.querySelector('#games').innerHTML = '';
    for (let key in registry){
      const game = registry[key];
      const html = template({ key, ...game });
      document.querySelector('#games').innerHTML += html;
    };
  }

  fetch('/registry.json').then(res => res.json()).then(displayGames);
})();
